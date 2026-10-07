// ポイント還元でもらえるポイントと実質価格（純粋関数のみ）
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.PointCalc = api;
})(typeof self !== "undefined" ? self : this, function () {
  const PERCENT = 100;
  // 還元率は小数第3位までを整数にして掛ける（0.1 × 3 のような誤差で1ポイントずれるのを防ぐ）
  const RATE_SCALE = 1000;

  // 0 以上の有限の数にする。それ以外は 0
  function nonNegative(value) {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }

  // 還元率（%）でもらえるポイント。1ポイント未満は切り捨て
  function pointsByRate(price, ratePercent) {
    const scaled = Math.round(nonNegative(ratePercent) * RATE_SCALE);
    return Math.floor((Math.floor(nonNegative(price)) * scaled) / (PERCENT * RATE_SCALE));
  }

  // 「unitYen 円ごとに pointsPerUnit ポイント」でもらえるポイント
  function pointsByUnit(price, unitYen, pointsPerUnit) {
    const unit = nonNegative(unitYen);
    if (unit === 0) return 0;
    return Math.floor(Math.floor(nonNegative(price)) / unit) * nonNegative(pointsPerUnit);
  }

  // ポイント分を引いた実質価格。0 より下にはしない
  function effectivePrice(price, points, yenPerPoint) {
    return Math.max(0, nonNegative(price) - nonNegative(points) * nonNegative(yenPerPoint));
  }

  // 端数処理後の実際の還元率（%）
  function effectiveRate(price, points, yenPerPoint) {
    const p = nonNegative(price);
    return p === 0 ? 0 : (nonNegative(points) * nonNegative(yenPerPoint) * PERCENT) / p;
  }

  // 還元率 r% は、値引きに直すと r ÷（100 ＋ r）%
  function discountEquivalent(ratePercent) {
    const r = nonNegative(ratePercent);
    return (r * PERCENT) / (PERCENT + r);
  }

  // 入力一式 → 結果一式。method: "rate"（還元率）| "unit"（○円ごとに○ポイント）
  function summary(input) {
    const points = input.method === "unit"
      ? pointsByUnit(input.price, input.unitYen, input.pointsPerUnit)
      : pointsByRate(input.price, input.rate);
    const rate = effectiveRate(input.price, points, input.yenPerPoint);
    return { points, effectivePrice: effectivePrice(input.price, points, input.yenPerPoint),
      effectiveRate: rate, discountEquivalent: discountEquivalent(rate) };
  }

  return { nonNegative, pointsByRate, pointsByUnit, effectivePrice, effectiveRate, discountEquivalent, summary };
});
