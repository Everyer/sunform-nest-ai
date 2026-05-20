# 微信公众号模块

这是一个完整的微信公众号API集成模块，提供了微信公众号开发所需的核心功能。

## 🚀 功能特性

- ✅ 通过 code 换取 openid 和 access_token
- ✅ 获取用户基本信息
- ✅ 发送模板消息
- ✅ 发送客服消息
- ✅ 生成带参数二维码
- ✅ 微信网页授权
- ✅ JSSDK 配置
- ✅ 微信服务器签名验证
- ✅ 消息推送处理

## 📝 环境配置

在您的环境变量中添加以下配置：

```env
# 微信公众号配置
WECHAT_APP_ID=your_wechat_app_id
WECHAT_APP_SECRET=your_wechat_app_secret
WECHAT_TOKEN=your_wechat_token
```

## 🔧 API 接口

### 1. 通过 code 换取 openid
```typescript
POST /wechat/getOpenIdByCode
{
  "code": "微信授权code"
}
```

### 2. 获取基础 access_token
```typescript
POST /wechat/getAccessToken
{
  "appId": "可选，默认使用环境变量",
  "appSecret": "可选，默认使用环境变量"
}
```

### 3. 获取用户信息
```typescript
POST /wechat/getUserInfo
{
  "accessToken": "网页授权access_token",
  "openId": "用户openid"
}
```

### 4. 发送模板消息
```typescript
POST /wechat/sendTemplateMessage
{
  "touser": "接收者openid",
  "template_id": "模板ID",
  "url": "点击跳转URL",
  "data": {
    "first": { "value": "消息内容", "color": "#173177" },
    "keyword1": { "value": "关键词1", "color": "#173177" }
  }
}
```

### 5. 发送客服消息
```typescript
POST /wechat/sendCustomMessage
{
  "touser": "接收者openid",
  "msgtype": "text",
  "message": { "content": "消息内容" }
}
```

### 6. 生成二维码
```typescript
POST /wechat/generateQRCode
{
  "action_name": "QR_LIMIT_SCENE",
  "action_info": { "scene": { "scene_str": "test" } },
  "expire_seconds": 604800
}
```

### 7. 生成授权链接
```typescript
POST /wechat/generateOAuthUrl
{
  "redirectUri": "授权后回调地址",
  "scope": "snsapi_userinfo",
  "state": "自定义参数"
}
```

### 8. 获取 JSSDK 配置
```typescript
POST /wechat/getJSSDKConfig
{
  "url": "当前页面URL"
}
```

## 💡 使用示例

### 微信网页授权流程

1. **生成授权链接**
```typescript
const authUrl = await this.wechatService.generateOAuthUrl({
  redirectUri: 'https://yourdomain.com/callback',
  scope: 'snsapi_userinfo',
  state: 'custom_state'
});
```

2. **处理授权回调**
```typescript
const result = await this.wechatService.getOpenIdByCode({
  code: 'authorization_code_from_wechat'
});
```

3. **获取用户信息**
```typescript
const userInfo = await this.wechatService.getUserInfo(
  result.access_token,
  result.openid
);
```

### 发送模板消息
```typescript
await this.wechatService.sendTemplateMessage({
  touser: 'user_openid',
  template_id: 'template_id',
  url: 'https://yourdomain.com/detail',
  data: {
    first: { value: '订单提醒', color: '#173177' },
    keyword1: { value: '商品名称', color: '#173177' },
    keyword2: { value: '￥99.00', color: '#173177' },
    remark: { value: '感谢您的购买！', color: '#173177' }
  }
});
```

## 🔐 微信服务器配置

在微信公众平台配置以下信息：

1. **服务器地址（URL）**: `https://yourdomain.com/adminApi/wechat/verify`
2. **令牌（Token）**: 填入环境变量 `WECHAT_TOKEN` 的值
3. **消息推送地址**: `https://yourdomain.com/adminApi/wechat/message`

## 📋 注意事项

1. 确保服务器能够访问微信API
2. 正确配置微信公众号的安全域名
3. 模板消息需要先在微信公众平台申请模板
4. JSSDK需要配置JS接口安全域名
5. 网页授权需要配置授权回调页面域名

## 🛠️ 扩展功能

该模块可以轻松扩展以下功能：

- 微信支付集成
- 素材管理
- 菜单管理
- 用户分组管理
- 消息群发
- 数据统计

## 🐛 错误处理

所有API都有完善的错误处理机制，会返回具体的错误信息：

```typescript
{
  "success": false,
  "code": 400,
  "message": "具体错误信息",
  "data": null
}
```

## 📞 技术支持

如有问题，请查看：
1. 微信公众平台开发文档
2. 项目 issue 列表
3. 日志文件中的详细错误信息 