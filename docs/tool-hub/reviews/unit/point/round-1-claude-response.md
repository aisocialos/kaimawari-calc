# 第 1 轮回应（point）

- [阻断] 返点率被截到三位小数，`pointsByRate(10000, 0.9999)` 得 100：采纳。`assets/point.js` 去掉固定三位小数的做法，改成 `toScaled` 把返点率按十进制写法拆成整数和小数位数，用 BigInt 整数相乘再整除。`test/point.test.js` 加 0.9999、1e-7、1e21 的用例，原有浮点边界用例保留。
- [阻断] 价格取整不一致，`1980.9` 円显示 1,962 円：采纳。加 `toYen`，`pointsByRate`、`pointsByUnit`、`effectivePrice`、`effectiveRate` 都先把价格取成整数日元；`assets/point-app.js` 存进状态前也取整。加小数价格的单函数和 `summary` 测试。
- [建议] 缓存缺字段时变成 0：采纳。`load` 对缺失的字段用初始值，存在的字段才归零清理。
- 覆盖率：本机实测 `point.js` 行覆盖 98.63%。
