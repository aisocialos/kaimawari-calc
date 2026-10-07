# 工具集合：三个计算工具 + 工具一览

在 kaimawari.fynexus.com 上依次加三个纯前端计算页，首页加「ツール一覧」。不注册、不收费、输入不出浏览器。代价：多 3 个页面要维护，没有新增联盟链接。

来源：`lookout/new-directions/handoff-tool-hub.md`（用户原话「做1个工具集合，用户只要进来就能使用，没有门槛没有成本」）。

## 范围

- 页面 `/tax`：含税、不含税换算，10% 与 8% 对照。
- 页面 `/point`：积分返点、实际到手价。
- 页面 `/discount`：折扣率、几折、优惠券叠加。
- 首页 `index.html` 加「ツール一覧」一节，列出全部工具页。
- `sitemap.xml` 加三个网址；`privacy.html` 的说明覆盖新页面。

不做：

- 不生成新的联盟链接。`/point`、`/discount` 复用首页那条 `rakutenFindLink`（用户 2026-10-07 指定），照首页加页首说明、PR 标记、页脚说明；`/tax` 不放链接、不出广告标示。
- 不挂 AdSense。
- 不改现有三个计算器的计算逻辑。
- 不做第四个工具；超出三个的先问用户。

## 文件

每个工具三件：`<name>.html`、`assets/<name>.js`（纯函数，UMD 写法同 `assets/spu.js`）、`assets/<name>-app.js`（画面），测试 `test/<name>.test.js`。税率、取整方式、初始值放 `assets/config.js`。

## 原子功能

金额一律是非负整数日元；入参不是有限数或为负时按 0 处理。

### tax.js

`toYen(value: any): number`
- 输出：非负整数。`"1,000"` 这类带逗号的不处理，按 `Number()` 结果走。
- 依赖：无外部依赖。
- 验收：`toYen("")=0`，`toYen(-5)=0`，`toYen(1980.9)=1980`，`toYen("abc")=0`。

`roundTax(amount: number, mode: "floor"|"round"|"ceil"): number`
- 输出：按方式取整的税额。
- 依赖：无外部依赖。
- 验收：`roundTax(11.5,"floor")=11`，`"round"=12`，`"ceil"=12`；`roundTax(11,"ceil")=11`。

`fromTaxExcluded(taxEx: number, rate: number, mode): {taxEx, tax, taxIn}`
- 处理：`tax = roundTax(taxEx*rate/100)`，`taxIn = taxEx + tax`。
- 依赖：`toYen`、`roundTax`。
- 验收：`(1000,10,"floor") → {1000,100,1100}`；`(115,10,"floor") → tax 11`，`"round" → 12`；`(1980,8,"floor") → tax 158, taxIn 2138`。

`fromTaxIncluded(taxIn: number, rate: number, mode): {taxEx, tax, taxIn}`
- 处理：`tax = roundTax(taxIn*rate/(100+rate))`，`taxEx = taxIn - tax`。
- 依赖：`toYen`、`roundTax`。
- 验收：`(1100,10,"floor") → {1000,100,1100}`；`(1080,8,"floor") → {1000,80,1080}`；`(1000,10,"floor") → tax 90, taxEx 910`；`(1000,10,"round") → tax 91, taxEx 909`。

`convert(amount, direction: "in"|"ex", rates: number[], mode): Array<{rate, taxEx, tax, taxIn}>`
- 处理：`direction="ex"` 表示输入是不含税价，对每个税率调 `fromTaxExcluded`；`"in"` 调 `fromTaxIncluded`。
- 依赖：`fromTaxExcluded`、`fromTaxIncluded`。
- 验收：`convert(1000,"ex",[10,8],"floor")` 返回两行，含税价 1100 和 1080。

### point.js

所有数值入参的上限是 `Number.MAX_SAFE_INTEGER`，超过的按上限算；返回的积分数也不超过这个上限。价格和「何円ごとに」先舍去小数成整数日元。这样任何有限输入都不会让中间结果溢出。

`pointsByRate(price: number, ratePercent: number): number`
- 处理：`floor(price*ratePercent/100)`。
- 依赖：无外部依赖。
- 验收：`(1980,1)=19`；`(1980,0.5)=9`；`(10000,10)=1000`；负数或非数返回 0。

`pointsByUnit(price: number, unitYen: number, pointsPerUnit: number): number`
- 处理：`floor(price/unitYen)*pointsPerUnit`；`unitYen` 取整后为 0 时返回 0。
- 依赖：无外部依赖。
- 验收：`(1980,200,1)=9`；`(199,200,1)=0`；`(1000,100,1)=10`；`(1000,0,1)=0`。

