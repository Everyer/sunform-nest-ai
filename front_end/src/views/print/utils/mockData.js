/**
 * 完全解耦的万能 JSON 数据结构
 * 废弃原有的固定 master / detail 主从设计，全部采用自由嵌套的真实行业 JSON 属性
 */

// 1. 销售订单报表数据源 (A4纵向，保持打平或深层嵌套以测试万能路径)
export const mockData = {
  orderNo: 'SO-20260524-001',
  customer: {
    name: '上海擎创智能科技有限公司',
    contact: '张经理',
    phone: '138-0000-2026'
  },
  createDate: '2026-05-24',
  salesperson: '李明',
  remarks: '送货地址：上海市张江高科技园区科苑路88号。',
  financial: {
    totalQuantity: 45,
    taxAmount: '5,733.60',
    totalAmount: '95,560.00',
    grandTotal: '101,293.60'
  },
  // 表格列表绑定 detail
  detail: [
    { index: 1, goodsCode: 'P001', goodsName: '企业专业版授权', spec: '年度订阅', unit: '套', quantity: 12, price: 3980.00, amount: 47760.00, remarks: '首年优惠' },
    { index: 2, goodsCode: 'P002', goodsName: '<div style="color: #2563eb; font-weight: bold;">报表设计实施服务</div><div style="font-size: 10px; color: #64748b;">(定制化高阶大盘排版开发)</div>', spec: '定制化开发', unit: '项', quantity: 1, price: 28000.00, amount: 28000.00, remarks: '含3个月质保' },
    { index: 3, goodsCode: 'P003', goodsName: '标准技术支持', spec: '5*8在线响应', unit: '年', quantity: 1, price: 12000.00, amount: 12000.00, remarks: '即时响应' },
    { 
      index: 4, 
      goodsCode: 'P004', 
      goodsName: '<div style="display: flex; align-items: center; gap: 8px;"><img src="https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg" style="width: 32px; height: 32px; border-radius: 4px; object-fit: cover; border: 1px solid #e2e8f0;" /><div><div>数据可视化模板包</div><div style="font-size: 10px; color: #10b981;">包含经典30套</div></div></div>', 
      spec: '精选30套', 
      unit: '个', 
      quantity: 3, 
      price: 2600.00, 
      amount: 7800.00, 
      remarks: '赠送移动端适配' 
    },
    { index: 5, goodsCode: 'P005', goodsName: '移动端App授权', spec: '终身授权', unit: '用户', quantity: 8, price: 1980.00, amount: 15840.00, remarks: '支持iOS/Android' }
  ]
};

// 2. 年度述职报告数据源 (A4纵向复杂多行)
export const reportMockData = {
  info: {
    year: '2025',
    deptName: '信息部',
    title: '前端开发工程师',
    author: '孙岩'
  },
  // 表格列表绑定 records
  records: [
    { 
      index: 1, 
      category: '年度工作总结', 
      content: '完成了基于 Vue3 的智能低代码表单引擎 sunform-v3 的开发与发布。', 
      achievements: '1. 创新集成 AI 大模型，开发效率提升 60% 以上。\n2. 融合LogicFlow流程引擎，实现复杂场景交付。', 
      finishTime: '2025年12月31日前' 
    },
    { 
      index: 2, 
      category: '年度工作总结', 
      content: '搭建并上线了集 MES 生产排程、SCADA 实时监控、实验室数字化管理及自研低代码平台于一体的前端系统。', 
      achievements: '自研落地低代码配置引擎，实现基础业务页面的可视化拖拽设计与快速生成。', 
      finishTime: '2025年12月31日前' 
    }
  ]
};

// 3. 客户送货单数据源 (A4横向宽幅)
export const deliveryMockData = {
  deliveryCode: 'DN-20260525-9988',
  company: {
    clientName: '北京万盛数智物流集团',
    clientPhone: '010-8877-6655'
  },
  operator: '王发货',
  stampText: '【已出库】',
  summary: {
    cashAmount: '12,500.00'
  },
  // 表格列表绑定 items
  items: [
    { index: 1, desc: '商贸物流专用高密周转周转箱 (中号)', qty: 100, unit: '个', price: 45.00, amount: 4500.00, trackingCode: 'BOX-M-998' },
    { index: 2, desc: '防静电打包带 (绿色 1500米)', qty: 10, unit: '卷', price: 120.00, amount: 1200.00, trackingCode: 'BAND-G-002' },
    { index: 3, desc: '超重载地牛搬运车 (3.0吨级)', qty: 2, unit: '台', price: 3400.00, amount: 6800.00, trackingCode: 'CART-30T' }
  ]
};

// 4. 固定资产卡片数据源 (A5紧凑卡)
export const assetMockData = {
  assetName: '智能核心千兆交换机 Node-09',
  keeperDept: '网络工程部',
  assetCode: 'AST-SW-2026-9901',
  warnTips: '警告：此卡片为固定资产标识，请勿随意撕毁、涂改，遗失请速联系网络中心补办！'
};
