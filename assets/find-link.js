// 「楽天市場で探す」リンク（#find-link）の行き先を設定し、クリックを数える。イベント名は data-click-event
(function () {
  const cfg = window.SITE_CONFIG || {};
  const link = document.getElementById("find-link");
  if (!link) return;
  // 楽天アフィリエイトの管理画面で生成したリンクをそのまま使う。空なら HTML に書いた通常の検索ページのまま
  if (cfg.rakutenFindLink) link.href = cfg.rakutenFindLink;
  link.addEventListener("click", function () {
    if (typeof window.trackEvent === "function") window.trackEvent(link.dataset.clickEvent);
  });
})();
