// ポイント還元率 計算の画面処理
(function () {
  const CFG = window.SITE_CONFIG.point;
  const P = window.PointCalc;
  const STORAGE_KEY = "point-v1";
  const NUMBER_FIELDS = ["price", "rate", "unitYen", "pointsPerUnit", "yenPerPoint"];
  const yen = (n) => Math.round(n).toLocaleString("ja-JP") + "円";
  const pt = (n) => n.toLocaleString("ja-JP") + "pt";
  const pct = (n) => n.toFixed(CFG.rateDigits) + "%";
  const track = (name) => { if (typeof window.trackEvent === "function") window.trackEvent(name); };

  // 選択肢にない値は初期値に戻す
  const inOptions = (id, v) => [...document.getElementById(id).options].some((o) => o.value === v);
  function load() {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch (e) { /* 読めないときは初期値を使う */ }
    const d = CFG.defaults;
    if (!s || typeof s !== "object") return { ...d };
    const state = { method: inOptions("method", s.method) ? s.method : d.method };
    for (const k of NUMBER_FIELDS) state[k] = P.nonNegative(s[k]);
    return state;
  }
  function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* 保存できなくても計算は続ける */ } }
  const state = load();

  function render() {
    document.querySelectorAll("[data-method]").forEach((el) => { el.hidden = el.dataset.method !== state.method; });
    const r = P.summary(state);
    document.getElementById("kpis").innerHTML = `
      <div class="kpi"><span>もらえるポイント</span><b>${pt(r.points)}</b></div>
      <div class="kpi"><span>実質価格</span><b>${yen(r.effectivePrice)}</b></div>
      <div class="kpi"><span>実際の還元率</span><b>${pct(r.effectiveRate)}</b></div>
      <div class="kpi"><span>値引きに直すと</span><b>${pct(r.discountEquivalent)}引き</b></div>`;
    const lost = state.method === "unit" && state.unitYen > 0 ? Math.floor(state.price) % state.unitYen : 0;
    document.getElementById("advice").innerHTML = lost > 0
      ? `<p class="warn">${yen(lost)}分は ${yen(state.unitYen)} に届かないので、ポイントが付きません。</p>`
      : "";
  }
  function bind() {
    for (const id of ["method", ...NUMBER_FIELDS]) {
      const el = document.getElementById(id);
      el.value = state[id];
      el.addEventListener("input", (e) => {
        state[id] = id === "method" ? e.target.value : P.nonNegative(e.target.value);
        render(); save(); track("point-edit");
      });
    }
  }
  bind(); render();
})();
