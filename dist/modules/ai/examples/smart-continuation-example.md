# 智能续写功能使用示例

## 功能概述

前台只需要调用一个 `streamChat` 接口，后台会自动判断是否需要续写，并无缝拼接响应。

## 工作流程

```
用户请求 → 第一次AI响应 → 实时判定 → 自动续写 → 拼接输出
     ↓              ↓           ↓         ↓         ↓
  前台调用     内容累积    智能分析   发起续写   连续流输出
```

## 使用示例

### 1. 前台调用（和之前完全一样）

```javascript
// 前台JavaScript代码
const response = await fetch('/ai/stream', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    messages: [
      {
        role: 'user',
        content: '写一个关于春天的故事'
      }
    ],
    model: 'deepseek-ai/DeepSeek-V3',
    max_tokens: 1000
  })
});

// 处理流式响应
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  console.log('接收到内容:', chunk);
  // 这里可能包含自动续写的内容，但对前台完全透明
}
```

### 2. 续写判定示例

#### 需要续写的情况

**输入：**
```
"今天天气很好，我决定出去散步，刚走到公园门口就看到"
```

**判定结果：**
```json
{
  "shouldContinue": true,
  "confidence": 0.85,
  "reason": "文本内容不完整，需要续写"
}
```

**系统行为：** 自动发起续写请求，补充完整内容

#### 不需要续写的情况

**输入：**
```
"经过一天的努力，我们终于完成了项目。大家都很开心，决定一起庆祝这个成功。"
```

**判定结果：**
```json
{
  "shouldContinue": false,
  "confidence": 0.78,
  "reason": "内容相对完整"
}
```

**系统行为：** 直接结束响应流

### 3. 判定因素权重

- **用户意图分析** (40%) - 识别"继续"、"够了"等关键词
- **文本完整性** (25%) - 检查句子、段落是否完整
- **语义完整性** (20%) - 分析语义是否需要补充
- **内容长度** (10%) - 短内容更可能需要续写
- **停止信号** (5%) - 检测"完成"、"结束"等信号

### 4. 续写关键词识别

#### 续写关键词
- 中文：继续、续写、接着、然后、接下来、更多、展开、详细
- 英文：continue、more、keep going、go on、expand

#### 停止关键词
- 中文：够了、完成、结束、停止、不用了、可以了
- 英文：enough、stop、finish、done、complete

### 5. 日志监控

系统会自动记录续写判定过程：

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "shouldContinue": true,
  "confidence": 0.85,
  "reason": "文本内容不完整，需要续写",
  "contentLength": 45,
  "factors": {
    "explicitIntent": 0.5,
    "textCompleteness": 0.2,
    "contentLength": 0.3,
    "semanticCompleteness": 0.2,
    "stopSignals": 0.1
  }
}
```

## 配置参数

### 判定阈值配置

```typescript
// 在 ContinuationDetectorService 中可以调整这些参数
const CONTINUE_THRESHOLD = 0.4; // 低于此值需要续写
const CONFIDENCE_THRESHOLD = 0.6; // 置信度阈值

// 权重配置
const weights = {
  explicitIntent: 0.4,      // 用户意图
  textCompleteness: 0.25,   // 文本完整性
  contentLength: 0.1,       // 内容长度
  semanticCompleteness: 0.2, // 语义完整性
  stopSignals: 0.05         // 停止信号
};
```

### 续写请求配置

```typescript
// 续写部分的 token 限制
const continuationRequestData = {
  ...originalRequestData,
  messages: continuationMessages,
  max_tokens: Math.min(originalRequestData.max_tokens || 5000, 3000)
};
```

## 优势特点

1. **对前台透明** - 前台无需修改任何代码
2. **智能判定** - 多维度分析，准确判断是否需要续写
3. **流式拼接** - 无缝连接，用户感受不到中断
4. **可配置阈值** - 可根据需要调整判定敏感度
5. **完整日志** - 详细记录判定过程和续写情况

## 注意事项

1. 续写功能会增加 API 调用次数，请注意 token 消耗
2. 判定阈值可以根据实际使用情况进行调整
3. 系统会自动限制续写部分的 token 数量，避免过长响应
4. 建议在生产环境中监控续写触发频率，优化判定逻辑
