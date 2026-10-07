[阻断]

1. **有限输入会因中间乘法溢出，导致返点率和折扣换算错误。**  
   位置：`assets/point.js:53`，`effectiveRate()`；`assets/point.js:59`，`discountEquivalent()`。  
   可复现：`discountEquivalent(1e307)` 返回 `Infinity`，正确结果应接近 **100%**。`summary({price:100, method:"rate", rate:1e307, yenPerPoint:1})` 返回实际返点率 `Infinity`、等价折扣 **0%**，而正确结果分别应为约 `1e307%`、**100%**。输入均为有限非负数，页面也未限制其上限。  
   修改：避免先乘 100 导致中间值溢出；折扣公式可改为 `r / (100 + r) * 100`，实际返点率也应调整计算顺序，并增加上述回归测试。

[建议]

无。

[范围外]

无。

验证：`npm test` **38 项全部通过**，上一轮三项意见均已落实。首页、tax 页及 sitemap 的新增链接均指向 `/point`。覆盖率命令因只读环境无法创建临时目录而失败，未能独立核实 80% 门槛；未执行浏览器及线上验收。
[阻断]

1. **有限输入会因中间乘法溢出，导致返点率和折扣换算错误。**  
   位置：`assets/point.js:53`，`effectiveRate()`；`assets/point.js:59`，`discountEquivalent()`。  
   可复现：`discountEquivalent(1e307)` 返回 `Infinity`，正确结果应接近 **100%**。`summary({price:100, method:"rate", rate:1e307, yenPerPoint:1})` 返回实际返点率 `Infinity`、等价折扣 **0%**，而正确结果分别应为约 `1e307%`、**100%**。输入均为有限非负数，页面也未限制其上限。  
   修改：避免先乘 100 导致中间值溢出；折扣公式可改为 `r / (100 + r) * 100`，实际返点率也应调整计算顺序，并增加上述回归测试。

[建议]

无。

[范围外]

无。

验证：`npm test` **38 项全部通过**，上一轮三项意见均已落实。首页、tax 页及 sitemap 的新增链接均指向 `/point`。覆盖率命令因只读环境无法创建临时目录而失败，未能独立核实 80% 门槛；未执行浏览器及线上验收。