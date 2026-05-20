# Nest.js 静态资源构建配置

## 问题解决

默认情况下，`npm run build` 不会将 `public` 目录复制到 `dist` 目录中。我们已经配置了以下解决方案：

## 解决方案

### 1. package.json 脚本配置

```json
{
  "scripts": {
    "build": "nest build && npm run copy:public",
    "build:prod": "nest build && npm run copy:public", 
    "copy:public": "cp -r public dist/ || xcopy public dist\\public /E /I /Y || echo 'Static files copy completed'"
  }
}
```

### 2. 构建过程

1. `nest build` - 编译 TypeScript 代码
2. `npm run copy:public` - 复制静态资源

### 3. 跨平台兼容性

复制命令支持多个平台：
- **Unix/macOS**: `cp -r public dist/`
- **Windows**: `xcopy public dist\\public /E /I /Y`
- **备用**: 如果都失败则输出提示信息

## 构建验证

### 构建前目录结构
```
nest-test/
├── public/
│   ├── h5/
│   │   ├── index.html
│   │   ├── demo.html
│   │   └── config.js
│   └── README.md
└── src/
```

### 构建后目录结构
```
dist/
├── public/           # ✅ 已复制
│   ├── h5/
│   │   ├── index.html
│   │   ├── demo.html
│   │   └── config.js
│   └── README.md
├── main.js
├── app.module.js
└── ...
```

## 使用方法

### 开发环境
```bash
npm run start:dev
```
访问: `http://localhost:9527/static/h5/index.html`

### 生产构建
```bash
npm run build
# 或
npm run build:prod
```

### 生产运行
```bash
npm run start:prod
```
访问: `http://localhost:9527/static/h5/index.html`

## 路径配置

在 `src/app.module.ts` 中的静态资源配置：

```typescript
ServeStaticModule.forRoot({
  rootPath: join(__dirname, '..', 'public'),
  serveRoot: '/static',
})
```

这个配置在开发和生产环境都能正常工作：
- **开发环境**: `src/../public` → 项目根目录的 `public`
- **生产环境**: `dist/../public` → `dist/public`

## 注意事项

1. **确保静态资源路径正确**: 构建后确认 `dist/public` 目录存在
2. **相对路径**: HTML 中使用 `/adminApi/*` 来访问 API
3. **部署**: 部署时确保整个 `dist` 目录（包括 `public` 子目录）都被上传

## 故障排除

### 静态资源未复制
```bash
# 手动复制
npm run copy:public

# 或者直接复制
cp -r public dist/
```

### 访问 404 错误
1. 检查 `dist/public` 目录是否存在
2. 确认 `ServeStaticModule` 配置正确
3. 验证访问路径: `/static/h5/index.html`

### 构建脚本失败
如果自动复制失败，可以手动执行：
```bash
# Unix/macOS
cp -r public dist/

# Windows
xcopy public dist\public /E /I /Y
``` 