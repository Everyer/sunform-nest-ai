export function buildPreviewHtml(templateCode, extractTemplate, extractScript, fieldPermissions = {}) {
  const raw = templateCode || ''
  const innerHtml = raw ? extractTemplate(raw) : ''
  const rawScript = raw ? extractScript(raw) : null
  const rawStyle = raw ? extractStyle(raw) : ''
  const cfgTag = '<n-config-provider :locale="locale" :date-locale="dateLocale">'
  const endCfg = '</n-config-provider>'
  const S = '<'
  const eScr = '/script>'
  
  const permissionsJson = JSON.stringify(fieldPermissions || {})

  let iframeCode = ''
  if (rawScript) {
    var cleanScr = rawScript.replace(/^export\s+default\s+/, '').trim();
    if (cleanScr.endsWith(';')) cleanScr = cleanScr.slice(0, -1);
    iframeCode = ';(function(){var userOpts=(function(){return (' + cleanScr + ')})();'
      + 'var App={data(){var base={formData:{},formRules:{},locale:null,dateLocale:null};'
      + 'try{var extraData=typeof userOpts.data==="function"?userOpts.data():{};Object.assign(base,extraData)}catch(e){}'
      + 'return base},methods:userOpts&&userOpts.methods||{},computed:userOpts&&userOpts.computed||{},'
      + 'watch:userOpts&&userOpts.watch||{},'
      + "template:'" + cfgTag + "'+document.getElementById('app').innerHTML.trim()+'"+ endCfg + "'"
      + '};var app=Vue.createApp(App);if(typeof naive!=="undefined")app.use(naive);'
      + 'app.config.globalProperties.$workflow={nodePermissions:' + permissionsJson + '};'
      + 'app.mount("#app")})()'
  } else {
    iframeCode = ';(function(){var App={data(){return{formData:{},formRules:{},locale:null,dateLocale:null}},'
      + "template:'" + cfgTag + "'+document.getElementById('app').innerHTML.trim()+'"+ endCfg + "'"
      + '};var app=Vue.createApp(App);if(typeof naive!=="undefined")app.use(naive);'
      + 'app.config.globalProperties.$workflow={nodePermissions:' + permissionsJson + '};'
      + 'app.mount("#app")})()'
  }

  return '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">'
    + S + 'script src="https://cdn.tailwindcss.com">' + S + eScr
    + S + 'script>tailwind.config={corePlugins:{preflight:false},theme:{extend:{boxShadow:{premium:"0 10px 40px -10px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.03)",massive:"0 20px 60px -15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)"}}}}' + S + eScr
    + S + 'script src="https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.prod.js">' + S + eScr
    + S + 'script src="https://cdn.jsdelivr.net/npm/naive-ui/dist/index.min.js">' + S + eScr
    + rawStyle
    + '<style>body{margin:0;padding:0;font-family:system-ui,sans-serif;background:#f8fafc}#app{min-height:100vh}</style>'
    + '<meta name="naive-ui-style" />'
    + '</head><body><div id="app">' + innerHtml + '</div>' + S + 'script>' + iframeCode + S + eScr + '</body></html>'
}

function extractStyle(code) {
  const match = code.match(/<style[\s\S]*?<\/style>/)
  return match ? match[0] : ''
}
