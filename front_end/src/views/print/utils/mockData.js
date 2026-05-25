/**
 * 通用主从报表数据源配置与 Mock 数据
 */

// 数据源字段描述元数据 (方便在设计器左侧显示并拖拽绑定)
export const schema = {
  // 主表字段 (单值属性)
  master: [
    { key: 'orderNo', label: '订单编号', type: 'string', example: 'SO-20260524-001' },
    { key: 'customerName', label: '客户名称', type: 'string', example: '上海擎创智能科技有限公司' },
    { key: 'contactPerson', label: '联系人', type: 'string', example: '张经理' },
    { key: 'contactPhone', label: '联系电话', type: 'string', example: '138-0000-2026' },
    { key: 'createDate', label: '制单日期', type: 'string', example: '2026-05-24' },
    { key: 'salesperson', label: '业务员', type: 'string', example: '李明' },
    { key: 'remarks', label: '备注说明', type: 'string', example: '请送货前提前电话联系' },
    { key: 'totalQuantity', label: '总数量', type: 'number', example: 45 },
    { key: 'taxAmount', label: '税额', type: 'string', example: '￥5,733.60' },
    { key: 'totalAmount', label: '应收合计', type: 'string', example: '￥95,560.00' },
    { key: 'grandTotal', label: '价税合计', type: 'string', example: '￥101,293.60' }
  ],
  // 从表明细字段 (表格列属性)
  detail: [
    { key: 'index', label: '序号', type: 'number' },
    { key: 'goodsCode', label: '商品编码', type: 'string' },
    { key: 'goodsName', label: '商品名称', type: 'string' },
    { key: 'spec', label: '规格型号', type: 'string' },
    { key: 'unit', label: '单位', type: 'string' },
    { key: 'quantity', label: '数量', type: 'number' },
    { key: 'price', label: '单价', type: 'number' },
    { key: 'amount', label: '金额', type: 'number' },
    { key: 'remarks', label: '单行备注', type: 'string' }
  ]
};

