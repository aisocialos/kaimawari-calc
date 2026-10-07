// SPU（楽天カード・楽天モバイル・楽天銀行）で楽天市場のポイントがいくら増えるか（純粋関数のみ）
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.SpuCalc = api;
})(typeof self !== "undefined" ? self : this, function () {
  const PERCENT = 100;

  // 倍率 rate（+1倍なら 1）でもらえるポイント。cap が null なら上限なし
  function itemPoints(base, rate, cap) {
    const p = Math.floor((base * rate) / PERCENT);
    return cap === null ? p : Math.min(cap, p);
  }

  // 上限に届く金額。上限なしなら null
  function capReachAmount(rate, cap) {
    if (cap === null || rate <= 0) return null;
    return Math.ceil((cap * PERCENT) / rate);
  }

  // 税込の月間購入額 → 計算の基になる金額（税込・税抜）
  function bases(spendTaxIn, taxRate) {
    const taxIn = Math.max(0, Number(spendTaxIn) || 0);
    return { taxIn, taxEx: Math.floor((taxIn * PERCENT) / (PERCENT + taxRate)) };
  }

  // 選んだサービスごとの内訳。options: { card: "none"|"normal"|"premium", mobile: bool }
  function breakdown(spendTaxIn, options, spu) {
    const b = bases(spendTaxIn, spu.taxRate);
    const rows = [];
    const push = (item, rate, cap) => {
      const base = b[item.base];
      rows.push({ key: item.key, label: item.label, rate, cap, base: item.base,
        points: itemPoints(base, rate, cap), capReachAt: capReachAmount(rate, cap) });
    };
    if (options.mobile) push(spu.mobile, spu.mobile.rate, spu.mobile.cap);
    if (options.card !== "none") {
      push(spu.cardNormal, spu.cardNormal.rate, spu.cardNormal.cap);
      push(spu.cardBonus, spu.cardBonus.rate, spu.cardBonus.cap[options.card]);
    }
    const monthly = rows.reduce((a, r) => a + r.points, 0);
    return { bases: b, rows, monthly, yearly: monthly * 12 };
  }

  return { itemPoints, capReachAmount, bases, breakdown };
});
