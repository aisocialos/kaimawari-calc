// サイト設定。
// goatcounterCode: GoatCounter のサイトコード。空のあいだはアクセス解析を読み込まない。
// rakutenAffiliateId: 楽天アフィリエイトID。空のあいだは広告の表示を隠す。
// rakutenFindLink: 「あと1店を探す」のリンク。楽天アフィリエイトの管理画面で生成したものをそのまま入れる（編集禁止）。空なら通常の検索ページ。
// campaign: お買い物マラソンの条件（楽天市場の公式ページ 2026-10 開催分で確認）。
window.SITE_CONFIG = {
  // 公開先。旧URL（GitHub Pages）で開かれたら siteOrigin へ移す
  siteOrigin: "https://kaimawari.fynexus.com",
  legacyHosts: ["aisocialos.github.io"],
  legacyPathPrefix: "/kaimawari-calc",
  // GoatCounter は salon-roi と共用のため、このサイトのパスに付ける接頭辞
  goatcounterPathPrefix: "/kaimawari-calc",
  // IndexNow（Bing など）に URL を通知するときの鍵。サイト直下の 6031b9d21850f3eba0813a93b2ea38ba.txt と同じ値
  indexNowKey: "6031b9d21850f3eba0813a93b2ea38ba",
  goatcounterCode: "salon-roi",
  goatcounterScript: "https://gc.zgo.at/count.v4.js",
  goatcounterIntegrity: "sha384-nRw6qfbWyJha9LhsOtSb2YJDyZdKvvCFh0fJYlkquSFjUxp9FVNugbfy8q1jdxI+",
  rakutenAffiliateId: "5843df8f.74ff13c7.5843df90.cdf107b5",
  rakutenFindLink: "https://hb.afl.rakuten.co.jp/hgc/5843df8f.74ff13c7.5843df90.cdf107b5/?pc=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F1000%E5%86%86%E3%83%9D%E3%83%83%E3%82%AD%E3%83%AA%2B%E9%80%81%E6%96%99%E7%84%A1%E6%96%99%2F&link_type=text&ut=eyJwYWdlIjoidXJsIiwidHlwZSI6InRleHQiLCJjb2wiOjF9",
  campaign: {
    minShopAmountTaxIn: 1000,
    maxMultiplier: 10,
    pointCap: 7000,
    defaultTaxRate: 10
  }
};
