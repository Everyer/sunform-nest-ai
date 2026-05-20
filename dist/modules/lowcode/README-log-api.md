# 低代码日志API使用说明

## 📋 API列表

### 1. 创建日志
```http
POST /adminApi/lowcodeLog/create
```
**请求体:**
```json
{
  "componentCode": "form_component_001",
  "componentName": "用户表单组件",
  "componentConfig": {
    "fields": [
      {"name": "username", "type": "input", "required": true},
      {"name": "email", "type": "email", "required": true}
    ],
    "layout": "vertical"
  }
}
```

### 2. 分页查询所有日志
```http
POST /adminApi/lowcodeLog/page
Authorization: Bearer <your-token>
```
**请求体:**
```json
{
  "pageindex": 1,
  "pagesize": 10,
  "componentCode": "form",      // 可选：模糊搜索组件代码
  "componentName": "用户"       // 可选：模糊搜索组件名称
}
```

### 3. 🆕 根据code获取所有日志
```http
POST /adminApi/lowcodeLog/listByCode
Authorization: Bearer <your-token>
```
**请求体:**
```json
{
  "componentCode": "form_component_001"
}
```

### 4. 🆕 根据code分页查询日志
```http
POST /adminApi/lowcodeLog/pageByCode
Authorization: Bearer <your-token>
```
**请求体:**
```json
{
  "componentCode": "form_component_001",
  "pageindex": 1,
  "pagesize": 10
}
```

### 5. 获取所有日志列表
```http
POST /adminApi/lowcodeLog/list
Authorization: Bearer <your-token>
```

### 6. 获取日志详情
```http
POST /adminApi/lowcodeLog/detail
Authorization: Bearer <your-token>
```
**请求体:**
```json
{
  "id": "log-uuid-here"
}
```

### 7. 删除日志
```http
POST /adminApi/lowcodeLog/delete
Authorization: Bearer <your-token>
```
**请求体:**
```json
{
  "id": "log-uuid-here"
}
```

## 🎯 使用场景

### 按组件查看历史版本
当你有一个低代码组件 `form_component_001`，想查看它的所有保存记录：

```bash
# 获取该组件的所有历史记录
curl -X POST http://localhost:9527/adminApi/lowcodeLog/listByCode \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"componentCode": "form_component_001"}'
```

### 分页查看特定组件日志
如果日志很多，使用分页查询：

```bash
# 分页查看该组件的历史记录
curl -X POST http://localhost:9527/adminApi/lowcodeLog/pageByCode \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "componentCode": "form_component_001",
    "pageindex": 1,
    "pagesize": 5
  }'
```

## 📊 响应格式

### 成功响应
```json
{
  "success": true,
  "code": 200,
  "message": "操作成功",
  "data": {
    "rows": [
      {
        "id": "uuid-1",
        "componentCode": "form_component_001",
        "componentName": "用户表单组件",
        "componentConfig": {...},
        "createdAt": "2025-01-24 12:00:00",
        "updatedAt": "2025-01-24 12:00:00"
      }
    ],
    "count": 10
  }
}
```

### 错误响应
```json
{
  "success": false,
  "code": 400,
  "message": "componentCode不能为空"
}
```

## 💡 最佳实践

1. **版本管理**: 使用有意义的 `componentCode`，如 `module_component_v1.0`
2. **批量查询**: 大量数据时优先使用分页接口
3. **精确查询**: 已知确切code时使用 `listByCode` 或 `pageByCode`
4. **模糊搜索**: 不确定code时使用 `page` 接口的模糊搜索功能 