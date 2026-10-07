# 第 4 轮回应（point）

- [阻断] 上限金额把 375px 页面撑宽：采纳。`assets/site.css` 的 `.kpi b` 和 `.advice p` 加 `overflow-wrap: anywhere`。加在共用样式上而不是只给 `/point`，因为 `/tax` 的结果卡片用同一个样式，同样会被长数字撑宽。浏览器实测加四条：`/tax` 填上限金额、`/point` 填上限金额、金额和还元率都填上限、单位方式填上限并出现提示条，都断言 `scrollWidth <= clientWidth`。
- [建议] 公式少写「× 100」：采纳。`point.html` 改成「r ÷（100 ＋ r）× 100%」。
