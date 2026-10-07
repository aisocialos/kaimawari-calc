const test = require("node:test");
const assert = require("node:assert/strict");
const T = require("../assets/tax.js");

test("入力は 0 以上の整数にする", () => {
  assert.equal(T.toYen(""), 0);
  assert.equal(T.toYen(-5), 0);
  assert.equal(T.toYen(1980.9), 1980);
  assert.equal(T.toYen("abc"), 0);
  assert.equal(T.toYen(Infinity), 0);
  assert.equal(T.toYen("1980"), 1980);
});

test("税額の端数：11.5円は切り捨て11・四捨五入12・切り上げ12", () => {
  assert.equal(T.roundTax(11.5, "floor"), 11);
  assert.equal(T.roundTax(11.5, "round"), 12);
  assert.equal(T.roundTax(11.5, "ceil"), 12);
  assert.equal(T.roundTax(11, "ceil"), 11);
  assert.equal(T.roundTax(11.5, "unknown"), 11);
});

test("税抜 → 税込：1,000円は10%で1,100円、1,980円は8%で2,138円", () => {
  assert.deepEqual(T.fromTaxExcluded(1000, 10, "floor"), { taxEx: 1000, tax: 100, taxIn: 1100 });
  assert.deepEqual(T.fromTaxExcluded(1980, 8, "floor"), { taxEx: 1980, tax: 158, taxIn: 2138 });
  assert.equal(T.fromTaxExcluded(115, 10, "floor").tax, 11);
  assert.equal(T.fromTaxExcluded(115, 10, "round").tax, 12);
  assert.equal(T.fromTaxExcluded(111, 10, "ceil").tax, 12);
});

test("税込 → 税抜：1,100円は10%で1,000円、1,080円は8%で1,000円", () => {
  assert.deepEqual(T.fromTaxIncluded(1100, 10, "floor"), { taxEx: 1000, tax: 100, taxIn: 1100 });
  assert.deepEqual(T.fromTaxIncluded(1080, 8, "floor"), { taxEx: 1000, tax: 80, taxIn: 1080 });
  assert.deepEqual(T.fromTaxIncluded(1000, 10, "floor"), { taxEx: 910, tax: 90, taxIn: 1000 });
  assert.deepEqual(T.fromTaxIncluded(1000, 10, "round"), { taxEx: 909, tax: 91, taxIn: 1000 });
});

test("税抜と税額を足すと税込になる（1〜3,000円、両方向、全端数処理）", () => {
  for (const mode of ["floor", "round", "ceil"]) {
    for (const rate of [10, 8]) {
      for (let y = 1; y <= 3000; y++) {
        const a = T.fromTaxExcluded(y, rate, mode);
        const b = T.fromTaxIncluded(y, rate, mode);
        assert.equal(a.taxEx + a.tax, a.taxIn);
        assert.equal(b.taxEx + b.tax, b.taxIn);
        assert.ok(Number.isInteger(a.tax) && Number.isInteger(b.tax));
      }
    }
  }
});

test("10%と8%を並べて返す", () => {
  const ex = T.convert(1000, "ex", [10, 8], "floor");
  assert.deepEqual(ex.map((r) => [r.rate, r.taxIn]), [[10, 1100], [8, 1080]]);
  const inc = T.convert(1080, "in", [10, 8], "floor");
  assert.deepEqual(inc.map((r) => [r.rate, r.taxEx, r.tax]), [[10, 982, 98], [8, 1000, 80]]);
});
