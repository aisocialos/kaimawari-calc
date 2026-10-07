// 割引率・割引後の価格・クーポンの重ねがけ（純粋関数のみ）
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.DiscountCalc = api;
})(typeof self !== "undefined" ? self : this, function () {
  const PERCENT = 100;
  const WARI = 10; // 1割 ＝ 10%
  const DECIMAL_BASE = 10n;
  // 入力の上限。これより大きい整数は正確に表せないので、上限として扱う
  const MAX_INPUT = Number.MAX_SAFE_INTEGER;
  // 数を文字にしたときの形：整数部・小数部・指数（1e-7 など。上限があるので指数は負だけ）
  const NUMBER_PARTS = /^(\d+)(?:\.(\d+))?(?:e-(\d+))?$/;

  // 金額を 0 以上・上限以下の整数（円）にする。負の数・数でないものは 0
  function toYen(value) {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? Math.floor(Math.min(n, MAX_INPUT)) : 0;
  }

  // 割引率を 0〜100 の数にする。負の数・数でないものは 0
  function toPercent(value) {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? Math.min(n, PERCENT) : 0;
  }

  // percentOff% 引いた価格。1円未満は切り捨て。小数の割引率でも誤差が出ないよう整数で計算する
  function priceAfterPercent(price, percentOff) {
    const m = NUMBER_PARTS.exec(String(toPercent(percentOff)));
    const frac = m[2] || "";
    const scale = DECIMAL_BASE ** BigInt(frac.length + Number(m[3] || 0));
    const keep = BigInt(PERCENT) * scale - BigInt(m[1] + frac);
    return Number((BigInt(toYen(price)) * keep) / (BigInt(PERCENT) * scale));
  }

  // yenOff 円引いた価格。0 より下にはしない
  function priceAfterYen(price, yenOff) {
    return Math.max(0, toYen(price) - toYen(yenOff));
  }

  // 元の価格と売値 → 何%OFF・何割引・何掛け・値引き額。元の価格が 0 なら全部 0
  function discountRate(original, sale) {
    const o = toYen(original);
    const s = toYen(sale);
    if (o === 0) return { percentOff: 0, wari: 0, kake: 0, saved: 0 };
    // 先に掛けてから割る（20%OFF＋10%OFF が 28.000000000000004 にならないように）
    const percentOff = ((o - s) * PERCENT) / o;
    return { percentOff, wari: percentOff / WARI, kake: (s * WARI) / o, saved: o - s };
  }

  // クーポンを並んだ順に適用する。coupons: [{ type: "percent" | "yen", value }]。value が 0 以下・種類が違うものは飛ばす
  function applyCoupons(price, coupons) {
    const start = toYen(price);
    const steps = [];
    let current = start;
    for (const c of coupons) {
      const isPercent = c.type === "percent";
      if (!isPercent && c.type !== "yen") continue;
      const value = isPercent ? toPercent(c.value) : toYen(c.value);
      if (value === 0) continue;
      const after = isPercent ? priceAfterPercent(current, value) : priceAfterYen(current, value);
      steps.push({ type: c.type, value, before: current, after });
      current = after;
    }
    return { steps, final: current, saved: start - current, percentOff: discountRate(start, current).percentOff };
  }

  return { MAX_INPUT, toYen, toPercent, priceAfterPercent, priceAfterYen, discountRate, applyCoupons };
});
