// ポイント還元でもらえるポイントと実質価格（純粋関数のみ）
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.PointCalc = api;
})(typeof self !== "undefined" ? self : this, function () {
  const PERCENT = 100;
  const DECIMAL_BASE = 10n;
  // 数を文字にしたときの形：整数部・小数部・指数（1e-7 など）
  const NUMBER_PARTS = /^(\d+)(?:\.(\d+))?(?:e([+-]\d+))?$/;

  // 0 以上の有限の数にする。それ以外は 0
  function nonNegative(value) {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }

  // 金額を 0 以上の整数（円）にする
  function toYen(value) {
    return Math.floor(nonNegative(value));
  }

  // 0 以上の数を「整数 ÷ 10 の decimals 乗」の形にする（0.7 → 7 と 1）。小数の誤差を持ち込まないため
  function toScaled(value) {
    const m = NUMBER_PARTS.exec(String(nonNegative(value)));
    const frac = m[2] || "";
    const decimals = frac.length - Number(m[3] || 0);
    const digits = BigInt(m[1] + frac);
    return decimals >= 0 ? { digits, decimals } : { digits: digits * DECIMAL_BASE ** BigInt(-decimals), decimals: 0 };
  }

  // 還元率（%）でもらえるポイント。1ポイント未満は切り捨て
  function pointsByRate(price, ratePercent) {
    const rate = toScaled(ratePercent);
    return Number((BigInt(toYen(price)) * rate.digits) / (BigInt(PERCENT) * DECIMAL_BASE ** BigInt(rate.decimals)));
  }

  // 「unitYen 円ごとに pointsPerUnit ポイント」でもらえるポイント
  function pointsByUnit(price, unitYen, pointsPerUnit) {
    const unit = nonNegative(unitYen);
    if (unit === 0) return 0;
    return Math.floor(toYen(price) / unit) * nonNegative(pointsPerUnit);
  }

  // ポイント分を引いた実質価格。0 より下にはしない
  function effectivePrice(price, points, yenPerPoint) {
    return Math.max(0, toYen(price) - nonNegative(points) * nonNegative(yenPerPoint));
  }

  // 端数処理後の実際の還元率（%）
  function effectiveRate(price, points, yenPerPoint) {
    const p = toYen(price);
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

  return { nonNegative, toYen, toScaled, pointsByRate, pointsByUnit, effectivePrice, effectiveRate, discountEquivalent, summary };
});
