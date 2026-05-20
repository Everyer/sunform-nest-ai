# 系统规则冲突解决方案

## 🔍 问题诊断

你的观察非常准确！续写问题确实与系统提示词冲突有关。

### 发现的冲突点

在 `system-rules.service.ts` 的默认规则中发现：

```typescript
// 第45行
`代码用\`\`\`html\`\`\`包裹，无API要求不生成API代码`
```

**这就是问题根源！**

- 原始规则要求：代码必须用 `\`\`\`html\`\`\`` 包裹
- 续写场景需要：直接输出代码内容，不要任何包裹标记
- 结果冲突：续写时会自动添加 `\`\`\`html`，导致格式错乱

### 问题表现

**原始内容:**
```html
<el-radio-group v-model="form.sex">
  <el-radio
```

**冲突导致的错误续写:**
```html
```html
<template>
  <div class="p-6 bg-white rounded-lg shadow-md">
    <!-- 重复整个模板 -->
```

## 🛠️ 解决方案

### 1. 创建续写专用系统规则

为续写场景创建独立的系统规则，完全避免与原有规则冲突：

```typescript
private generateContinuationSystemRule(previousContent: string): string {
  if (this.isVueCode(previousContent)) {
    return `你是一个专业的Vue代码续写助手。你的任务是：
1. 续写Vue组件代码，从中断处直接继续
2. 不要重复任何已有内容
3. 不要添加代码块标记（如\`\`\`html），直接输出纯代码
4. 保持代码格式和缩进一致
5. 确保语法正确，标签正确闭合
6. 不要重新开始整个模板结构
7. 只输出需要续写的部分`;
  }
  // ... 其他类型的规则
}
```

### 2. 替换消息中的系统规则

在续写时，完全替换原有的系统消息：

```typescript
const continuationMessages: ChatMessage[] = [
  // 使用专门的续写系统规则，避免与原有规则冲突
  {
    role: 'system',
    content: this.generateContinuationSystemRule(previousContent)
  },
  // 移除原始消息中的系统消息，避免冲突
  ...originalMessages.filter(msg => msg.role !== 'system'),
  {
    role: 'assistant',
    content: previousContent
  },
  {
    role: 'user',
    content: this.generateOptimizedContinuationPrompt(previousContent, continuationPrompt)
  }
];
```

### 3. 强化续写提示词

在用户提示词中也明确禁止代码块标记：

```typescript
return `请继续完成上面的Vue组件代码，注意：
1. 不要重复已有的内容
2. 直接从代码中断的地方继续写
3. 保持代码格式和缩进一致
4. 确保语法正确和结构完整
5. 如果是HTML标签未闭合，请正确闭合
6. 不要添加代码块标记（如\`\`\`html），直接输出代码内容
7. 不要重新开始整个模板结构
请继续：`;
```

## 📊 预期效果对比

### 修复前（有冲突）

**输入:**
```html
<el-radio-group v-model="form.sex">
  <el-radio
```

**错误输出:**
```html
```html
<template>
  <div class="p-6 bg-white rounded-lg shadow-md">
    <el-form :model="form" label-width="100px" class="space-y-4">
      <!-- 重复整个模板 -->
```

### 修复后（无冲突）

**输入:**
```html
<el-radio-group v-model="form.sex">
  <el-radio
```

**正确输出:**
```html
 value="male">男</el-radio>
          <el-radio value="female">女</el-radio>
        </el-radio-group>
      </el-form-item>
```

## 🎯 关键改进

1. **完全隔离** - 续写使用独立的系统规则，与原有规则完全隔离
2. **精确指令** - 多层级明确禁止代码块标记
3. **上下文清理** - 移除可能冲突的原始系统消息
4. **针对性优化** - 根据内容类型生成专门的续写规则

## ✅ 解决效果

- ❌ **消除重复**: 不会重复已有内容
- ❌ **消除格式错乱**: 不会添加 `\`\`\`html` 标记
- ❌ **消除结构重复**: 不会重新开始整个模板
- ✅ **精准续写**: 从中断处直接继续
- ✅ **格式正确**: 保持正确的代码格式和缩进
- ✅ **语法完整**: 确保标签正确闭合

现在续写功能应该能够正确处理 Vue 代码，避免系统规则冲突导致的格式问题！
