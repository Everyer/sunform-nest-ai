# 微信模板消息批量发送指南

## 背景说明

**微信官方API限制：**
- 微信官方并没有提供批量发送模板消息的API
- 每次调用模板消息接口只能发送给一个用户（一个openId）
- 如果需要给多人发送，必须循环调用单发接口

## 解决方案

我们提供了两种批量发送方案：

### 1. 前端循环调用（不推荐）
```javascript
// 不推荐的做法
const openIds = ['openId1', 'openId2', 'openId3'];
for (const openId of openIds) {
    await fetch('/adminApi/wechat/sendTemplateMessage', {
        method: 'POST',
        body: JSON.stringify({
            touser: openId,
            template_id: 'your_template_id',
            data: { /* 模板数据 */ }
        })
    });
}
```

**问题：**
- 网络请求次数多，性能差
- 错误处理复杂
- 无法统一控制发送频率

### 2. 后端批量发送接口（推荐）
```javascript
// 推荐的做法
await fetch('/adminApi/wechat/batchSendTemplateMessage', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer your_token',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        tousers: ['openId1', 'openId2', 'openId3'],
        template_id: 'your_template_id',
        concurrent: false,  // 串行发送，推荐
        delay: 100,        // 间隔100ms
        data: {
            first: { value: '尊敬的用户', color: '#173177' },
            keyword1: { value: '系统通知', color: '#173177' },
            keyword2: { value: '重要消息', color: '#173177' },
            remark: { value: '请及时查看', color: '#173177' }
        }
    })
});
```

## API 详细说明

### 接口地址
```
POST /adminApi/wechat/batchSendTemplateMessage
```

### 请求参数
```typescript
{
    tousers: string[];           // 接收者OpenID列表
    template_id: string;         // 模板ID
    url?: string;               // 点击跳转URL（可选）
    miniprogram?: {             // 跳转小程序（可选）
        appid: string;
        pagepath?: string;
    };
    data: Record<string, {      // 模板数据
        value: string;
        color?: string;
    }>;
    concurrent?: boolean;       // 是否并发发送，默认false
    delay?: number;            // 延迟间隔(毫秒)，默认100
}
```

### 响应数据
```typescript
{
    success: boolean;
    message: string;
    summary: {
        total: number;          // 总发送数量
        success: number;        // 成功数量
        failed: number;         // 失败数量
        successRate: string;    // 成功率
    };
    details: Array<{           // 详细发送结果
        touser: string;
        success: boolean;
        msgid?: string;
        error?: string;
    }>;
    failedUsers?: Array<{      // 失败用户列表
        touser: string;
        error: string;
    }>;
}
```

## 发送模式选择

### 串行发送（推荐）
```json
{
    "concurrent": false,
    "delay": 100
}
```

**优点：**
- 稳定可靠，不易触发微信频率限制
- 可控制发送速度
- 错误处理更精确

**缺点：**
- 发送速度相对较慢

### 并发发送（谨慎使用）
```json
{
    "concurrent": true
}
```

**优点：**
- 发送速度快

**缺点：**
- 容易触发微信API频率限制
- 可能导致部分消息发送失败

## 微信官方限制

1. **频率限制：**
   - 每分钟最多发送一定数量的模板消息
   - 具体限制由微信动态调整

2. **用户限制：**
   - 用户必须关注公众号
   - 用户24小时内必须有交互行为

3. **模板限制：**
   - 必须使用已审核通过的模板
   - 模板内容不能随意修改

## 最佳实践

### 1. 分批发送
```javascript
// 大量用户分批发送
const chunkSize = 50; // 每批50个用户
for (let i = 0; i < openIds.length; i += chunkSize) {
    const batch = openIds.slice(i, i + chunkSize);
    
    await fetch('/adminApi/wechat/batchSendTemplateMessage', {
        method: 'POST',
        body: JSON.stringify({
            tousers: batch,
            template_id: 'your_template_id',
            concurrent: false,
            delay: 200, // 增加延迟
            data: templateData
        })
    });
    
    // 批次间延迟
    await new Promise(resolve => setTimeout(resolve, 5000));
}
```

### 2. 错误重试
```javascript
async function sendWithRetry(failedUsers, maxRetries = 3) {
    for (let retry = 0; retry < maxRetries; retry++) {
        const result = await fetch('/adminApi/wechat/batchSendTemplateMessage', {
            method: 'POST',
            body: JSON.stringify({
                tousers: failedUsers.map(u => u.touser),
                template_id: 'your_template_id',
                concurrent: false,
                delay: 500, // 重试时增加延迟
                data: templateData
            })
        });
        
        if (result.summary.failed === 0) break;
        
        failedUsers = result.failedUsers;
        await new Promise(resolve => setTimeout(resolve, 10000)); // 重试间隔
    }
}
```

### 3. 监控和日志
```javascript
const result = await sendBatchMessage(data);

// 记录发送结果
console.log(`批量发送完成: 总计${result.summary.total}条, 成功${result.summary.success}条, 失败${result.summary.failed}条`);

// 处理失败用户
if (result.failedUsers && result.failedUsers.length > 0) {
    console.error('发送失败的用户:', result.failedUsers);
    // 可以选择重试或记录到数据库
}
```

## 注意事项

1. **认真设置延迟**：避免触发微信频率限制
2. **监控发送结果**：及时处理失败的消息
3. **用户体验**：避免给用户发送过多消息
4. **合规使用**：遵守微信平台规则，避免被封号

## 总结

虽然微信官方没有提供批量发送API，但通过我们的批量发送接口，你可以：
- 一次性向多个用户发送模板消息
- 控制发送速度和并发策略
- 获得详细的发送报告
- 处理发送失败的情况

推荐使用串行发送模式，设置适当的延迟，确保发送的稳定性和成功率。 