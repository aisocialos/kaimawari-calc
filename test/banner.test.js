const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");

global.window = {};
require("../assets/config.js");
const CFG = global.window.SITE_CONFIG;

// 楽天アフィリエイトの管理画面で生成したHTMLソースは1文字も変えてはいけない。
// 生成し直したときは、新しいソースの sha256 に差し替える。
const EXPECTED = {
  rakutenCardBanner: "d56d28ace5f352be473528491249456d599cd10269a21ce3186e60f112715abd",
  rakutenMobileBanner: "91997c66945ce2457bf6a1a64bad9b02e866982c494ad23186fff8530141cb66",
};

for (const [key, hash] of Object.entries(EXPECTED)) {
  test(`${key} は生成されたHTMLソースのまま`, () => {
    assert.equal(crypto.createHash("sha256").update(CFG[key]).digest("hex"), hash);
  });
}
