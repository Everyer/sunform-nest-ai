# AI模块

这是一个基于NestJS的AI聊天模块，集成了硅基流动AI API，支持多种聊天规则和智能消息管理。

## 功能特性

- 🤖 **多模型支持**: 支持硅基流动平台的多种AI模型
- 🔄 **流式和非流式响应**: 同时支持实时流式响应和完整响应
- 🎯 **智能规则系统**: 内置多种对话规则（Vue代码生成、编程助手、客服等）
- 📊 **智能消息管理**: 自动压缩长消息，管理Token使用量
- 🔍 **Token估算**: 准确估算消息的Token消耗
- 📝 **详细日志**: 完整的请求和处理日志

## 目录结构

```
src/modules/ai/
├── ai.controller.ts          # AI控制器 - 处理HTTP请求
├── ai.service.ts             # AI核心服务 - 业务逻辑
├── ai.module.ts              # AI模块配置
├── index.ts                  # 模块导出文件
├── config/
│   └── message.config.ts     # 消息管理配置
├── dto/
│   └── chat.dto.ts           # 请求响应DTO定义
└── utils/
    ├── logger.service.ts         # 日志服务
    ├── system-rules.service.ts   # 系统规则服务
    └── message-manager.service.ts # 消息管理服务
```

## API接口

### 1. 流式聊天接口
```
POST /ai/stream
```
支持实时流式响应，适用于需要即时反馈的场景。

**请求示例：**
```json
{
  "messages": [
    {
      "role": "user", 
      "content": "请帮我生成一个Vue3的登录组件"
    }
  ],
  "model": "deepseek-ai/DeepSeek-V3",
  "ruleType": "default",
  "max_tokens": 10000
}
```

### 2. 非流式聊天接口
```
POST /ai/completions
```
返回完整响应，适用于一次性获取完整回复的场景。

### 3. 获取模型列表
```
GET /ai/models?type=chat&sub_type=completion
```
获取硅基流动平台支持的AI模型列表。

### 4. 获取规则类型
```
GET /ai/rules
```
获取所有可用的对话规则类型及其描述。

### 5. Token估算
```
POST /ai/estimate-tokens
```
估算给定消息列表将消耗的Token数量。

## 规则类型

- **default**: Vue3代码生成助手，专注于element-plus组件开发
- **programming**: 通用编程助手，提供最佳实践和代码解决方案
- **customer_service**: 友好的客服助手，专注于问题解决
- **custom**: 自定义规则，可根据需要配置特定的行为规范

## 环境变量配置

在 `.env` 文件中添加以下配置：

```env
# 硅基流动API配置
SILICONFLOW_API_KEY=your-api-key-here
SILICONFLOW_BASE_URL=https://api.siliconflow.cn/v1

# 日志配置
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true
```

## 使用示例

### 在其他模块中使用AI服务

```typescript
import { Injectable } from '@nestjs/common';
import { AiService } from '../ai/ai.service';

@Injectable()
export class YourService {
  constructor(private readonly aiService: AiService) {}

  async generateCode(prompt: string) {
    const result = await this.aiService.completionChat({
      messages: [
        { role: 'user', content: prompt }
      ],
      ruleType: 'default'
    });
    
    return result;
  }
}
```

### 前端调用示例

```javascript
// 流式聊天
const response = await fetch('/ai/stream', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: '请生成一个Vue3表格组件' }
    ],
    ruleType: 'default'
  })
});

// 处理流式响应
const reader = response.body.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = new TextDecoder().decode(value);
  console.log(chunk);
}
```

## 消息管理特性

### 智能压缩
- 自动压缩超长代码块
- 保留重要的开头和结尾部分
- 智能摘要历史对话

### Token管理
- 准确估算中英文Token消耗
- 自动控制上下文长度
- 为AI回复预留充足空间

### 滑动窗口
- 保留最新的重要对话
- 自动生成历史对话摘要
- 智能选择保留的消息

## 日志功能

模块提供详细的日志记录：
- HTTP请求日志
- AI聊天请求详情
- Token使用统计
- 压缩和管理决策
- 错误和异常处理

## 扩展性

模块设计具有良好的扩展性：
- 可轻松添加新的规则类型
- 支持自定义消息管理策略
- 可扩展Token估算算法
- 支持集成其他AI提供商
