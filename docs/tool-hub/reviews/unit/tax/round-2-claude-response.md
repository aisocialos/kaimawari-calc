# 第 2 轮回应（tax）

- [阻断] 负数、非有限入参没归零：采纳。`assets/tax.js` 加 `toRate`，`roundTax` 对负数和非有限数返回 0，两个换算函数先过 `toRate`。`test/tax.test.js` 加「負の数・数でない値は 0 として扱う」一组。
- [建议] 恢复缓存不校验：采纳。`roundTax` 改用 `Object.hasOwn` 查取整方式；`assets/tax-app.js` 的 `load` 用 `toYen` 清理金额，`direction`、`mode` 不在下拉选项里就退回初始值。浏览器实测加一条写坏缓存后刷新的用例。
- [范围外] 隐私页的「すべて消す」不适用于税页：规格里写了隐私说明要覆盖新页面，这次一起改了 `privacy.html` 那一句。
