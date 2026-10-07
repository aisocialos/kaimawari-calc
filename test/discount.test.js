const test = require("node:test");
const assert = require("node:assert/strict");
const D = require("../assets/discount.js");
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-4, `${a} ≠ ${b}`);

test("金額は 0 以上・上限以下の整数、割引率は 0〜100", () => {
  assert.equal(D.toYen(1980.9), 1980);
  assert.equal(D.toYen(-1), 0);
  assert.equal(D.toYen("x"), 0);
  assert.equal(D.toYen(Infinity), 0);
  assert.equal(D.toYen(1e307), D.MAX_INPUT);
  assert.equal(D.toPercent(120), 100);
  assert.equal(D.toPercent(-5), 0);
  assert.equal(D.toPercent(NaN), 0);
  assert.equal(D.toPercent(33.3), 33.3);
});

test("%引き：1,980円の30%OFFは1,386円、999円の15%OFFは849円", () => {
  assert.equal(D.priceAfterPercent(1980, 30), 1386);
  assert.equal(D.priceAfterPercent(999, 15), 849);
  assert.equal(D.priceAfterPercent(1000, 120), 0);
  assert.equal(D.priceAfterPercent(1000, -5), 1000);
  assert.equal(D.priceAfterPercent(1000, 0), 1000);
  assert.equal(D.priceAfterPercent(1980.9, 30), 1386);
});

test("小数の割引率でも1円ずれない", () => {
  assert.equal(D.priceAfterPercent(1000, 33.3), 667);
  assert.equal(D.priceAfterPercent(1000, 0.1 + 0.2), 996);
  assert.equal(D.priceAfterPercent(10000, 0.01), 9999);
  assert.equal(D.priceAfterPercent(100000000, 1e-7), 99999999);
  assert.equal(D.priceAfterPercent(3000, 99.9), 3);
});

test("円引き：1,980円から500円引きは1,480円、引きすぎは0円", () => {
  assert.equal(D.priceAfterYen(1980, 500), 1480);
  assert.equal(D.priceAfterYen(300, 500), 0);
  assert.equal(D.priceAfterYen(1980, -500), 1980);
});

test("割引率：2,000円が1,500円なら25%OFF・2.5割引・7.5掛け・500円引き", () => {
  assert.deepEqual(D.discountRate(2000, 1500), { percentOff: 25, wari: 2.5, kake: 7.5, saved: 500 });
  assert.deepEqual(D.discountRate(0, 100), { percentOff: 0, wari: 0, kake: 0, saved: 0 });
  const up = D.discountRate(1000, 1200);
  assert.deepEqual([up.percentOff, up.saved], [-20, -200]);
  near(D.discountRate(2980, 1980).percentOff, 33.557);
});

test("クーポンの重ねがけ：20%OFFのあと10%OFFは28%OFF（30%ではない）", () => {
  const r = D.applyCoupons(10000, [{ type: "percent", value: 20 }, { type: "percent", value: 10 }]);
  assert.equal(r.final, 7200);
  assert.equal(r.saved, 2800);
  assert.equal(r.percentOff, 28);
  assert.deepEqual(r.steps.map((s) => [s.before, s.after]), [[10000, 8000], [8000, 7200]]);
});

test("円引きと%引きは順番で結果が変わる", () => {
  assert.equal(D.applyCoupons(10000, [{ type: "yen", value: 500 }, { type: "percent", value: 10 }]).final, 8550);
  assert.equal(D.applyCoupons(10000, [{ type: "percent", value: 10 }, { type: "yen", value: 500 }]).final, 8500);
});

test("値が 0 以下・種類が違うクーポンは飛ばす", () => {
  const r = D.applyCoupons(10000, [{ type: "percent", value: 0 }, { type: "yen", value: -1 }, { type: "none", value: 50 }, { type: "yen", value: 1000 }]);
  assert.equal(r.steps.length, 1);
  assert.equal(r.final, 9000);
  assert.deepEqual(D.applyCoupons(0, [{ type: "percent", value: 10 }]).percentOff, 0);
  assert.equal(D.applyCoupons(1000, []).final, 1000);
});

test("極端な値のどの組み合わせでも、結果は有限の数で、価格は 0 以上・元の価格以下", () => {
  const EXTREMES = [0, 5e-324, 1e-7, 0.01, 1, 33.3, 100, 1980, D.MAX_INPUT, 1e307, Infinity, NaN, -1, "x"];
  for (const price of EXTREMES) for (const a of EXTREMES) for (const b of EXTREMES) {
    for (const types of [["percent", "yen"], ["yen", "percent"], ["percent", "percent"]]) {
      const r = D.applyCoupons(price, [{ type: types[0], value: a }, { type: types[1], value: b }]);
      const label = `${price} ${types} ${a} ${b}`;
      assert.ok(Number.isInteger(r.final) && r.final >= 0 && r.final <= D.toYen(price), label);
      assert.ok(Number.isFinite(r.percentOff) && r.percentOff >= 0 && r.percentOff <= 100, label);
      assert.equal(r.saved, D.toYen(price) - r.final, label);
    }
    const d = D.discountRate(price, a);
    for (const v of Object.values(d)) assert.ok(Number.isFinite(v), `discountRate ${price} ${a}`);
  }
});
