# 优化的续写提示词

## 问题分析

从你提供的例子可以看出，之前的续写存在以下问题：

1. **重复内容** - 重复了 `<template>` 开头
2. **格式混乱** - 出现了 `<el```html` 这样的错误格式
3. **不连贯** - 没有从正确的位置继续

## 优化方案

现在系统会根据内容类型自动生成针对性的续写提示词：

### 1. Vue 代码续写提示

```
请继续完成上面的Vue组件代码，注意：
1. 不要重复已有的内容
2. 直接从代码中断的地方继续写
3. 保持代码格式和缩进一致
4. 确保语法正确和结构完整
5. 如果是HTML标签未闭合，请正确闭合
请继续：
```

### 2. HTML 代码续写提示

```
请继续完成上面的HTML代码，注意：
1. 不要重复任何已有内容
2. 从代码截断处直接继续
3. 保持正确的HTML格式和缩进
4. 确保标签正确闭合
请继续：
```

### 3. JavaScript 代码续写提示

```
请继续完成上面的JavaScript代码，注意：
1. 不要重复已有代码
2. 从中断处直接继续
3. 保持代码风格一致
4. 确保语法正确
请继续：
```

### 4. 文章内容续写提示

```
请继续完成上面的文章内容，注意：
1. 不要重复已写的内容
2. 保持文章风格和语调一致
3. 逻辑连贯，自然过渡
4. 从上一句话自然接续
请继续：
```

## 智能检测逻辑

### Vue 代码检测

```typescript
private isVueCode(content: string): boolean {
  return /(<template>|<script|<style|\.vue|v-model|v-if|v-for|defineProps|defineEmits)/i.test(content);
}
```

检测关键词：`<template>`, `<script>`, `<style>`, `v-model`, `v-if`, `defineProps` 等

### HTML 代码检测

```typescript
private isHtmlCode(content: string): boolean {
  return /(<\/?\w+[^>]*>|<!DOCTYPE|<html|<head|<body)/i.test(content);
}
```

检测关键词：HTML 标签、DOCTYPE、html、head、body 等

### JavaScript 代码检测

```typescript
private isJavaScriptCode(content: string): boolean {
  return /(function\s+\w+|const\s+\w+\s*=|let\s+\w+\s*=|var\s+\w+\s*=|class\s+\w+|import\s+.*from|export\s+)/i.test(content);
}
```

检测关键词：function、const、let、var、class、import、export 等

### 文章内容检测

```typescript
private isArticleContent(content: string): boolean {
  const chineseText = /[\u4e00-\u9fa5]+/g.test(content);
  const hasParagraphs = content.includes('\n\n') || content.length > 100;
  const noCodeMarkers = !/<[^>]+>/.test(content) && !/(function|const|let|var)\s+\w+/.test(content);
  
  return chineseText && hasParagraphs && noCodeMarkers;
}
```

检测条件：包含中文、有段落结构、不包含代码标识

## 优化效果

### 之前的问题示例

**原始内容:**
```html
<template>
  <div class="p-6 bg-white rounded-lg shadow-md">
    <el-form :model="form" label-width="100px" class="max-w-md mx-auto">
      <el-form-item label="姓名">
        <el-input v-model="form.name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="性别">
        <el-radio-group v-model="form.gender">
          <el
```

**之前的续写结果:**
```html
```html
<template>
  <div class="p-6 bg-white rounded-lg shadow-md">
    <el-form :model="form" label-width="100px" class="max-w-md mx-auto">
      <el-form-item label="姓名">
        <el-input v-model="form.name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="性别">
        <el-radio-group v-model="form.gender">
          <el
```

**优化后的续写结果:**
```html
-radio value="male">男</el-radio>
          <el-radio value="female">女</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="年龄">
        <el-input-number v-model="form.age" :min="1" :max="100" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">提交</el-button>
        <el-button @click="onReset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
```

## 关键改进

1. **无重复内容** - 直接从 `<el` 后面继续，不重复前面的内容
2. **格式正确** - 正确闭合标签，保持缩进
3. **逻辑连贯** - 自然补充完整的表单结构
4. **语法正确** - 确保 HTML 和 Vue 语法都正确

这样的优化让续写功能更加实用和准确！
