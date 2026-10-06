// アクセス解析（GoatCounter、Cookie なし）。config.js にコードがあるときだけ読み込む。
(function () {
  const cfg = window.SITE_CONFIG || {};
  const sent = new Set();
  window.trackEvent = function (name) {
    if (sent.has(name)) return;
    if (window.goatcounter && typeof window.goatcounter.count === "function") {
      window.goatcounter.count({ path: name, title: name, event: true });
      sent.add(name);
    }
  };
  if (!cfg.goatcounterCode) return;
  const s = document.createElement("script");
  s.async = true;
  s.src = cfg.goatcounterScript;
  s.integrity = cfg.goatcounterIntegrity;
  s.crossOrigin = "anonymous";
  s.dataset.goatcounter = "https://" + cfg.goatcounterCode + ".goatcounter.com/count";
  document.head.appendChild(s);
})();