// 真实的 Mock 数据源，供报表运行预览与打印时动态填充
export const mockData = {
  master: {
    orderNo: 'SO-20260524-001',
    customerName: '上海擎创智能科技有限公司',
    contactPerson: '张经理',
    contactPhone: '138-0000-2026',
    createDate: '2026-05-24',
    salesperson: '李明',
    remarks: '送货地址：上海市张江高科技园区科苑路88号，收货时间：工作日9:00-18:00。',
    totalQuantity: 45,
    taxAmount: '5,733.60',
    totalAmount: '95,560.00',
    grandTotal: '101,293.60'
  },
  detail: [
    { index: 1, goodsCode: 'P001', goodsName: '企业专业版授权', spec: '年度订阅', unit: '套', quantity: 12, price: 3980.00, amount: 47760.00, remarks: '首年优惠' },
    { index: 2, goodsCode: 'P002', goodsName: '报表设计实施服务', spec: '定制化开发', unit: '项', quantity: 1, price: 28000.00, amount: 28000.00, remarks: '含3个月质保' },
    { index: 3, goodsCode: 'P003', goodsName: '标准技术支持', spec: '5*8在线响应', unit: '年', quantity: 1, price: 12000.00, amount: 12000.00, remarks: '即时响应' },
    { index: 4, goodsCode: 'P004', goodsName: '数据可视化模板包', spec: '精选30套', unit: '个', quantity: 3, price: 2600.00, amount: 7800.00, remarks: '赠送移动端适配' },
    { index: 5, goodsCode: 'P005', goodsName: '移动端App授权', spec: '终身授权', unit: '用户', quantity: 8, price: 1980.00, amount: 15840.00, remarks: '支持iOS/Android' },
    { index: 6, goodsCode: 'P006', goodsName: 'BI智能分析模块', spec: '标准版', unit: '套', quantity: 2, price: 9800.00, amount: 19600.00, remarks: '集成数据仓库' },
    { index: 7, goodsCode: 'P007', goodsName: '大屏设计器插件', spec: '开发者版', unit: '个', quantity: 5, price: 3200.00, amount: 16000.00, remarks: '无限制部署' },
    { index: 8, goodsCode: 'P008', goodsName: '数据清洗中间件', spec: '高并发版', unit: '套', quantity: 1, price: 18500.00, amount: 18500.00, remarks: '含首年维护' },
    { index: 9, goodsCode: 'P009', goodsName: '多租户管理组件', spec: 'Saas架构专属', unit: '套', quantity: 2, price: 15000.00, amount: 30000.00, remarks: '支持无限级租户' },
    { index: 10, goodsCode: 'P010', goodsName: '数据源双活热备包', spec: '高可用容灾', unit: '套', quantity: 1, price: 45000.00, amount: 45000.00, remarks: '赠自动备份策略' },
    { index: 11, goodsCode: 'P011', goodsName: 'API网关授权', spec: '集群部署版', unit: '个', quantity: 2, price: 25000.00, amount: 50000.00, remarks: '支持限流限速' },
    { index: 12, goodsCode: 'P012', goodsName: '高性能PDF导出器', spec: '服务器授权', unit: '套', quantity: 1, price: 8800.00, amount: 8800.00, remarks: '百页秒出' },
    { index: 13, goodsCode: 'P013', goodsName: '流式日志收集插件', spec: '高吞吐量', unit: '项', quantity: 4, price: 1500.00, amount: 6000.00, remarks: '免维护' },
    { index: 14, goodsCode: 'P014', goodsName: '三方短信接口网关', spec: '多通道轮询', unit: '个', quantity: 1, price: 5400.00, amount: 5400.00, remarks: '高送达率' },
    { index: 15, goodsCode: 'P015', goodsName: 'SSO单点登录套件', spec: 'OIDC/OAuth2', unit: '套', quantity: 2, price: 8000.00, amount: 16000.00, remarks: '支持多种LDAP' },
    { index: 16, goodsCode: 'P016', goodsName: '智能监控告警大屏', spec: '实时数据流', unit: '个', quantity: 1, price: 22000.00, amount: 22000.00, remarks: '支持32张大屏' },
    { index: 17, goodsCode: 'P017', goodsName: '高可用Redis缓存包', spec: 'Sentinel集群', unit: '套', quantity: 2, price: 9500.00, amount: 19000.00, remarks: '保障缓存不掉线' },
    { index: 18, goodsCode: 'P018', goodsName: '敏捷项目协同授权', spec: '研发管理专版', unit: '用户', quantity: 15, price: 850.00, amount: 12750.00, remarks: '含敏捷看板' },
    { index: 19, goodsCode: 'P019', goodsName: '云原生自动化部署包', spec: 'K8S/Helm标准', unit: '套', quantity: 1, price: 32000.00, amount: 32000.00, remarks: '极速CICD pipeline' },
    { index: 20, goodsCode: 'P020', goodsName: '音视频即时通讯组件', spec: 'WebRTC高性能', unit: '套', quantity: 1, price: 26800.00, amount: 26800.00, remarks: '超低延时' },
    { index: 21, goodsCode: 'P021', goodsName: '企业云盘共享系统', spec: '多端同步版', unit: '套', quantity: 3, price: 4500.00, amount: 13500.00, remarks: '支持内网部署' },
    { index: 22, goodsCode: 'P022', goodsName: '全平台通知推送网关', spec: 'APNS/小米/华为', unit: '个', quantity: 1, price: 7800.00, amount: 7800.00, remarks: '毫秒级触达' },
    { index: 23, goodsCode: 'P023', goodsName: '智能文档在线预览器', spec: 'Office转矢量', unit: '套', quantity: 2, price: 11000.00, amount: 22000.00, remarks: '不损坏排版' },
    { index: 24, goodsCode: 'P024', goodsName: '数据敏感信息遮蔽包', spec: '安全合规专版', unit: '套', quantity: 1, price: 14500.00, amount: 14500.00, remarks: '国密算法支持' },
    { index: 25, goodsCode: 'P025', goodsName: '移动端手势密码组件', spec: '高安全性', unit: '个', quantity: 5, price: 1200.00, amount: 6000.00, remarks: '即插即用' },
    { index: 26, goodsCode: 'P026', goodsName: '图数据库查询加速包', spec: 'Neo4j专属', unit: '套', quantity: 1, price: 19800.00, amount: 19800.00, remarks: '提升十倍速率' },
    { index: 27, goodsCode: 'P027', goodsName: '静态分析代码审计仪', spec: 'SonarQube联动', unit: '套', quantity: 1, price: 13800.00, amount: 13800.00, remarks: '自动报告生成' },
    { index: 28, goodsCode: 'P028', goodsName: '全局多活网关管理器', spec: '多活机房专属', unit: '套', quantity: 2, price: 29000.00, amount: 58000.00, remarks: '支持毫秒级容灾' },
    { index: 29, goodsCode: 'P029', goodsName: '前端真机自动测试箱', spec: '多端真机云', unit: '项', quantity: 1, price: 35000.00, amount: 35000.00, remarks: '含设备租赁' },
    { index: 30, goodsCode: 'P030', goodsName: '轻量化报表离线包', spec: 'H5纯净版', unit: '个', quantity: 10, price: 990.00, amount: 9900.00, remarks: '秒开无压力' },
    { index: 31, goodsCode: 'P031', goodsName: '微服务网格熔断插件', spec: 'Istio高性能', unit: '套', quantity: 2, price: 8800.00, amount: 17600.00, remarks: '自动降级隔离' },
    { index: 32, goodsCode: 'P032', goodsName: '全链路压测监控套件', spec: '超大流量测试', unit: '套', quantity: 1, price: 48000.00, amount: 48000.00, remarks: '模拟百万级并发' },
    { index: 33, goodsCode: 'P033', goodsName: '邮件网关防封禁套件', spec: '高信誉发信IP', unit: '个', quantity: 2, price: 6500.00, amount: 13000.00, remarks: '免拉黑策略' },
    { index: 34, goodsCode: 'P034', goodsName: '智能工单派发系统', spec: 'AI智能算法版', unit: '套', quantity: 1, price: 26000.00, amount: 26000.00, remarks: '极速调度分发' },
    { index: 35, goodsCode: 'P035', goodsName: '报表定制高级版授权', spec: '终身服务包含', unit: '套', quantity: 1, price: 88800.00, amount: 88800.00, remarks: 'SVIP服务直达' }
  ]
};

