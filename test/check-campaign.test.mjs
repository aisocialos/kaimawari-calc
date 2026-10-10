import test from "node:test";
import assert from "node:assert/strict";
import { parsePage, compare, readConfigCampaign } from "../scripts/check-campaign.mjs";

const HTML = '<p>2026年10月2日(金)10:00～2026年10月9日(金)01:59</p><p>2026年10月4日(日)20:00～2026年10月9日(金)01:59</p><dt>獲得上限ポイント数:</dt><dd>7,000ポイント (期間限定)</dd>';

test("公式ページから上限と期間を読む", () => {
  assert.deepEqual(parsePage(HTML), { ended: false, pointCap: 7000, period: "2026-10-4 20:00 ～ 2026-10-9 01:59" });
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
test("終了の案内だけのページは開催期間外として ok", () => {
  const page = parsePage("<p>お買い物マラソンは終了しました。ご参加いただきありがとうございました。</p>");
  assert.deepEqual(page, { ended: true, pointCap: null, period: null });
  const res = compare(page, { pointCap: 7000 });
  assert.equal(res.ok, true);
  assert.match(res.reason, /開催期間外/);
});
test("終了の文があっても上限が読めれば比べる", () => {
  const page = parsePage("<p>お買い物マラソンは終了しました</p><dt>獲得上限ポイント数:</dt><dd>5,000ポイント</dd>");
  assert.equal(compare(page, { pointCap: 7000 }).ok, false);
});
test("config.js から campaign を読む", () => {
  assert.equal(readConfigCampaign('window.SITE_CONFIG = { campaigns: { marathon: { pointCap: 7000 } } };').pointCap, 7000);
});
