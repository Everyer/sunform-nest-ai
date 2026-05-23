export function buildPreviewHtml(templateCode, extractTemplate, extractScript, fieldPermissions = {}) {
  let raw = templateCode || ''
  // Hot patch: seamless backward compatibility with legacy non-compilable if statement in @click
  raw = raw.replace(
    /@click="\s*if\s*\(\s*!formData\.([a-zA-Z0-9_]+)\s*\)\s*(?:\{\s*)?formData\.\1\s*=\s*\[\];?\s*(?:\}\s*)?formData\.\1\.push\(([\s\S]*?)\);?\s*"/g,
    '@click="(formData.$1 = formData.$1 || []).push($2)"'
  )
  const innerHtml = raw ? extractTemplate(raw) : ''
  const rawScript = raw ? extractScript(raw) : null
  const rawStyle = raw ? extractStyle(raw) : ''
  const cfgTag = '<n-config-provider :locale="locale" :date-locale="dateLocale">'
  const endCfg = '</n-config-provider>'
  const S = '<'
  const eScr = '/script>'
  
  const permissionsJson = JSON.stringify(fieldPermissions || {})

  // CRITICAL: Embed template as a JS string instead of reading from DOM innerHTML.
  // Browser's HTML parser applies "foster parenting" to table elements (<thead>, <tbody>, <tr>, <td>)
  // when they appear inside unknown custom elements like <n-table>, restructuring the DOM
  // and breaking Vue's v-for scoping. By embedding the template directly as a string,
  // we bypass the browser's HTML parser entirely and let Vue's own compiler handle it.
  const escapedTemplate = JSON.stringify(cfgTag + innerHtml + endCfg)

  // Custom unified field component definition inside iframe to mock real WfField.vue behaviors
  const wfFieldComponentJs = `
  app.component('WfField', {
    props: ['label', 'path', 'type', 'value', 'modelValue', 'placeholder', 'options', 'columns', 'rows', 'min', 'max'],
    emits: ['update:value', 'update:modelValue'],
    template: \`
      <div v-if="permission !== 'hidden'" class="mb-4">
        <!-- Subtable Preview -->
        <div v-if="type === 'subtable'" class="w-full">
          <div class="flex items-center justify-between mb-2">
            <label class="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <span class="w-1.5 h-3.5 bg-blue-500 rounded-full"></span>
              {{ label }}
            </label>
            <span class="text-xs text-slate-400 font-medium">共 {{ (val || []).length }} 项 (设计预览)</span>
          </div>
          
          <div class="w-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <n-table :bordered="false" size="small" class="w-full">
              <thead>
                <tr>
                  <th v-for="c in columns" :key="c.key" class="text-left py-2 px-4 text-xs font-semibold text-slate-600 border-b border-slate-200 bg-slate-50" :style="{ width: 90 / columns.length + '%' }">
                    {{ c.label || c.key }}
                  </th>
                  <th v-if="permission !== 'readonly'" class="text-center py-2 px-4 text-xs font-semibold text-slate-600 border-b border-slate-200 bg-slate-50" style="width: 70px">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in val" :key="idx" class="hover:bg-slate-50">
                  <td v-for="c in columns" :key="c.key" class="py-2 px-4 border-b border-slate-100 align-middle">
                    <n-input-number v-if="c.type === 'number'" v-model:value="row[c.key]" size="small" placeholder="数值" style="width: 100%" :disabled="permission === 'readonly'" />
                    <n-select v-else-if="c.type === 'select'" v-model:value="row[c.key]" :options="parseOptions(c.optionsText)" size="small" placeholder="选择" :disabled="permission === 'readonly'" />
                    <n-date-picker v-else-if="c.type === 'date'" :value="row[c.key] ? Number(row[c.key]) : null" @update:value="v => row[c.key] = v" type="date" size="small" style="width: 100%" :disabled="permission === 'readonly'" />
                    <n-date-picker v-else-if="c.type === 'datetime'" :value="row[c.key] ? Number(row[c.key]) : null" @update:value="v => row[c.key] = v" type="datetime" size="small" style="width: 100%" :disabled="permission === 'readonly'" />
                    <n-input v-else-if="c.type === 'textarea'" v-model:value="row[c.key]" type="textarea" :rows="2" size="small" placeholder="多行" :disabled="permission === 'readonly'" />
                    <n-radio-group v-else-if="c.type === 'radio'" v-model:value="row[c.key]" :disabled="permission === 'readonly'">
                      <n-space><n-radio v-for="o in parseOptions(c.optionsText)" :key="o.value" :value="o.value">{{ o.label }}</n-radio></n-space>
                    </n-radio-group>
                    <n-checkbox-group v-else-if="c.type === 'checkbox'" v-model:value="row[c.key]" :disabled="permission === 'readonly'">
                      <n-space><n-checkbox v-for="o in parseOptions(c.optionsText)" :key="o.value" :value="o.value">{{ o.label }}</n-checkbox></n-space>
                    </n-checkbox-group>
                    <n-switch v-else-if="c.type === 'switch'" v-model:value="row[c.key]" :disabled="permission === 'readonly'" />
                    
                    <!-- Subtable User Picker Mock -->
                    <div v-else-if="c.type === 'user'" class="flex items-center justify-between border border-slate-200 rounded p-1.5 px-3 bg-slate-50/50 cursor-pointer" @click="pickUserSub(row, c.key)">
                      <span class="text-xs text-slate-700">👤 {{ row[c.key] || '选择人员...' }}</span>
                    </div>
                    <!-- Subtable Upload Mock -->
                    <div v-else-if="c.type === 'upload'" class="flex items-center justify-between border border-slate-200 border-dashed rounded p-1.5 px-3 bg-slate-50/20 cursor-pointer hover:border-blue-400 transition-colors" @click="uploadFileSub(row, c.key)">
                      <span class="text-xs text-slate-500">📤 {{ (row[c.key] || []).length ? '📎 ' + row[c.key].length + ' 文件' : '上传附件...' }}</span>
                    </div>
                    
                    <n-input v-else v-model:value="row[c.key]" size="small" placeholder="输入" :disabled="permission === 'readonly'" />
                  </td>
                  <td v-if="permission !== 'readonly'" class="py-2 px-4 border-b border-slate-100 text-center align-middle">
                    <n-button size="tiny" type="error" text @click="val.splice(idx, 1)">
                      <template #icon>
                        <n-icon><svg viewBox="0 0 512 512" fill="currentColor"><path d="M112 112l20 320c.95 18.49 14.4 32 32 32h184c17.6 0 30.1-13.51 32-32l20-320H112zm80 248c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16v168zm80 0c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16v168zm80 0c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16v168zM432 80h-82.41l-34-56.7A48 48 0 0 0 274.41 0H237.6a48 48 0 0 0-41.16 23.3L162.41 80H80a16 16 0 0 0 0 32h352a16 16 0 0 0 0-32z"/></svg></n-icon>
                      </template>
                    </n-button>
                  </td>
                </tr>
                <tr v-if="!val || val.length === 0">
                  <td :colspan="columns.length + (permission !== 'readonly' ? 1 : 0)" class="text-center py-6 text-xs text-slate-400 border-b border-slate-100 bg-slate-50/20">
                    暂无明细项，请点击下方「添加明细」
                  </td>
                </tr>
              </tbody>
            </n-table>
            <div v-if="permission !== 'readonly'" class="p-2 bg-slate-50 border-t border-slate-200 text-center">
              <n-button size="small" type="primary" dashed block @click="addRow">
                + 添加明细项
              </n-button>
            </div>
          </div>
        </div>

        <!-- Standard Field Preview -->
        <n-form-item v-else :label="label" :path="path" class="w-full">
          <div v-if="permission === 'readonly' && ['user', 'upload'].includes(type)" class="w-full">
            <div v-if="type === 'user'" class="flex items-center gap-2 border border-slate-150 bg-slate-50 rounded-lg p-2">
              <span class="text-xs">👤</span>
              <span class="text-sm font-medium">{{ val || '未选择人员' }}</span>
            </div>
            <div v-else-if="type === 'upload'" class="flex flex-col gap-1.5">
              <div v-if="!val || val.length === 0" class="text-xs text-slate-400 italic">无附件</div>
              <div v-else-if="Array.isArray(val)" v-for="(file, fidx) in val" :key="fidx" class="flex items-center justify-between border border-slate-150 bg-slate-50 rounded-lg p-2">
                <span class="text-sm text-slate-600">📂 {{ file.name || file }}</span>
              </div>
            </div>
          </div>
          
          <template v-else>
            <n-input v-if="type === 'input'" :value="val" @update:value="updateVal" :placeholder="placeholder || '请输入' + label" :disabled="permission === 'readonly'" clearable />
            <n-input v-else-if="type === 'textarea'" :value="val" @update:value="updateVal" type="textarea" :rows="rows || 4" :placeholder="placeholder || '请输入' + label" :disabled="permission === 'readonly'" clearable />
            <n-input-number v-else-if="type === 'number'" :value="val" @update:value="updateVal" :min="min" :max="max" style="width: 100%" :placeholder="placeholder || '请输入'" :disabled="permission === 'readonly'" clearable />
            <n-select v-else-if="type === 'select'" :value="val" @update:value="updateVal" :options="options" :placeholder="placeholder || '请选择'" :disabled="permission === 'readonly'" clearable />
            <n-radio-group v-else-if="type === 'radio'" :value="val" @update:value="updateVal" :disabled="permission === 'readonly'">
              <n-space><n-radio v-for="o in options" :key="o.value" :value="o.value">{{ o.label }}</n-radio></n-space>
            </n-radio-group>
            <n-checkbox-group v-else-if="type === 'checkbox'" :value="val" @update:value="updateVal" :disabled="permission === 'readonly'">
              <n-space><n-checkbox v-for="o in options" :key="o.value" :value="o.value">{{ o.label }}</n-checkbox></n-space>
            </n-checkbox-group>
            <n-date-picker v-else-if="type === 'date'" :value="val ? Number(val) : null" @update:value="updateVal" type="date" style="width: 100%" :placeholder="placeholder || '选择日期'" :disabled="permission === 'readonly'" clearable />
            <n-date-picker v-else-if="type === 'datetime'" :value="val ? Number(val) : null" @update:value="updateVal" type="datetime" style="width: 100%" :placeholder="placeholder || '选择日期时间'" :disabled="permission === 'readonly'" clearable />
            <n-switch v-else-if="type === 'switch'" :value="val" @update:value="updateVal" :disabled="permission === 'readonly'" />
            
            <!-- Custom UI Mock -->
            <div v-else-if="type === 'user'" class="w-full flex items-center justify-between border border-slate-200 hover:border-blue-400 rounded-lg p-2 bg-slate-50/50 cursor-pointer" @click="pickUser">
              <span class="text-sm text-slate-500">👤 {{ val || '点击选择系统人员 (预览)...' }}</span>
              <n-button v-if="val" size="tiny" type="error" text @click.stop="updateVal('')">清除</n-button>
            </div>
            <div v-else-if="type === 'upload'" class="w-full">
              <div v-if="!val || val.length === 0" class="flex flex-col items-center justify-center border border-dashed border-slate-300 hover:border-blue-400 rounded-lg p-4 bg-slate-50/20 cursor-pointer text-slate-400" @click="uploadFile">
                <span class="text-lg">📤</span>
                <span class="text-xs font-medium">点击模拟上传附件</span>
              </div>
              <div v-else class="flex flex-col gap-1.5">
                <div v-for="(file, fidx) in val" :key="fidx" class="flex items-center justify-between border border-slate-200 bg-slate-50 p-2 rounded-lg">
                  <span class="text-xs text-slate-600">📂 {{ file.name || file }}</span>
                  <n-button size="tiny" type="error" text @click="val.splice(fidx, 1)">删除</n-button>
                </div>
                <n-button size="small" type="primary" dashed @click="uploadFile">+ 继续添加文件</n-button>
              </div>
            </div>
            <n-input v-else :value="val" @update:value="updateVal" :placeholder="placeholder || '请输入'" :disabled="permission === 'readonly'" />
          </template>
        </n-form-item>
      </div>
    \`,
    computed: {
      val() {
        return this.modelValue !== undefined ? this.modelValue : this.value;
      },
      permission() {
        return this.$workflow?.nodePermissions?.[this.path] || 'editable';
      }
    },
    methods: {
      updateVal(v) {
        this.$emit('update:modelValue', v);
        this.$emit('update:value', v);
      },
      parseOptions(txt) {
        if (!txt) return [];
        return txt.split('/').filter(Boolean).map(o => ({ label: o.trim(), value: o.trim() }));
      },
      addRow() {
        let current = Array.isArray(this.val) ? [...this.val] : [];
        const row = this.columns.reduce((acc, c) => {
          acc[c.key] = c.type === 'number' ? null : (c.type === 'date' ? null : '');
          return acc;
        }, {});
        current.push(row);
        this.updateVal(current);
      },
      pickUser() {
        if (this.permission === 'readonly') return;
        const mockNames = ['李明', '王华', '张伟', '陈静', '赵敏'];
        const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
        this.updateVal(randomName);
      },
      uploadFile() {
        if (this.permission === 'readonly') return;
        let currentVal = Array.isArray(this.val) ? [...this.val] : [];
        const mockFiles = ['发票.pdf', '差旅明细.xlsx', '凭证图片.png'];
        const randomFile = mockFiles[Math.floor(Math.random() * mockFiles.length)];
        currentVal.push({ name: randomFile, size: '256KB' });
        this.updateVal(currentVal);
      },
      pickUserSub(row, key) {
        if (this.permission === 'readonly') return;
        const mockNames = ['李明', '王华', '张伟'];
        row[key] = mockNames[Math.floor(Math.random() * mockNames.length)];
      },
      uploadFileSub(row, key) {
        if (this.permission === 'readonly') return;
        if (!Array.isArray(row[key])) row[key] = [];
        row[key].push({ name: '预览附件.pdf', size: '128KB' });
      }
    }
  });
  `;

  let iframeCode = ''
  if (rawScript) {
    // 过滤所有的 import 语句
    var cleanScr = rawScript.replace(/import\s+[\s\S]*?from\s+['"].*?['"];?/g, '').trim();
    cleanScr = cleanScr.replace(/^export\s+default\s+/, '').trim();
    if (cleanScr.endsWith(';')) cleanScr = cleanScr.slice(0, -1);
    
    iframeCode = ';(function(){'
      + 'var userOpts={};'
      + 'try{'
      + '  var finalScr = ' + JSON.stringify(cleanScr) + ';'
      // 容错：将 components: { ... } 替换为 components: {}，防止 import 剥离后在 components 引用抛出 ReferenceError
      + '  finalScr = finalScr.replace(/components\\s*:\\s*\\{[\\s\\S]*?\\}/g, "components: {}");'
      + '  userOpts = new Function("return (" + finalScr + ")")();'
      + '}catch(e){console.error("[previewHtml] Script parse error:", e);}'
      + 'var App={data(){var base={formData:{},formRules:{},'
      + 'locale:typeof naive!=="undefined"?naive.zhCN:null,'
      + 'dateLocale:typeof naive!=="undefined"?naive.dateZhCN:null};'
      + 'try{var extraData=typeof userOpts.data==="function"?userOpts.data():{};Object.assign(base,extraData)}catch(e){}'
      + 'return base},methods:userOpts&&userOpts.methods||{},computed:userOpts&&userOpts.computed||{},'
      + 'watch:userOpts&&userOpts.watch||{},'
      + 'template:' + escapedTemplate
      + '};var app=Vue.createApp(App);if(typeof naive!=="undefined")app.use(naive);'
      + wfFieldComponentJs
      + 'app.config.globalProperties.$workflow={nodePermissions:' + permissionsJson + '};'
      + 'app.mount("#app")})()'
  } else {
    iframeCode = ';(function(){var App={data(){return{formData:{},formRules:{},'
      + 'locale:typeof naive!=="undefined"?naive.zhCN:null,'
      + 'dateLocale:typeof naive!=="undefined"?naive.dateZhCN:null}},'
      + 'template:' + escapedTemplate
      + '};var app=Vue.createApp(App);if(typeof naive!=="undefined")app.use(naive);'
      + wfFieldComponentJs
      + 'app.config.globalProperties.$workflow={nodePermissions:' + permissionsJson + '};'
      + 'app.mount("#app")})()'
  }

  return '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">'
    + S + 'script src="https://cdn.tailwindcss.com">' + S + eScr
    + S + 'script>tailwind.config={corePlugins:{preflight:false},theme:{extend:{boxShadow:{premium:"0 10px 40px -10px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.03)",massive:"0 20px 60px -15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)"}}}}'+ S + eScr
    + S + 'script src="https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.prod.js">' + S + eScr
    + S + 'script src="https://cdn.jsdelivr.net/npm/naive-ui/dist/index.min.js">' + S + eScr
    + rawStyle
    + '<style>body{margin:0;padding:0;font-family:system-ui,sans-serif;background:#f8fafc}#app{min-height:100vh}</style>'
    + '<meta name="naive-ui-style" />'
    + '</head><body><div id="app"></div>' + S + 'script>' + iframeCode + S + eScr + '</body></html>'
}

function extractTemplate(code) {
  const match = code.match(/<template>([\s\S]*)<\/template>/)
  if (!match) return ''
  return match[1]
    .replace(/<style[^>]*>[\s\S]*?<\/style>/g, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/g, '')
    .trim()
}

function extractScript(code) {
  const match = code.match(/<script[^>]*>([\s\S]*?)<\/script>/)
  if (!match) return null
  return match[1].trim()
}

function extractStyle(code) {
  const match = code.match(/<style[\s\S]*?<\/style>/)
  return match ? match[0] : ''
}
