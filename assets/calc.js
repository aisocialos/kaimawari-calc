// お買い物マラソンの買いまわりポイント計算（純粋関数のみ。画面処理は index.html 側）
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.KaimawariCalc = api;
})(typeof self !== "undefined" ? self : this, function () {
  const PERCENT = 100;

  // 税込価格 → 税抜価格（円未満切り捨て）
  function taxExcluded(priceTaxIn, taxRate) {
    return Math.floor((priceTaxIn * PERCENT) / (PERCENT + taxRate));
  }

  // 商品リストをショップごとに合算し、1ショップとして数えるか判定する
  function groupShops(items, campaign) {
    const byName = new Map();
    for (const it of items) {
      const price = Number(it.price);
      if (!Number.isFinite(price) || price <= 0) continue;
      const name = String(it.shop || "").trim();
      const s = byName.get(name) || { name, taxIn: 0, taxEx: 0 };
      s.taxIn += price;
      s.taxEx += taxExcluded(price, Number(it.taxRate));
      byName.set(name, s);
    }
    return [...byName.values()].map((s) => ({
      ...s,
      counted: s.taxIn >= campaign.minShopAmountTaxIn,
      shortfall: Math.max(0, campaign.minShopAmountTaxIn - s.taxIn),
    }));
  }

  // 達成ショップ数 → 倍率（通常の1倍を含む）
  function multiplierFor(countedShops, campaign) {
    return Math.min(Math.max(countedShops, 1), campaign.maxMultiplier);
  }

  // 買いまわり特典ポイント（通常の1倍を除く。上限あり）
  function bonusPoints(totalTaxEx, multiplier, campaign) {
    return Math.min(campaign.pointCap, Math.floor((totalTaxEx * (multiplier - 1)) / PERCENT));
  }

  // この倍率で上限に届く税抜購入額。倍率1倍なら上限に届かないので null
  function capReachTaxEx(multiplier, campaign) {
    if (multiplier <= 1) return null;
    return Math.ceil((campaign.pointCap * PERCENT) / (multiplier - 1));
  }

  // 入力全体の集計
  function summarize(items, campaign) {
    const shops = groupShops(items, campaign);
    const countedShops = shops.filter((s) => s.counted).length;
    const multiplier = multiplierFor(countedShops, campaign);
    const totalTaxIn = shops.reduce((a, s) => a + s.taxIn, 0);
    // 1,000円未満のショップの分は買いまわり特典の対象外として扱う（公式ガイド「1,000円(税込)以上の場合、ショップ買い回りの対象」）
    const eligibleTaxEx = shops.filter((s) => s.counted).reduce((a, s) => a + s.taxEx, 0);
    const bonus = bonusPoints(eligibleTaxEx, multiplier, campaign);
    const capAt = capReachTaxEx(multiplier, campaign);
    return {
      shops,
      countedShops,
      multiplier,
      totalTaxIn,
      eligibleTaxEx,
      bonus,
      capReached: bonus >= campaign.pointCap,
      capReachTaxEx: capAt,
      roomBeforeCapTaxEx: capAt === null ? null : Math.max(0, capAt - eligibleTaxEx),
      unnamedRows: items.filter((it) => Number(it.price) > 0 && !String(it.shop || "").trim()).length,
    };
  }

  // 新しいショップで addTaxIn 円（税込）買い足したときに増える特典ポイント
  function nextShopGain(items, campaign, addTaxIn, taxRate) {
    const before = summarize(items, campaign);
    const NEW_SHOP = "\u0000next-shop";
    const after = summarize(items.concat([{ shop: NEW_SHOP, price: addTaxIn, taxRate }]), campaign);
    return after.bonus - before.bonus;
  }

  return { taxExcluded, groupShops, multiplierFor, bonusPoints, capReachTaxEx, summarize, nextShopGain };
});
