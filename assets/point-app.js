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

  const YEN_FIELDS = ["price", "unitYen"];
  // 金額は整数の円、ほかは 0 以上の数
  const toNumber = (id, v) => (YEN_FIELDS.includes(id) ? P.toYen(v) : P.nonNegative(v));
  // 選択肢にない値は初期値に戻す
  const inOptions = (id, v) => [...document.getElementById(id).options].some((o) => o.value === v);
  function load() {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch (e) { /* 読めないときは初期値を使う */ }
    const d = CFG.defaults;
    if (!s || typeof s !== "object") return { ...d };
    const state = { method: inOptions("method", s.method) ? s.method : d.method };
    // 保存値にない項目は初期値、ある項目は 0 以上の数にする
    for (const k of NUMBER_FIELDS) state[k] = Object.hasOwn(s, k) ? toNumber(k, s[k]) : d[k];
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
    const lost = state.method === "unit" && state.unitYen > 0 ? state.price % state.unitYen : 0;
    document.getElementById("advice").innerHTML = lost > 0
      ? `<p class="warn">${yen(lost)}分は ${yen(state.unitYen)} に届かないので、ポイントが付きません。</p>`
      : "";
  }
  function bind() {
    for (const id of ["method", ...NUMBER_FIELDS]) {
      const el = document.getElementById(id);
      el.value = state[id];
      el.addEventListener("input", (e) => {
        state[id] = id === "method" ? e.target.value : toNumber(id, e.target.value);
        render(); save(); track("point-edit");
      });
    }
  }
  bind(); render();
})();
