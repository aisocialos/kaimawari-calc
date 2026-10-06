const test = require("node:test");
const assert = require("node:assert/strict");
const C = require("../assets/calc.js");

const CAMPAIGN = { minShopAmountTaxIn: 1000, maxMultiplier: 10, pointCap: 7000, defaultTaxRate: 10 };
const item = (shop, price, taxRate = 10) => ({ shop, price, taxRate });

test("税込から税抜：10% と 8%、円未満切り捨て", () => {
  assert.equal(C.taxExcluded(1100, 10), 1000);
  assert.equal(C.taxExcluded(1080, 8), 1000);
  assert.equal(C.taxExcluded(1000, 10), 909);
});

test("同じショップは合算して1店、1,000円未満は数えない", () => {
  const shops = C.groupShops([item("A", 600), item("A", 500), item("B", 999)], CAMPAIGN);
  const a = shops.find((s) => s.name === "A");
  const b = shops.find((s) => s.name === "B");
  assert.equal(a.taxIn, 1100);
  assert.equal(a.counted, true);
  assert.equal(b.counted, false);
  assert.equal(b.shortfall, 1);
});

test("店名の前後の空白は同じ店として扱う", () => {
  const shops = C.groupShops([item(" A", 600), item("A ", 600)], CAMPAIGN);
  assert.equal(shops.length, 1);
});

test("価格が空・0・負の行は無視する", () => {
  const shops = C.groupShops([item("A", ""), item("B", 0), item("C", -5), item("D", 2000)], CAMPAIGN);
  assert.deepEqual(shops.map((s) => s.name), ["D"]);
});

test("倍率：0店と1店は1倍、10店以上は10倍", () => {
  assert.equal(C.multiplierFor(0, CAMPAIGN), 1);
  assert.equal(C.multiplierFor(1, CAMPAIGN), 1);
  assert.equal(C.multiplierFor(2, CAMPAIGN), 2);
  assert.equal(C.multiplierFor(12, CAMPAIGN), 10);
});

test("特典ポイント：税抜×(倍率−1)%、上限7,000", () => {
  assert.equal(C.bonusPoints(10000, 10, CAMPAIGN), 900);
  assert.equal(C.bonusPoints(10000, 1, CAMPAIGN), 0);
  assert.equal(C.bonusPoints(1000000, 10, CAMPAIGN), 7000);
});

test("上限に届く税抜額：10倍なら77,778円、1倍は届かない", () => {
  assert.equal(C.capReachTaxEx(10, CAMPAIGN), 77778);
  assert.equal(C.capReachTaxEx(2, CAMPAIGN), 700000);
  assert.equal(C.capReachTaxEx(1, CAMPAIGN), null);
  assert.ok(C.bonusPoints(77778, 10, CAMPAIGN) >= 7000);
  assert.ok(C.bonusPoints(77777, 10, CAMPAIGN) < 7000);
});

test("集計：3店で合計税込33,000円 → 3倍、特典600pt", () => {
  const s = C.summarize([item("A", 11000), item("B", 11000), item("C", 11000)], CAMPAIGN);
  assert.equal(s.countedShops, 3);
  assert.equal(s.multiplier, 3);
  assert.equal(s.eligibleTaxEx, 30000);
  assert.equal(s.bonus, 600);
  assert.equal(s.capReached, false);
  assert.equal(s.roomBeforeCapTaxEx, 350000 - 30000);
});

test("1,000円未満の店の購入額は特典の対象額に入れない", () => {
  const s = C.summarize([item("A", 11000), item("B", 11000), item("C", 550)], CAMPAIGN);
  assert.equal(s.countedShops, 2);
  assert.equal(s.eligibleTaxEx, 20000);
  assert.equal(s.bonus, 200);
  assert.equal(s.totalTaxIn, 22550);
});

test("店名が空の行を数える", () => {
  const s = C.summarize([item("", 2000), item(" ", 3000), item("A", 2000)], CAMPAIGN);
  assert.equal(s.unnamedRows, 2);
  assert.equal(s.countedShops, 2);
});

test("あと1店：3店・税抜30,000円に1,100円の店を足すと +330pt", () => {
  const items = [item("A", 11000), item("B", 11000), item("C", 11000)];
  // 足した後：4倍、税抜31,000 → 930pt。足す前 600pt
  assert.equal(C.nextShopGain(items, CAMPAIGN, 1100, 10), 330);
});

test("あと1店：上限到達済みなら増えない、10店以上なら倍率は増えない", () => {
  const capped = Array.from({ length: 10 }, (_, i) => item("S" + i, 10000));
  assert.equal(C.summarize(capped, CAMPAIGN).bonus, 7000);
  assert.equal(C.nextShopGain(capped, CAMPAIGN, 1100, 10), 0);
});
