# Skill: 打印报表模板生成约束 (print-template-gen)

用于描述、规范和生成完全合规的打印报表 JSON 结构模板的约束框架。帮助大模型精确输出适合物理打印与前端画布完美对齐的设计数据。

## 📏 物理尺寸与高精度像素换算约束

打印设计通常采用物理毫米 (mm) 作为排版标准，但在大语言模型及前端渲染画布中，需在输出前统一转换为逻辑像素 (px)。
* **高精度换算公式**：`1mm = 3.779527559px`（简写为 `1mm ≈ 3.78px`）
* **A4 纸张排版标准 (DPI 96)**:
  * 纵向 (Portrait): 宽度 `210mm` (约 `794px`), 高度 `297mm` (约 `1123px`)
  * 横向 (Landscape): 宽度 `297mm` (约 `1123px`), 高度 `210mm` (约 `794px`)
* **A5 纸张排版标准**:
  * 纵向 (Portrait): 宽度 `148mm` (约 `559px`), 高度 `210mm` (约 `794px`)
* **A3 纸张排版标准**:
  * 纵向 (Portrait): 宽度 `297mm` (约 `1123px`), 高度 `420mm` (约 `1587px`)

---

## 🏗 打印模板核心 JSON 结构大纲

生成的设计模板必须符合如下数据模型规范：

```typescript
interface PrintTemplate {
  templateId: string;       // 模板唯一代码
  templateName: string;     // 模板友好显示名称
  apiPath: string;          // 绑定的内网详情/列表数据源接口路径 (例如 /api/v1/sales/order/detail)
  paperWidth: number;       // 纸张物理宽 (mm)
  paperHeight: number;      // 纸张物理高 (mm)
  isLandscape: boolean;     // 是否为横向打印
  pageMargins: {            // 物理页边距 (mm)
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  elements: PrintElement[]; // 打印元素绝对定位列表
}
```

---

## 🎨 打印元素类型规范 (PrintElement)

每个打印元素都采用绝对定位排版，单位为**像素 (px)**。请务必使用换算公式将毫米参数转换为 `x, y, width, height`。

### 1. 📄 文本组件 (`type: 'text'`)
用于展示固定标签字符或从接口拉取的数据插值表达式（`${master.fieldName}`）。
* **重要约束**：
  * 支持纯文本或绑定语法，例如：`"客户名称: ${master.customerName}"` 或 `"合计金额: ￥${master.totalAmount}"`。
  * `fontSize`、`fontColor`、`align`、`valign`、`fontWeight` 等属性均为必填或带合理默认值。
* **数据结构**：
  ```json
  {
    "id": "el_text_01",
    "type": "text",
    "x": 40,
    "y": 50,
    "width": 300,
    "height": 30,
    "value": "订单号: ${master.orderNo}",
    "fontSize": 14,
    "fontColor": "#0f172a",
    "align": "left",
    "valign": "middle",
    "fontWeight": "bold",
    "showStrategy": "all"
  }
  ```

### 2. 📊 明细表格组件 (`type: 'table'`)
用于渲染业务主从数据中的动态明细列表（如商品项目、对账条目等）。
* **重要约束**：
  * `dataSourcePath` 指定接口中数组的变量相对路径，例如 `"detail"` 或 `"items"`。
  * `columns` 为物理列宽排版基准，其总宽度必须与表格自身的 `width` 完全相等。
  * `columns` 的 `field` 属性一律为 `detail.xxx` 格式（如 `detail.goodsName`），系统分页引擎会自动感知并渲染。
  * 允许定义多行合并复杂表头 `headerRows`，每个单元格可使用 `rowspan` 和 `colspan` 进行跨度合并，必须保证总合并跨度与 `columns` 数目完美对齐。
