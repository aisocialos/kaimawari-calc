// 買いまわり計算機の画面処理（お買い物マラソン・楽天スーパーSALE 共通）
(function () {
  const CFG = window.SITE_CONFIG;
  // ページごとのキャンペーン（<body data-campaign="…">）。指定がなければお買い物マラソン
  const CAMPAIGN_KEY = document.body.dataset.campaign || "marathon";
  const CAMP = CFG.campaigns[CAMPAIGN_KEY];
  const C = window.KaimawariCalc;
  const STORAGE_KEY = CAMPAIGN_KEY === "marathon" ? "kaimawari-v1" : "kaimawari-" + CAMPAIGN_KEY + "-v1";
  const SEARCH_URL = "https://search.rakuten.co.jp/search/mall/1000%E5%86%86%E3%83%9D%E3%83%83%E3%82%AD%E3%83%AA%2B%E9%80%81%E6%96%99%E7%84%A1%E6%96%99/";
  const TAX_RATES = [10, 8];
  const SUFFIX = CAMPAIGN_KEY === "marathon" ? "" : "-" + CAMPAIGN_KEY;
  const EDIT_EVENT = "calc-edit" + SUFFIX;
  const CLICK_EVENT = "rakuten-click" + SUFFIX;
  // 入力例（説明用の数字）
  const SAMPLE_ITEMS = [
    { shop: "ショップA（日用品）", price: 3980, taxRate: 10 },
    { shop: "ショップB（お米）", price: 4280, taxRate: 8 },
    { shop: "ショップC（コーヒー）", price: 1580, taxRate: 8 },
    { shop: "ショップD（靴下）", price: 990, taxRate: 10 },
  ];

  const yen = (n) => Math.round(n).toLocaleString("ja-JP") + "円";
  const pt = (n) => Math.round(n).toLocaleString("ja-JP") + "pt";
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const track = (name) => { if (typeof window.trackEvent === "function") window.trackEvent(name); };

  // 保存したキャンペーン条件は、config.js の条件が変わったら捨てる（次の開催回の条件を反映するため）
  const CAMPAIGN_BASE = JSON.stringify(CAMP);
  function fresh() {
    return { items: SAMPLE_ITEMS.map((x) => ({ ...x })), campaign: { ...CAMP } };
  }
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (s && Array.isArray(s.items)) {
        const keep = s.campaign && s.campaignBase === CAMPAIGN_BASE;
        return { items: s.items, campaign: keep ? s.campaign : { ...CAMP } };
      }
    } catch (e) { /* 読めないときは入力例を使う */ }
    return fresh();
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, campaignBase: CAMPAIGN_BASE })); } catch (e) { /* 保存できなくても計算は続ける */ }
  }
  let state = load();

  function campaign() {
    const c = state.campaign;
    return { ...c, pointCap: Number(c.pointCap) || 0, minShopAmountTaxIn: Number(c.minShopAmountTaxIn) || 0, maxMultiplier: Math.max(1, Number(c.maxMultiplier) || 1) };
  }

  function renderRows() {
    const body = document.getElementById("rows");
    body.innerHTML = state.items.map((it, i) => `
      <tr>
        <td><input aria-label="ショップ名 ${i + 1}" data-i="${i}" data-k="shop" type="text" value="${esc(it.shop)}"></td>
        <td class="n"><input aria-label="金額 ${i + 1}" data-i="${i}" data-k="price" type="number" min="0" step="1" inputmode="numeric" value="${esc(it.price)}"></td>
        <td><select aria-label="税率 ${i + 1}" data-i="${i}" data-k="taxRate">${TAX_RATES.map((r) => `<option value="${r}"${Number(it.taxRate) === r ? " selected" : ""}>${r}%</option>`).join("")}</select></td>
        <td><button type="button" class="ghost" data-remove="${i}" aria-label="${i + 1}行目を削除">×</button></td>
      </tr>`).join("");
    document.getElementById("cap").value = state.campaign.pointCap;
    document.getElementById("minShop").value = state.campaign.minShopAmountTaxIn;
    document.getElementById("maxMul").value = state.campaign.maxMultiplier;
  }

  function renderResult() {
    const camp = campaign();
    const s = C.summarize(state.items, camp);
    const rate = s.totalTaxIn > 0 ? (s.bonus / s.totalTaxIn) * 100 : 0;
    document.getElementById("kpis").innerHTML = `
      <div class="kpi"><span>達成ショップ数</span><b>${s.countedShops}店</b></div>
      <div class="kpi"><span>倍率</span><b>${s.multiplier}倍</b></div>
      <div class="kpi"><span>買いまわりポイント</span><b>${pt(s.bonus)}</b><small>期間限定・上限 ${pt(camp.pointCap)}</small></div>
      <div class="kpi"><span>購入合計（税込）</span><b>${yen(s.totalTaxIn)}</b><small>特典分の還元 ${rate.toFixed(1)}%</small></div>`;

    const lines = [];
    const taxIn = (taxEx) => Math.ceil(taxEx * (100 + camp.defaultTaxRate) / 100);
    if (s.capReached) {
      lines.push(`<p class="good">上限の ${pt(camp.pointCap)} に届いています。これ以上買っても、買いまわり分のポイントは増えません。</p>`);
    } else if (s.countedShops < camp.maxMultiplier) {
      const gain = C.nextShopGain(state.items, camp, camp.minShopAmountTaxIn, camp.defaultTaxRate);
      lines.push(`<p><b>あと1店：</b>新しいショップで ${yen(camp.minShopAmountTaxIn)}（税込）の商品を1つ買うと、買いまわりポイントが <b>+${pt(gain)}</b> 増えます。</p>`);
    }
    if (!s.capReached && s.roomBeforeCapTaxEx !== null) {
      lines.push(`<p><b>上限まで：</b>今の ${s.multiplier}倍のままなら、あと税抜 ${yen(s.roomBeforeCapTaxEx)}（税込 約${yen(taxIn(s.roomBeforeCapTaxEx))}）買うまでは、買った分だけポイントが増えます。</p>`);
    }
    if (s.multiplier <= 1) {
      lines.push(`<p>1,000円以上のショップが2店以上になると、倍率が2倍以上になります。</p>`);
    }
    const short = s.shops.filter((x) => !x.counted && x.taxIn > 0);
    if (s.unnamedRows > 1) {
      lines.push(`<p class="warn">店名が空の行が ${s.unnamedRows} 行あります。まとめて1ショップとして数えているので、別のショップなら店名を入れてください。</p>`);
    }
    if (short.length) {
      lines.push(`<p class="warn">${short.map((x) => `「${esc(x.name || "店名なし")}」はあと ${yen(x.shortfall)} で1店に数えられます`).join("。")}。</p>`);
    }
    document.getElementById("advice").innerHTML = lines.join("");

    document.getElementById("shops").innerHTML = s.shops.length
      ? `<h3>ショップ別</h3><ul class="shoplist">${s.shops.map((x) => `<li><span>${esc(x.name || "（店名なし）")}</span><span class="num">${yen(x.taxIn)}</span><span class="badge ${x.counted ? "ok" : "ng"}">${x.counted ? "1店に数える" : "あと " + yen(x.shortfall)}</span></li>`).join("")}</ul>`
      : `<p class="note">商品を入力すると、ショップ別の判定が出ます。</p>`;
  }

  function renderAll() { renderRows(); renderResult(); }

  document.getElementById("rows").addEventListener("input", (e) => {
    const i = e.target.dataset.i, k = e.target.dataset.k;
    if (i === undefined) return;
    state.items[i][k] = k === "shop" ? e.target.value : e.target.value === "" ? "" : Number(e.target.value);
    renderResult(); save(); track(EDIT_EVENT);
  });
  document.getElementById("rows").addEventListener("click", (e) => {
    const i = e.target.dataset.remove;
    if (i === undefined) return;
    state.items.splice(Number(i), 1); renderAll(); save(); track(EDIT_EVENT);
  });
  document.getElementById("add").addEventListener("click", () => {
    state.items.push({ shop: "", price: "", taxRate: CAMP.defaultTaxRate });
    renderAll(); save();
    const inputs = document.querySelectorAll('#rows input[data-k="shop"]');
    inputs[inputs.length - 1].focus();
  });
  document.getElementById("reset").addEventListener("click", () => { state = fresh(); renderAll(); save(); });
  document.getElementById("clear").addEventListener("click", () => {
    state.items = [{ shop: "", price: "", taxRate: CAMP.defaultTaxRate }]; renderAll(); save();
  });
  for (const [id, key] of [["cap", "pointCap"], ["minShop", "minShopAmountTaxIn"], ["maxMul", "maxMultiplier"]]) {
    document.getElementById(id).addEventListener("input", (e) => { state.campaign[key] = e.target.value; renderResult(); save(); track(EDIT_EVENT); });
  }
  const link = document.getElementById("find-link");
  link.href = CFG.rakutenFindLink || SEARCH_URL;
  link.addEventListener("click", () => track(CLICK_EVENT));

  renderAll();
})();
