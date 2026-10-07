// 楽天お買い物マラソンの公式ページを読み、ポイント上限が config.js と違えば知らせる
import { readFileSync, appendFileSync } from "node:fs";
import vm from "node:vm";

const PAGE_URL = "https://event.rakuten.co.jp/campaign/point-up/marathon/";

export function readConfigCampaign(source) {
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox);
  return sandbox.window.SITE_CONFIG.campaigns.marathon;
}

export function parsePage(html) {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  const cap = text.match(/獲得上限ポイント数\s*[:：]\s*([0-9,]+)\s*ポイント/);
  const periods = [...text.matchAll(/(\d{4})年(\d{1,2})月(\d{1,2})日\(.\)\s*(\d{1,2}:\d{2})\s*～\s*(\d{4})年(\d{1,2})月(\d{1,2})日\(.\)\s*(\d{1,2}:\d{2})/g)];
  const last = periods[periods.length - 1];
  return {
    pointCap: cap ? Number(cap[1].replace(/,/g, "")) : null,
    period: last ? `${last[1]}-${last[2]}-${last[3]} ${last[4]} ～ ${last[5]}-${last[6]}-${last[7]} ${last[8]}` : null,
  };
}

export function compare(page, campaign) {
  if (page.pointCap === null) return { ok: false, reason: "公式ページから上限を読み取れませんでした（ページ構造が変わった可能性）" };
  if (page.pointCap !== campaign.pointCap) return { ok: false, reason: `上限が違います：公式 ${page.pointCap} / config ${campaign.pointCap}（期間 ${page.period}）` };
  return { ok: true, reason: `一致：上限 ${page.pointCap}（期間 ${page.period}）` };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const res = await fetch(PAGE_URL, { headers: { "User-Agent": "Mozilla/5.0 (kaimawari-calc campaign check)" } });
  const page = parsePage(await res.text());
  const result = compare(page, readConfigCampaign(readFileSync(new URL("../assets/config.js", import.meta.url), "utf8")));
  console.log(`${res.status} ${result.reason}`);
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `ok=${result.ok}\nreason=${result.reason}\n`);
}
