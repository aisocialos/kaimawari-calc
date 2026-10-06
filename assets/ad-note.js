// 楽天アフィリエイトIDが設定されているときだけ、広告の表示（data-ad-note）を出す
document.addEventListener("DOMContentLoaded", function () {
  const on = Boolean((window.SITE_CONFIG || {}).rakutenAffiliateId);
  document.querySelectorAll("[data-ad-note]").forEach(function (el) { el.hidden = !on; });
});
