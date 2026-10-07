const test = require("node:test");
const assert = require("node:assert/strict");
const S = require("../assets/spu.js");

const SPU = {
  taxRate: 10,
  mobile: { key: "mobile", label: "楽天モバイル", rate: 4, cap: 2000, base: "taxEx" },
  cardNormal: { key: "cardNormal", label: "楽天カード 通常分", rate: 1, cap: null, base: "taxIn" },
  cardBonus: { key: "cardBonus", label: "楽天カード 特典分", rate: 1, cap: { normal: 1000, premium: 5000 }, base: "taxEx" },
};

test("倍率と上限：+4倍で税抜10万円なら4,000ptだが上限2,000", () => {
  assert.equal(S.itemPoints(100000, 4, 2000), 2000);
  assert.equal(S.itemPoints(30000, 4, 2000), 1200);
  assert.equal(S.itemPoints(30000, 1, null), 300);
  assert.equal(S.itemPoints(30000, 0.5, 1000), 150);
});

test("上限に届く金額：+4倍・2,000ptなら5万円、上限なしは null", () => {
  assert.equal(S.capReachAmount(4, 2000), 50000);
  assert.equal(S.capReachAmount(1, 1000), 100000);
  assert.equal(S.capReachAmount(1, null), null);
});

test("税込33,000円 → 税抜30,000円", () => {
  assert.deepEqual(S.bases(33000, 10), { taxIn: 33000, taxEx: 30000 });
  assert.deepEqual(S.bases("", 10), { taxIn: 0, taxEx: 0 });
});

test("カード（一般）＋モバイル、税込33,000円/月 → 1,200+330+300 = 1,830pt", () => {
  const r = S.breakdown(33000, { card: "normal", mobile: true }, SPU);
  assert.deepEqual(r.rows.map((x) => [x.key, x.points]), [["mobile", 1200], ["cardNormal", 330], ["cardBonus", 300]]);
  assert.equal(r.monthly, 1830);
  assert.equal(r.yearly, 21960);
});

test("プレミアムカードは特典分の上限が5,000", () => {
  const r = S.breakdown(220000, { card: "premium", mobile: false }, SPU);
  assert.equal(r.rows.find((x) => x.key === "cardBonus").points, 2000);
  const n = S.breakdown(220000, { card: "normal", mobile: false }, SPU);
  assert.equal(n.rows.find((x) => x.key === "cardBonus").points, 1000);
});

test("カードもモバイルもなければ 0", () => {
  const r = S.breakdown(33000, { card: "none", mobile: false }, SPU);
  assert.equal(r.rows.length, 0);
  assert.equal(r.monthly, 0);
});