// ==========================================
// 专为“图 2 复杂合并表格”设计的 Mock 数据与元数据
// ==========================================
export const mergeSchema = {
  master: [
    { key: 'projectName', label: '项目名称', type: 'string', example: '智能售后运维管理系统' },
    { key: 'department', label: '编制部门', type: 'string', example: '售后研发部' },
    { key: 'compiler', label: '编制人', type: 'string', example: '系统管理员' },
    { key: 'compileDate', label: '编制日期', type: 'string', example: '2026-05-25' }
  ],
  detail: [
    { key: 'index', label: '序号', type: 'number' },
    { key: 'module', label: '模块名称', type: 'string' },
    { key: 'functionName', label: '功能项', type: 'string' },
    { key: 'desc', label: '功能需求描述', type: 'string' }
  ]
};

export const mergeMockData = {
  master: {
    projectName: '智能售后运维管理系统',
    department: '售后研发部',
    compiler: '系统管理员',
    compileDate: '2026-05-25'
  },
  detail: [
    { index: 1, module: '服务整机/配件管理', functionName: '修复回用三包机库存管理', desc: '增加修复回用机库位，以及配件修复回用库存转移流程。' },
    { index: 2, module: '服务整机/配件管理', functionName: '旧回用配件库存管理', desc: '增加旧件回用配件库位，以及配件旧件回用库存转移流程。' },
    { index: 3, module: '服务整机/配件管理', functionName: '超期配件/整机处理提醒', desc: '1、设置库龄超期规则；2、设置库龄超期提醒规划；3、发送消息提醒。' },
    { index: 4, module: '故障分析预警', functionName: '异常故障智能分析及跟进', desc: '1、设置异常故障分析逻辑（如后台自动检测单台发动机短时间内多次出现故障）；2、按设置分析逻辑分析是否存在异常故障；3、存在异常故障，生成任务单指派驻外服务人员核实反馈；4、任务单企微、公司云待办推进提醒、进度及结果跟进。' },
    { index: 5, module: '服务保障', functionName: '配件储备清单自动生成', desc: '1、从装机档案抽取单台发动机装机零件明细（不取虚拟件）；2、按设置的对照表匹配零件类别；3、按发动机进入量、各零件类别需要储存的比例以及其他规则（如已有超期储备备件需要调拨、国区储备同一零件超一定数量做提示等），按设置的计算逻辑生成基础配件储备建议清单。' },
    { index: 6, module: '配件管理', functionName: '配件查询', desc: '可查配件的组装件、技术状态、替换件、配件价格、专卖子公司库存、配件图片等配件信息。可查询二次配套件数据，可批量查询。' },
    { index: 7, module: '配件管理', functionName: '采购管理', desc: '1、连接专卖SAP系统，下达订单到专卖总部/子公司；2、供应商管理；3、采购审批、采购入库、采购退货。' },
    { index: 8, module: '配件管理', functionName: '销售管理', desc: '1、客户档案管理；（服务站的客户\\股司的客户） 2、销售出库；3、销售退货（服务站\\股司）' },
    { index: 9, module: '配件管理', functionName: '库存管理', desc: '1、设置不同库位；2、物料移库；3、库存浏览。' },
    { index: 10, module: '授信管理', functionName: '授信管理', desc: '设置客户所享受的信用额度、账期，需连通财务系统同步出入账，如超出额度、账期则不能下订，需要回款入账后订单才能继续。' }
  ]
};

