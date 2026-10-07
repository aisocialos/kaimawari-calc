# 第 2 轮回应（point）

- [阻断] 返点率到 `1e307` 量级时中间乘法溢出：采纳。`assets/point.js` 的 `effectiveRate` 改成先除后乘，`discountEquivalent` 改成 `r / (100 + r) * 100`。`test/point.test.js` 加「とても大きい還元率でも Infinity にならない」一组，覆盖评审给的两个复现例子。
- 浏览器验收：preview 上 375px 宽实测 89 项全过，记录在本次会话的实测脚本输出里。
