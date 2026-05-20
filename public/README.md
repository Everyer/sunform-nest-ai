# Nest.js 静态资源配置说明

## 概述

这个项目已经配置了静态资源服务，允许你在 `public` 目录中放置 HTML、CSS、JavaScript 文件，并让这些文件可以直接访问后端 API。

## 配置详情

### 1. 静态资源配置
在 `src/app.module.ts` 中已经配置了 `ServeStaticModule`：

```typescript
ServeStaticModule.forRoot({
  rootPath: join(__dirname, '..', 'public'),
  serveRoot: '/static',
})
```

- **rootPath**: 指向 `public` 目录
- **serveRoot**: 静态资源的访问前缀为 `/static`

### 2. 访问路径

- **API 接口**: `http://localhost:9527/adminApi/*`
- **静态资源**: `http://localhost:9527/static/*`
- **H5 页面**: `http://localhost:9527/static/h5/`

## 目录结构

```
public/
├── h5/
│   ├── index.html      # 完整功能演示页面
│   ├── demo.html       # 简单演示页面
│   └── config.js       # API 配置文件
└── README.md           # 本说明文档
```

## 使用示例

### 1. 基本 API 调用

```javascript
// 简单的 API 请求
const response = await fetch('/adminApi/util/test');
const data = await response.json();
```

### 2. 使用配置文件 (推荐)

```javascript
// 引入配置文件
<script src="./config.js"></script>

// 使用配置的端点
const result = await window.apiRequest('/util/test');
```

### 3. 完整示例

```html
<!DOCTYPE html>
<html>
<head>
    <title>我的 H5 应用</title>
</head>
<body>
    <script>
        // 调用后端 API
        async function loadData() {
            try {
                const response = await fetch('/adminApi/user');
                const users = await response.json();
                console.log('用户列表:', users);
            } catch (error) {
                console.error('API 调用失败:', error);
            }
        }
        
        loadData();
    </script>
</body>
</html>
```

## 可用的 API 端点

### 系统模块
- `GET /adminApi/user` - 获取用户列表
- `GET /adminApi/menu` - 获取菜单列表
- `GET /adminApi/role` - 获取角色列表
- `GET /adminApi/department` - 获取部门列表

### 业务模块
- `GET /adminApi/lowcodeApi/project` - 获取低代码项目
- `GET /adminApi/lowcodeApi/page` - 获取页面列表
- `GET /adminApi/wechat` - 获取微信配置

### 工具接口
- `GET /adminApi/util/test` - 测试接口

## 开发建议

1. **相对路径**: 使用相对路径 `/adminApi/` 而不是绝对路径，这样可以自动适应不同的部署环境。

2. **错误处理**: 始终添加适当的错误处理：
   ```javascript
   try {
       const response = await fetch('/adminApi/user');
       if (!response.ok) {
           throw new Error(`HTTP ${response.status}: ${response.statusText}`);
       }
       const data = await response.json();
   } catch (error) {
       console.error('请求失败:', error);
   }
   ```

3. **配置文件**: 使用 `config.js` 配置文件来管理 API 端点和应用设置。

4. **CORS**: 由于静态资源和 API 在同一域名下，不会有跨域问题。

## 部署注意事项

1. **生产环境**: 确保在生产环境中正确设置 `serveRoot` 路径。

2. **性能优化**: 对于生产环境，考虑使用 nginx 等 Web 服务器来提供静态资源。

3. **安全性**: 不要在静态资源中存储敏感信息，如 API 密钥等。

## 示例页面

- **完整演示**: [http://localhost:9527/static/h5/index.html](http://localhost:9527/static/h5/index.html)
- **简单演示**: [http://localhost:9527/static/h5/demo.html](http://localhost:9527/static/h5/demo.html)

这些示例页面展示了如何在静态资源中调用内部 API，包括 GET 和 POST 请求的处理。 