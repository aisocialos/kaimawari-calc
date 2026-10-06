// サイト設定。
// goatcounterCode: GoatCounter のサイトコード。空のあいだはアクセス解析を読み込まない。
// rakutenAffiliateId: 楽天アフィリエイトID。空のあいだは通常の楽天市場リンクを出す。
// campaign: お買い物マラソンの条件（楽天市場の公式ページ 2026-10 開催分で確認）。
window.SITE_CONFIG = {
  goatcounterCode: "salon-roi",
  goatcounterScript: "https://gc.zgo.at/count.v4.js",
  goatcounterIntegrity: "sha384-nRw6qfbWyJha9LhsOtSb2YJDyZdKvvCFh0fJYlkquSFjUxp9FVNugbfy8q1jdxI+",
  rakutenAffiliateId: "",
  campaign: {
    minShopAmountTaxIn: 1000,
    maxMultiplier: 10,
    pointCap: 7000,
    defaultTaxRate: 10
  }
};