`effectivePrice(price: number, points: number, yenPerPoint: number): number`
- 处理：`price - points*yenPerPoint`，下限 0。
- 依赖：无外部依赖。
- 验收：`(1980,19,1)=1961`；`(1000,100,0.8)=920`；`(100,500,1)=0`。

`effectiveRate(price: number, points: number, yenPerPoint: number): number`
- 输出：实际返点率（%），`price=0` 时为 0。
- 依赖：无外部依赖。
- 验收：`(1980,9,1)` 约 0.4545；`(0,9,1)=0`。

`discountEquivalent(ratePercent: number): number`
- 处理：返点 r% 等同于直接降价 `r/(100+r)*100` %（拿到的积分要再买东西才用得上）。
- 依赖：无外部依赖。
- 验收：`(10)` 约 9.0909；`(100)=50`；`(0)=0`。

`summary(input: {price, method: "rate"|"unit", rate, unitYen, pointsPerUnit, yenPerPoint}): {points, effectivePrice, effectiveRate, discountEquivalent}`
- 依赖：上面五个。
- 验收：`{price:1980, method:"unit", unitYen:200, pointsPerUnit:1, yenPerPoint:1}` → 积分 9、到手价 1971。

### discount.js

金额上限是 `Number.MAX_SAFE_INTEGER`，超过的按上限算，先舍去小数成整数日元；折扣率限制在 0–100。小数折扣率按十进制写法拆成整数再算，不因浮点误差差 1 円。

页面除了显示 `applyCoupons` 的结果，还做两件事：两张以上 %OFF 券时提示「合计不是简单相加」；把券的顺序倒过来再算一次，结果不同就显示倒序的金额和差额。

`priceAfterPercent(price: number, percentOff: number): number`
- 处理：`floor(price*(100-percentOff)/100)`，`percentOff` 限制在 0–100。
- 依赖：无外部依赖。
- 验收：`(1980,30)=1386`；`(999,15)=849`；`(1000,120)=0`；`(1000,-5)=1000`。

`priceAfterYen(price: number, yenOff: number): number`
- 处理：`max(0, price - yenOff)`。
- 依赖：无外部依赖。
- 验收：`(1980,500)=1480`；`(300,500)=0`。

`discountRate(original: number, sale: number): {percentOff, wari, kake, saved}`
- 处理：`saved = original - sale`；`percentOff = saved*100/original`；`wari = percentOff/10`；`kake = sale*10/original`。`original=0` 时全为 0；`sale > original` 时 `saved` 为负，照实返回。
- 依赖：无外部依赖。
- 验收：`(2000,1500) → {25, 2.5, 7.5, 500}`；`(0,100) → 全 0`。

`applyCoupons(price: number, coupons: Array<{type: "percent"|"yen", value: number}>): {steps: Array<{type, value, before, after}>, final, saved, percentOff}`
- 处理：按数组顺序逐个套用；`value<=0` 或 `type` 不是这两种的跳过。
- 依赖：`priceAfterPercent`、`priceAfterYen`、`discountRate`。
- 验收：`10000` 套 `20%` 再 `10%` → 7200，合计 28%；`10000` 先 `500 円` 再 `10%` → 8550；先 `10%` 再 `500 円` → 8500。

## 页面编排

每个页面：读 `SITE_CONFIG` 里对应的初始值 → 从 `localStorage` 取上次输入（取不到用初始值）→ 输入变化时调纯函数 → 写结果区 → 存 `localStorage` → 发一次 `<name>-edit` 统计事件。

每个页面的 `<head>` 与 `spu-card.html` 同构：title、description、canonical、OG、favicon、`site.css`、`config.js`、`redirect.js`、`analytics.js`、WebApplication JSON-LD。

## 上线顺序与验收

一个工具一个 PR：tax → point → discount。工具一览随第一个 PR 上，之后每个 PR 往里加一行。

每个工具上线前：`npm test` 全过；新纯函数行覆盖 80% 以上；Codex 评审无阻断。先发 `--branch preview` 实测，再发 `--branch main`。

线上验收：页面 200；浏览器控制台无报错；375px 宽度下 `scrollWidth <= clientWidth`；首页到新页、新页回首页的链接都是 200；页面显示的结果与上面验收里的手算值一致。

## 上线后的判法（调研时定的）

每个新工具上线 4 周，Search Console 展示不到 100 次的，不再为这一类加工具。
