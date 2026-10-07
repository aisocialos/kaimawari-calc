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

  // 税額の端数処理。mode: "floor"（切り捨て）| "round"（四捨五入）| "ceil"（切り上げ）
  function roundTax(amount, mode) {
    return (ROUNDERS[mode] || ROUNDERS.floor)(amount);
  }

  // 税抜 → 税込
  function fromTaxExcluded(taxEx, rate, mode) {
    const ex = toYen(taxEx);
    const tax = roundTax((ex * rate) / PERCENT, mode);
    return { taxEx: ex, tax, taxIn: ex + tax };
  }

  // 税込 → 税抜
  function fromTaxIncluded(taxIn, rate, mode) {
    const inc = toYen(taxIn);
    const tax = roundTax((inc * rate) / (PERCENT + rate), mode);
    return { taxEx: inc - tax, tax, taxIn: inc };
  }

  // 税率ごとの換算結果。direction: "ex"（入力が税抜）| "in"（入力が税込）
  function convert(amount, direction, rates, mode) {
    const fn = direction === "in" ? fromTaxIncluded : fromTaxExcluded;
    return rates.map((rate) => ({ rate, ...fn(amount, rate, mode) }));
  }

  return { toYen, roundTax, fromTaxExcluded, fromTaxIncluded, convert };
});
