// 消費税 計算の画面処理
(function () {
  const CFG = window.SITE_CONFIG.tax;
  const T = window.TaxCalc;
  const STORAGE_KEY = "tax-v1";
  const FIELDS = ["amount", "direction", "mode"];
  const yen = (n) => n.toLocaleString("ja-JP") + "円";
  const track = (name) => { if (typeof window.trackEvent === "function") window.trackEvent(name); };

  // 選択肢にない値は初期値に戻す
  const inOptions = (id, v) => [...document.getElementById(id).options].some((o) => o.value === v);
  function load() {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch (e) { /* 読めないときは初期値を使う */ }
    const d = CFG.defaults;
    if (!s || typeof s !== "object") return { ...d };
    return { amount: T.toYen(s.amount),
      direction: inOptions("direction", s.direction) ? s.direction : d.direction,
      mode: inOptions("mode", s.mode) ? s.mode : d.mode };
  }
  function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* 保存できなくても計算は続ける */ } }
  const state = load();

  function render() {
    const asked = state.direction === "in" ? "taxEx" : "taxIn";
    const askedLabel = state.direction === "in" ? "税抜" : "税込";
    const rows = T.convert(state.amount, state.direction, CFG.rates.map((x) => x.rate), state.mode)
      .map((r, i) => ({ ...r, label: CFG.rates[i].label }));
    document.getElementById("kpis").innerHTML = rows
      .map((r) => `<div class="kpi"><span>${r.label}の${askedLabel}</span><b>${yen(r[asked])}</b><small>うち消費税 ${yen(r.tax)}</small></div>`).join("");
    document.getElementById("rows").innerHTML = rows
      .map((r) => `<tr><td>${r.label}</td><td class="n">${yen(r.taxEx)}</td><td class="n">${yen(r.tax)}</td><td class="n">${yen(r.taxIn)}</td></tr>`).join("");
  }
  function bind() {
    for (const id of FIELDS) {
      const el = document.getElementById(id);
      el.value = state[id];
      el.addEventListener("input", (e) => {
        state[id] = id === "amount" ? T.toYen(e.target.value) : e.target.value;
        render(); save(); track("tax-edit");
      });
    }
  }
  bind(); render();
})();
