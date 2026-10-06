// 旧URL（GitHub Pages）で開かれたら、同じページの新URLへ移す
(function () {
  const cfg = window.SITE_CONFIG || {};
  if (!(cfg.legacyHosts || []).includes(location.hostname)) return;
  const prefix = cfg.legacyPathPrefix || "";
  const path = location.pathname.startsWith(prefix) ? location.pathname.slice(prefix.length) : location.pathname;
  location.replace(cfg.siteOrigin + (path || "/") + location.search + location.hash);
})();
