const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

// 404.html は /articles/a/b のような深い階層でも返るので、相対パスだと CSS や JS が読めなくなる
const html = fs.readFileSync(path.join(__dirname, "..", "404.html"), "utf8");

test("404.html の読み込みとリンクはすべてルートからの絶対パス", () => {
  const refs = [...html.matchAll(/\s(?:src|href)="([^"]*)"/g)].map((m) => m[1]).filter((u) => !u.startsWith("data:"));
  assert.ok(refs.length > 0);
  for (const u of refs) assert.ok(u.startsWith("/"), `相対パス: ${u}`);
});

test("404.html は検索結果に出さない", () => {
  assert.match(html, /<meta name="robots" content="noindex">/);
});
