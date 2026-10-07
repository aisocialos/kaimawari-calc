// 割引 計算の画面処理
(function () {
  const CFG = window.SITE_CONFIG.discount;
  const D = window.DiscountCalc;
  const STORAGE_KEY = "discount-v1";
  const YEN_FIELDS = ["price", "original", "sale"];
  // クーポンの種類。none は「使わない」
  const TYPES = { none: "なし", percent: "%OFF", yen: "円引き" };
  // 値の入力欄の刻み。%OFF は小数も入れられる
  const STEPS = { none: "1", percent: "any", yen: "1" };
  const yen = (n) => n.toLocaleString("ja-JP") + "円";
  const pct = (n) => n.toFixed(CFG.rateDigits) + "%";
  const wari = (n) => n.toFixed(CFG.wariDigits);
  const track = (name) => { if (typeof window.trackEvent === "function") window.trackEvent(name); };

  // クーポンの値：%OFF は 0〜100、円引きは整数の円
  const couponValue = (type, v) => (type === "percent" ? D.toPercent(v) : D.toYen(v));
  const couponLabel = (c) => (c.type === "percent" ? `${c.value}%OFF` : `${yen(c.value)}引き`);

  function load() {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch (e) { /* 読めないときは初期値を使う */ }
    const d = CFG.defaults;
    const saved = s && typeof s === "object" ? s : {};
    const state = {};
    // 保存値にない項目は初期値、ある項目は整数の円にする
    for (const k of YEN_FIELDS) state[k] = Object.hasOwn(saved, k) ? D.toYen(saved[k]) : d[k];
    const list = Array.isArray(saved.coupons) ? saved.coupons : [];
    state.coupons = d.coupons.map((def, i) => {
      const c = list[i];
      if (!c || typeof c !== "object" || !Object.hasOwn(TYPES, c.type)) return { ...def };
      return { type: c.type, value: couponValue(c.type, c.value) };
    });
    return state;
  }
  function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* 保存できなくても計算は続ける */ } }
  const state = load();

  function renderCoupons() {
    const r = D.applyCoupons(state.price, state.coupons);
    const rate = D.discountRate(state.price, r.final);
    document.getElementById("kpis").innerHTML = `
      <div class="kpi"><span>払う金額</span><b>${yen(r.final)}</b></div>
      <div class="kpi"><span>値引き額</span><b>${yen(r.saved)}</b></div>
      <div class="kpi"><span>合計の割引率</span><b>${pct(rate.percentOff)}OFF</b></div>
      <div class="kpi"><span>何割引</span><b>${wari(rate.wari)}割引</b></div>`;
    document.getElementById("steps").innerHTML = r.steps.length
      ? r.steps.map((x, i) => `<tr><td>${i + 1}</td><td>${couponLabel(x)}</td><td class="n">${yen(x.before)}</td><td class="n">${yen(x.after)}</td></tr>`).join("")
      : `<tr><td colspan="4" class="note">クーポンを選ぶと、1つずつの結果が出ます。</td></tr>`;
    const notes = [];
    const percents = r.steps.filter((x) => x.type === "percent");
    if (percents.length > 1) {
      const sum = percents.reduce((a, x) => a + x.value, 0);
      notes.push(`<p>${percents.map(couponLabel).join(" と ")} は、足して ${pct(sum)}OFF にするのではなく、1つずつ順に計算します。前のクーポンを引いたあとの価格に、次のクーポンがかかります。</p>`);
    }
    const reversed = D.applyCoupons(state.price, [...state.coupons].reverse());
    if (reversed.final !== r.final) {
      notes.push(`<p class="warn">クーポンの順番を逆にすると ${yen(reversed.final)} になります（差は ${yen(Math.abs(reversed.final - r.final))}）。</p>`);
    }
    document.getElementById("advice").innerHTML = notes.join("");
  }
  function renderRate() {
    const r = D.discountRate(state.original, state.sale);
    const up = r.saved < 0;
    document.getElementById("rate-kpis").innerHTML = up ? "" : `
      <div class="kpi"><span>割引率</span><b>${pct(r.percentOff)}OFF</b></div>
      <div class="kpi"><span>何割引</span><b>${wari(r.wari)}割引</b></div>
      <div class="kpi"><span>何掛け</span><b>${wari(r.kake)}掛け</b></div>
      <div class="kpi"><span>値引き額</span><b>${yen(r.saved)}</b></div>`;
    document.getElementById("rate-advice").innerHTML = up
      ? `<p class="warn">売値が元の価格より ${yen(-r.saved)} 高くなっています。</p>`
      : "";
  }
  function render() { renderCoupons(); renderRate(); }

  function bind() {
    document.getElementById("coupons").innerHTML = state.coupons.map((c, i) => `
      <div class="grid">
        <div><label for="c-type-${i}">クーポン${i + 1}の種類</label>
          <select id="c-type-${i}">${Object.entries(TYPES).map(([v, label]) => `<option value="${v}">${label}</option>`).join("")}</select></div>
        <div><label for="c-value-${i}">クーポン${i + 1}の値（% または 円）</label><input id="c-value-${i}" type="number" min="0" step="1" inputmode="decimal"></div>
      </div>`).join("");
    const changed = () => { render(); save(); track("discount-edit"); };
    for (const id of YEN_FIELDS) {
      const el = document.getElementById(id);
      el.value = state[id];
      el.addEventListener("input", (e) => { state[id] = D.toYen(e.target.value); changed(); });
    }
    state.coupons.forEach((c, i) => {
      const typeEl = document.getElementById(`c-type-${i}`);
      const valueEl = document.getElementById(`c-value-${i}`);
      typeEl.value = c.type;
      valueEl.value = c.value;
      valueEl.step = STEPS[c.type];
      typeEl.addEventListener("input", (e) => { c.type = e.target.value; valueEl.step = STEPS[c.type]; c.value = couponValue(c.type, valueEl.value); changed(); });
      valueEl.addEventListener("input", (e) => { c.value = couponValue(c.type, e.target.value); changed(); });
    });
  }
  bind(); render();
})();
