const test = require("node:test");
const assert = require("node:assert/strict");
const P = require("../assets/point.js");
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-4, `${a} ≠ ${b}`);

test("還元率：1,980円の1%は19pt、0.5%は9pt", () => {
  assert.equal(P.pointsByRate(1980, 1), 19);
  assert.equal(P.pointsByRate(1980, 0.5), 9);
  assert.equal(P.pointsByRate(10000, 10), 1000);
  assert.equal(P.pointsByRate(-100, 1), 0);
  assert.equal(P.pointsByRate("abc", 1), 0);
  assert.equal(P.pointsByRate(1000, -1), 0);
});

test("還元率が小数でも1ポイントずれない", () => {
  assert.equal(P.pointsByRate(1000, 0.3), 3);
  assert.equal(P.pointsByRate(3000, 0.7), 21);
  assert.equal(P.pointsByRate(2000, 1.15), 23);
  assert.equal(P.pointsByRate(10000, 0.1 + 0.2), 30);
});

test("○円ごとに○ポイント：1,980円で200円ごとに1ptなら9pt", () => {
  assert.equal(P.pointsByUnit(1980, 200, 1), 9);
  assert.equal(P.pointsByUnit(199, 200, 1), 0);
  assert.equal(P.pointsByUnit(1000, 100, 1), 10);
  assert.equal(P.pointsByUnit(1000, 0, 1), 0);
  assert.equal(P.pointsByUnit(1000, 100, 3), 30);
});

test("実質価格：ポイント分を引く。0より下にはならない", () => {
  assert.equal(P.effectivePrice(1980, 19, 1), 1961);
  assert.equal(P.effectivePrice(1000, 100, 0.8), 920);
  assert.equal(P.effectivePrice(100, 500, 1), 0);
});

test("実際の還元率：1,980円で9ptなら約0.4545%", () => {
  near(P.effectiveRate(1980, 9, 1), 0.454545);
  assert.equal(P.effectiveRate(0, 9, 1), 0);
  assert.equal(P.effectiveRate(1000, 100, 0.5), 5);
});

test("値引き換算：10%還元は約9.09%引き、100%還元は50%引き", () => {
  near(P.discountEquivalent(10), 9.090909);
  assert.equal(P.discountEquivalent(100), 50);
  assert.equal(P.discountEquivalent(0), 0);
});

test("まとめ：還元率と付与単位のどちらでも計算できる", () => {
  const u = P.summary({ price: 1980, method: "unit", rate: 1, unitYen: 200, pointsPerUnit: 1, yenPerPoint: 1 });
  assert.equal(u.points, 9);
  assert.equal(u.effectivePrice, 1971);
  near(u.effectiveRate, 0.454545);
  const r = P.summary({ price: 10000, method: "rate", rate: 10, unitYen: 200, pointsPerUnit: 1, yenPerPoint: 1 });
  assert.deepEqual([r.points, r.effectivePrice, r.effectiveRate], [1000, 9000, 10]);
  near(r.discountEquivalent, 9.090909);
});