// ==========================================
// 专为“图 3 述职报告表”设计的 Mock 数据与元数据
// ==========================================
export const reportSchema = {
  master: [
    { key: 'year', label: '报告年度', type: 'string', example: '2025' },
    { key: 'department', label: '部门', type: 'string', example: '信息部' },
    { key: 'jobTitle', label: '职务', type: 'string', example: '前端开发工程师' },
    { key: 'userName', label: '姓名', type: 'string', example: '孙岩' }
  ],
  detail: [
    { key: 'index', label: '序号', type: 'number' },
    { key: 'category', label: '分类/大类', type: 'string' },
    { key: 'content', label: '完成事项内容', type: 'string' },
    { key: 'achievements', label: '亮点/成果', type: 'string' },
    { key: 'finishTime', label: '完成时间', type: 'string' }
  ]
};

export const reportMockData = {
  master: {
    year: '2025',
    department: '信息部',
    jobTitle: '前端开发工程师',
    userName: '孙岩'
  },
  detail: [
    { 
      index: 1, 
      category: '年度工作总结', 
      content: '完成了基于 Vue3 的智能低代码表单引擎 sunform-v3 的开发与发布。集成了可视化拖拽设计、AI 辅助生成及全流程页面渲染能力。', 
      achievements: '1. 创新集成 AI 大模型，支持对话式自动构建页面配置，将基础组件开发效率提升 60% 以上。\n2. 深度融合高级表格、可视化图表及 LogicFlow 流程引擎，实现复杂业务场景的零代码高效交付。\n3. 建立设计与渲染分离的高性能架构，配合完善的 API 钩子系统，确保业务扩展的灵活性与稳定性。', 
      finishTime: '2025年12月31日前' 
    },
    { 
      index: 2, 
      category: '年度工作总结', 
      content: '搭建并上线了集 MES 生产排程、SCADA 实时监控、实验室数字化管理及自研低代码平台于一体的加气精英前端系统，实现了从采购、生产到销售的全链路数字化闭环。', 
      achievements: '1. 自研落地低代码配置引擎，实现基础业务页面的可视化拖拽设计与快速生成，显著提升迭代效率。\n2. 构建全景数据驾驶舱与 SCADA 监控大屏，通过可视化图表实时呈报生产状态，实现数据一屏统览。\n3. 攻克 MES 复杂排产算法与动态甘特图交互逻辑，解决了多工序、多状态下的生产调度难题。\n4. 创新集成 AI 智能助手组件，优化人机交互体验，初步实现了业务系统的智能化辅助功能。\n5. 沉淀了一套包含动画、布局及通用业务逻辑的高复用组件库，统一了系统 UI 规范与代码风格。', 
      finishTime: '2025年12月31日前' 
    },
    { 
      index: 3, 
      category: '年度工作总结', 
      content: '构建了元兴复材一体化综合管理平台，全面涵盖项目全流程管控、企业知识库建设、采购与仓储供应链管理、人事行政与日志追踪，并成功集成生产设备实时监控及底层系统权限配置。', 
      achievements: '1. 业务闭环：打通了从采购入库到项目执行及人员调度的全链路数据互通，有效消除了企业内部信息孤岛。\n2. 数智监控：上线设备实时监控系统，通过可视化面板直观呈现运行状态与关键指标，显著提升生产透明度。\n3. 知识赋能：建立标准化知识库体系，有效沉淀项目资产与技术经验，通过共享机制赋能团队持续成长。', 
      finishTime: '2025年12月31日前' 
    },
    { 
      index: 4, 
      category: '年度工作总结', 
      content: '完成通用工作流引擎的研发，自主构建可视化表单设计器、图形化流程建模工具及动态数据源管理模块，实现业务流程从设计、建模到运行监测的全生命周期闭环管理。', 
      achievements: '通过“零代码”可视化配置方案与高性能公式引擎，支持多维度审批逻辑（并行、会签等）与复杂分支运转，大幅降低业务系统集成成本，显著提升政企办公场景下的流程适配效率。', 
      finishTime: '2025年12月31日前' 
    },
    { 
      index: 5, 
      category: '年度工作总结', 
      content: '主导移动端低代码引擎研发，独立完成 40 余类核心组件封装及可视化配置体系搭建，实现了样式编辑器、API 联动及动态表单渲染等核心功能，支持业务页面的快速构建与发布。', 
      achievements: '通过高度解耦的组件化架构，实现业务需求“零代码”产出，研发效率提升 50% 以上；同时攻克了多端渲染一致性与复杂交互性能优化难题，确保了高性能的移动端用户体验。', 
      finishTime: '2025年12月31日前' 
    },
    { 
      index: 6, 
      category: '年度工作总结', 
      content: '主导惠宇 OA 管理系统的研发，实现从行政办公到产线监控的数字化闭环。重点完成了低代码业务配置平台建设，涵盖需求管理、版本控制等 20+ 业务模块。', 
      achievements: '打造了集团进度条、动态看板及工作日历于一体的任务中心，实现了待办事项的精细化追踪，确保项目按计划节点高效推进。', 
      finishTime: '2025年12月31日前' 
    },
    { 
      index: 7, 
      category: '年度工作总结', 
      content: '主导完成元兴复材企业门户网站及配套后台管理系统的研发工作，完成核心排布。', 
      achievements: '1. SEO 与性能极致优化：采用 Express+EJS 服务端渲染架构，确保企业信息在搜索引擎的高效收录，并将首屏加载时间缩短至毫秒级。\n2. 中后台一体化管理：构建配套数据维护平台，实现产品参数、企业动态及多语言内容的自助化更新，彻底摆脱代码级维护，提升运营效率。', 
      finishTime: '2025年12月31日前' 
    }
  ]
};


