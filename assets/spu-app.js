// 楽天カード・楽天モバイル SPU 計算の画面処理
(function () {
  const CFG = window.SITE_CONFIG;
  const S = window.SpuCalc;
  const STORAGE_KEY = "spu-card-v1";
  const SPU_BASE = JSON.stringify(CFG.spu);
  const DEFAULTS = { spend: 33000, card: "normal", mobile: true };
  const yen = (n) => Math.round(n).toLocaleString("ja-JP") + "円";
  const pt = (n) => Math.round(n).toLocaleString("ja-JP") + "pt";
  const track = (name) => { if (typeof window.trackEvent === "function") window.trackEvent(name); };

  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (s && s.spuBase === SPU_BASE) return { spend: s.spend, card: s.card, mobile: s.mobile };
    } catch (e) { /* 読めないときは初期値を使う */ }
    return { ...DEFAULTS };
  }
  function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, spuBase: SPU_BASE })); } catch (e) { /* 保存できなくても計算は続ける */ } }
  let state = load();

  const baseLabel = { taxIn: "税込", taxEx: "税抜" };
  function render() {
    const r = S.breakdown(state.spend, state, CFG.spu);
    document.getElementById("kpis").innerHTML = `
      <div class="kpi"><span>毎月増えるポイント</span><b>${pt(r.monthly)}</b></div>
      <div class="kpi"><span>1年で（同じ金額を毎月）</span><b>${pt(r.yearly)}</b></div>`;
    document.getElementById("rows").innerHTML = r.rows.length
      ? r.rows.map((x) => `<tr><td>${x.label}</td><td class="n">+${x.rate}倍</td><td class="n">${x.cap === null ? "なし" : pt(x.cap)}</td><td class="n">${pt(x.points)}</td><td class="n">${x.capReachAt === null ? "—" : baseLabel[x.base] + " " + yen(x.capReachAt)}</td></tr>`).join("")
      : `<tr><td colspan="5" class="note">サービスを選ぶと内訳が出ます。</td></tr>`;
    const capped = r.rows.filter((x) => x.cap !== null && x.points >= x.cap);
    document.getElementById("advice").innerHTML = capped.length
      ? `<p class="warn">${capped.map((x) => x.label).join("、")}は今月の上限に届いています。これ以上買っても、その分のポイントは増えません。</p>`
      : "";
  }
  function bind() {
    document.getElementById("spend").value = state.spend;
    document.getElementById("card").value = state.card;
    document.getElementById("mobile").checked = state.mobile;
    for (const id of ["spend", "card", "mobile"]) {
      document.getElementById(id).addEventListener("input", (e) => {
        state[id] = id === "mobile" ? e.target.checked : id === "spend" ? Number(e.target.value) || 0 : e.target.value;
        render(); save(); track("spu-edit");
      });
    }
    const LINKS = [
      ["card-link", CFG.rakutenCardLink, CFG.rakutenCardUrl, "card-click", "楽天カードの申し込みページへ", "楽天カードの公式ページを見る"],
      ["mobile-link", CFG.rakutenMobileLink, CFG.rakutenMobileUrl, "mobile-click", "楽天モバイルの申し込みページへ", "楽天モバイルの公式ページを見る"],
    ];
    // 広告リンクが1本もなければ、広告の表示を出さない
    const anyAd = LINKS.some((x) => Boolean(x[1]));
    document.querySelectorAll("[data-spu-ad]").forEach((el) => { el.hidden = !anyAd; });
    for (const [id, link, url, ev, adText, plainText] of LINKS) {
      const a = document.getElementById(id);
      a.href = link || url;
      a.textContent = link ? adText : plainText;
      if (!link) a.rel = "noopener";
      document.querySelector(`[data-pr-for="${id}"]`).hidden = !link;
      a.addEventListener("click", () => track(ev));
    }
  }
  bind(); render();
})();
