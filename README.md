# お買い物マラソン 買いまわり計算機

楽天市場のお買い物マラソンで、買う予定の商品とショップから達成ショップ数・倍率・買いまわりポイントを計算する無料ツールです。あと1店足すと何ポイント増えるか、上限まであと何円買えるかも表示します。静的ページだけで動き、入力内容はブラウザの外に送信されません。

公開URL：https://aisocialos.github.io/kaimawari-calc/

## ファイル

- `index.html`：計算機の画面
- `assets/calc.js`：計算ロジック（純粋関数）。テストは `npm test`（Node 20 以上）
- `assets/config.js`：GoatCounter のコード、楽天アフィリエイトID、キャンペーン条件（上限・1店の条件・最大倍率）
- `articles/`：解説記事2本
- `privacy.html`：入力データ、アクセス解析、広告の扱い

## キャンペーン条件の更新

開催回ごとに上限などが変わったら、`assets/config.js` の `campaign` を書き換えてプッシュします。

## 楽天アフィリエイトID

`assets/config.js` の `rakutenAffiliateId` が空のあいだは通常の楽天市場リンクを出し、広告の表示（`data-ad-note`）も隠します。IDを入れるときは、楽天アフィリエイトの管理画面で検索ページのリンクを1本作り、`index.html` の `affiliate()` が組み立てるURLと同じ形か確かめてください。

## アクセス解析

GoatCounter のサイトコードは同じドメイン（aisocialos.github.io）の salon-roi と共用しています。パスが `/kaimawari-calc/` で始まるものがこのサイトの分です。