* **数据结构**：
  ```json
  {
    "id": "el_table_01",
    "type": "table",
    "x": 40,
    "y": 180,
    "width": 718,
    "height": 160,
    "dataSourcePath": "detail",
    "repeatHeader": true,
    "showStrategy": "all",
    "columns": [
      { "title": "序号", "field": "detail.index", "width": 50, "align": "center" },
      { "title": "商品名称", "field": "detail.goodsName", "width": 300, "align": "left" },
      { "title": "数量", "field": "detail.quantity", "width": 80, "align": "right" },
      { "title": "单价", "field": "detail.price", "width": 100, "align": "right" },
      { "title": "金额", "field": "detail.amount", "width": 188, "align": "right" }
    ],
    "headerRows": [
      [
        { "title": "商品采购清单明细表", "rowspan": 1, "colspan": 5, "align": "center", "backgroundColor": "#f8fafc", "fontWeight": "bold" }
      ],
      [
        { "title": "序号", "rowspan": 1, "colspan": 1, "align": "center", "backgroundColor": "#eff6ff", "fontWeight": "bold" },
        { "title": "商品信息", "rowspan": 1, "colspan": 1, "align": "left", "backgroundColor": "#eff6ff", "fontWeight": "bold" },
        { "title": "采购数", "rowspan": 1, "colspan": 1, "align": "right", "backgroundColor": "#eff6ff", "fontWeight": "bold" },
        { "title": "单价", "rowspan": 1, "colspan": 1, "align": "right", "backgroundColor": "#eff6ff", "fontWeight": "bold" },
        { "title": "小计金额", "rowspan": 1, "colspan": 1, "align": "right", "backgroundColor": "#eff6ff", "fontWeight": "bold" }
      ]
    ]
  }
  ```

### 3. 🏷 码元组件：条形码/二维码 (`type: 'barcode' | 'qrcode'`)
用于移动端、扫码枪与仓储系统高画质扫码交互。
* **重要约束**：
  * `value` 必须绑定主表字段，例如 `${master.orderNo}`。
  * 条形码高画质尺寸建议：宽 `180px - 220px`，高 `50px - 70px`，`showText`（是否显示底部条码数值）必填。
  * 二维码最佳正方形尺寸：`80px * 80px` 到 `110px * 110px`。
* **数据结构**：
  ```json
  {
    "id": "el_qrcode_01",
    "type": "qrcode",
    "x": 650,
    "y": 40,
    "width": 90,
    "height": 90,
    "value": "${master.orderNo}",
    "showStrategy": "all"
  }
  ```

### 4. 🔲 辅助性线框组件：横线条/竖线条/矩形框 (`type: 'line-h' | 'line-v' | 'rect'`)
提供打印物理分割线、表格边线和盖章框。
* **数据结构**：
  ```json
  {
    "id": "el_line_h_01",
    "type": "line-h",
    "x": 40,
    "y": 140,
    "width": 718,
    "height": 10,
    "borderWidth": 1,
    "borderStyle": "solid",
    "fontColor": "#cbd5e1",
    "showStrategy": "all"
  }
  ```

### 5. 🔢 页码组件 (`type: 'page-number'`)
渲染形如“第 1 页 / 共 3 页”的流式物理分页指示器。
* **重要约束**：
  * **绝不能**提供 `value` 属性！系统分页引擎会自动根据物理切页累加高度，在页脚自动生成并呈现正确的页码值。
* **数据结构**：
  ```json
  {
    "id": "el_pagenum_01",
    "type": "page-number",
    "x": 347,
    "y": 1080,
    "width": 100,
    "height": 30,
    "fontSize": 11,
    "fontColor": "#64748b",
    "align": "center",
    "valign": "middle",
    "showStrategy": "all"
  }
  ```

---

## 🔀 打印流式分页策略约束 (`showStrategy`)

物理打印与标准网页不同，由于页面高度限制，长表格及长内容会导致切页。每个元素都可以通过配置 `showStrategy` 决定其物理切页呈现机制：
1. `all` (默认): 在所有切分出来的物理页面均渲染显示。常用于公司Logo、基础边线、页脚等。
2. `first`: 仅在排版出来的**第一页**显示。常用于报表大标题、送货单主头客户信息等。
3. `last`: 仅在排版出来的**最后一页**显示。常用于财务大写合计、签收人签字盖章框等。
4. `no-first`: 第一页不渲染，后续所有页面均渲染。
5. `no-last`: 最后一页不渲染，其余所有页面均渲染。

---

## 💡 AI 设计大纲自适应排版生成最佳实践 (Best Practices)

1. **避免元素重叠**：物理 Y 坐标必须良好规划。
2. **居中对齐原则**：横向 A4 可用约 `1080px`，纵向可用约 `718px`，元素应该科学贴边或居中。
3. **高画质码元**：条形码、二维码必须提供正确的绝对宽高度，且其 `showStrategy` 应设为合理的值。
