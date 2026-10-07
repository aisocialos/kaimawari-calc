// 消費税の税込・税抜の換算（純粋関数のみ）
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.TaxCalc = api;
})(typeof self !== "undefined" ? self : this, function () {
  const PERCENT = 100;
  const ROUNDERS = { floor: Math.floor, round: Math.round, ceil: Math.ceil };

  // 入力を 0 以上の整数（円）にする。数でないもの・負の数は 0
  function toYen(value) {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  }

  // 税率（%）を 0 以上の有限の数にする。それ以外は 0
  function toRate(value) {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }

  // 税額の端数処理。mode: "floor"（切り捨て）| "round"（四捨五入）| "ceil"（切り上げ）。知らない mode は切り捨て
  function roundTax(amount, mode) {
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) return 0;
    return (Object.hasOwn(ROUNDERS, mode) ? ROUNDERS[mode] : ROUNDERS.floor)(n);
  }

  // 税抜 → 税込
  function fromTaxExcluded(taxEx, rate, mode) {
    const ex = toYen(taxEx);
    const tax = roundTax((ex * toRate(rate)) / PERCENT, mode);
    return { taxEx: ex, tax, taxIn: ex + tax };
  }

  // 税込 → 税抜
  function fromTaxIncluded(taxIn, rate, mode) {
    const inc = toYen(taxIn);
    const r = toRate(rate);
    const tax = roundTax((inc * r) / (PERCENT + r), mode);
    return { taxEx: inc - tax, tax, taxIn: inc };
  }

  // 税率ごとの換算結果。direction: "ex"（入力が税抜）| "in"（入力が税込）
  function convert(amount, direction, rates, mode) {
    const fn = direction === "in" ? fromTaxIncluded : fromTaxExcluded;
    return rates.map((rate) => ({ rate, ...fn(amount, rate, mode) }));
  }

  return { toYen, toRate, roundTax, fromTaxExcluded, fromTaxIncluded, convert };
});
