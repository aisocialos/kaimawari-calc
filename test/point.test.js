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
  assert.equal(P.pointsByRate(10000, 0.9999), 99);
  assert.equal(P.pointsByRate(1000000, 0.00001), 0);
  assert.equal(P.pointsByRate(100000000, 1e-7), 0);
  assert.equal(P.pointsByRate(1000000000, 1e-7), 1);
});

test("数を整数と小数の桁数に分ける", () => {
  assert.deepEqual(P.toScaled(0.7), { digits: 7n, decimals: 1 });
  assert.deepEqual(P.toScaled(10), { digits: 10n, decimals: 0 });
  assert.deepEqual(P.toScaled(1e-7), { digits: 1n, decimals: 7 });
  assert.deepEqual(P.toScaled(1.5e-7), { digits: 15n, decimals: 8 });
  assert.deepEqual(P.toScaled(1e307), { digits: BigInt(P.MAX_INPUT), decimals: 0 });
  assert.deepEqual(P.toScaled(-3), { digits: 0n, decimals: 0 });
});

test("金額の小数は切り捨ててから、ポイントも実質価格も同じ金額で計算する", () => {
  assert.equal(P.toYen(1980.9), 1980);
  assert.equal(P.toYen(-1), 0);
  assert.equal(P.effectivePrice(1980.9, 19, 1), 1961);
  assert.equal(P.effectiveRate(1000.9, 100, 1), 10);
  assert.equal(P.pointsByUnit(1999.9, 200, 1), 9);
  const s = P.summary({ price: 1980.9, method: "rate", rate: 1, unitYen: 200, pointsPerUnit: 1, yenPerPoint: 1 });
  assert.deepEqual([s.points, s.effectivePrice], [19, 1961]);
});

test("○円ごとに○ポイント：1,980円で200円ごとに1ptなら9pt", () => {
  assert.equal(P.pointsByUnit(1980, 200, 1), 9);
  assert.equal(P.pointsByUnit(199, 200, 1), 0);
  assert.equal(P.pointsByUnit(1000, 100, 1), 10);
  assert.equal(P.pointsByUnit(1000, 0, 1), 0);
  assert.equal(P.pointsByUnit(1000, 100, 3), 30);
  assert.equal(P.pointsByUnit(1000, 0.5, 1), 0);
  assert.equal(P.pointsByUnit(1000, 100.9, 1), 10);
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

test("上限より大きい入力は上限として扱う", () => {
  assert.equal(P.nonNegative(1e307), P.MAX_INPUT);
  assert.equal(P.nonNegative(Infinity), 0);
  assert.equal(P.toYen(1e307), P.MAX_INPUT);
  assert.equal(P.pointsByRate(1e307, 1e307), P.MAX_INPUT);
  assert.equal(P.pointsByUnit(1e307, 1, 1e307), P.MAX_INPUT);
});

test("とても大きい入力でも Infinity や NaN にならない（評審で出た例）", () => {
  near(P.discountEquivalent(1e307), 100);
  assert.equal(P.effectiveRate(100, 1e307, 1), (P.MAX_INPUT / 100) * 100);
  assert.ok(Number.isFinite(P.effectiveRate(1, 1e307, 0.01)));
  const a = P.summary({ price: 100, method: "rate", rate: 1e307, unitYen: 200, pointsPerUnit: 1, yenPerPoint: 1 });
  const b = P.summary({ price: 1, method: "unit", rate: 1, unitYen: 1, pointsPerUnit: 1e307, yenPerPoint: 0.01 });
  for (const s of [a, b]) {
    assert.ok(Number.isFinite(s.effectiveRate) && s.effectiveRate > 0);
    near(s.discountEquivalent, 100);
    assert.equal(s.effectivePrice, 0);
  }
});

test("極端な値のどの組み合わせでも、結果は 0 以上の有限の数になる", () => {
  const EXTREMES = [0, 5e-324, 1e-7, 0.01, 1, 1980, P.MAX_INPUT, 1e307, Infinity, NaN, -1, "x"];
  for (const method of ["rate", "unit"]) {
    for (const price of EXTREMES) for (const a of EXTREMES) for (const b of EXTREMES) for (const yenPerPoint of EXTREMES) {
      const s = P.summary({ price, method, rate: a, unitYen: a, pointsPerUnit: b, yenPerPoint });
      for (const [k, v] of Object.entries(s)) {
        assert.ok(Number.isFinite(v) && v >= 0, `${k}=${v}（${method} ${price} ${a} ${b} ${yenPerPoint}）`);
      }
      assert.ok(s.discountEquivalent <= 100 && s.points <= P.MAX_INPUT);
    }
  }
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
