# 第 3 轮回应（tax）

无阻断，收敛。

- [建议] 两条公式的税率写法不一致：采纳。`tax.html` 税抜公式改成「税抜 × 税率 ÷ 100」，并写明税率填 10 或 8。
- 覆盖率：Codex 的只读环境跑不了覆盖率命令。本机实测 `node --test --experimental-test-coverage test/tax.test.js`，`tax.js` 行覆盖 98.04%。
