import test from "node:test";
import assert from "node:assert/strict";
import { parsePage, compare, readConfigCampaign } from "../scripts/check-campaign.mjs";

const HTML = '<p>2026年10月2日(金)10:00～2026年10月9日(金)01:59</p><p>2026年10月4日(日)20:00～2026年10月9日(金)01:59</p><dt>獲得上限ポイント数:</dt><dd>7,000ポイント (期間限定)</dd>';

test("公式ページから上限と期間を読む", () => {
  assert.deepEqual(parsePage(HTML), { pointCap: 7000, period: "2026-10-4 20:00 ～ 2026-10-9 01:59" });
});
test("上限が同じなら ok、違えば理由つきで ng", () => {
  assert.equal(compare({ pointCap: 7000, period: "p" }, { pointCap: 7000 }).ok, true);
  const ng = compare({ pointCap: 5000, period: "p" }, { pointCap: 7000 });
  assert.equal(ng.ok, false);
  assert.match(ng.reason, /公式 5000 \/ config 7000/);
});
test("読み取れなければ ng", () => {
  assert.equal(compare(parsePage("<p>no data</p>"), { pointCap: 7000 }).ok, false);
});
test("config.js から campaign を読む", () => {
  assert.equal(readConfigCampaign('window.SITE_CONFIG = { campaigns: { marathon: { pointCap: 7000 } } };').pointCap, 7000);
});
