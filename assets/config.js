// サイト設定。
// goatcounterCode: GoatCounter のサイトコード。空のあいだはアクセス解析を読み込まない。
// rakutenAffiliateId: 楽天アフィリエイトID。空のあいだは広告の表示を隠す。
// rakutenFindLink: 「あと1店を探す」のリンク。楽天アフィリエイトの管理画面で生成したものをそのまま入れる（編集禁止）。空なら通常の検索ページ。
// campaigns: キャンペーンごとの条件。ページの <body data-campaign> で選ぶ。
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
  // 楽天カード・楽天モバイルの申込リンク。楽天アフィリエイトの管理画面で生成したものをそのまま入れる（編集禁止）。空なら公式ページへの通常リンク
  rakutenCardLink: "",
  rakutenMobileLink: "",
  rakutenCardUrl: "https://www.rakuten-card.co.jp/",
  rakutenMobileUrl: "https://network.mobile.rakuten.co.jp/",
  // SPU（楽天市場の公式ページ 2026年7月1日更新分で確認）。楽天銀行の項目はポイントの計算方法を公式で確認できないため入れていないhttps://event.rakuten.co.jp/campaign/point-up/everyday/point/
  spu: {
    taxRate: 10,
    mobile: { key: "mobile", label: "楽天モバイル（要エントリー）", rate: 4, cap: 2000, base: "taxEx" },
    cardNormal: { key: "cardNormal", label: "楽天カード 通常分", rate: 1, cap: null, base: "taxIn" },
    cardBonus: { key: "cardBonus", label: "楽天カード 特典分", rate: 1, cap: { normal: 1000, premium: 5000 }, base: "taxEx" }
  },
  // 消費税の換算（/tax）。rates は表に出す順。defaults は初めて開いたときの入力例
  tax: {
    rates: [{ rate: 10, label: "標準税率 10%" }, { rate: 8, label: "軽減税率 8%" }],
    defaults: { amount: 1000, direction: "ex", mode: "floor" }
  },
  campaigns: {
    // お買い物マラソン（2026年10月4日〜9日開催分の公式ページで確認）
    marathon: {
      minShopAmountTaxIn: 1000,
      maxMultiplier: 10,
      pointCap: 7000,
      defaultTaxRate: 10
    },
    // 楽天スーパーSALE（規則はマラソンと同じ。上限と最大倍率は開催ごとに変わる。初期値は 2026年9月開催分の報道による値で、公式ページでは未確認）
    supersale: {
      minShopAmountTaxIn: 1000,
      maxMultiplier: 10,
      pointCap: 7000,
      defaultTaxRate: 10
    }
  }
};
