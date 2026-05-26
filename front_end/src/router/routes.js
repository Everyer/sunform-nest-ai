export const staticRoutes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', whiteList: true }
  },
  {
    path: '/',
    name: 'root',
    component: () => import('@/layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '工作台', icon: 'GridOutline' }
      },
      {
        path: 'workflow/template/editor',
        name: 'FlowTemplateEditor',
        component: () => import('@/views/workflow/template/editor.vue'),
        meta: { title: '模板编辑器', dynamic: false, hidden: true }
      },
      {
        path: 'workflow/instance/detail',
        name: 'FlowInstanceDetail',
        component: () => import('@/views/workflow/instance/detail.vue'),
        meta: { title: '实例详情', dynamic: false, hidden: true }
      },
      {
        path: 'workflow/instance/start',
        name: 'FlowInstanceStart',
        component: () => import('@/views/workflow/instance/start.vue'),
        meta: { title: '发起流程', dynamic: false, hidden: true }
      },
      {
        path: 'modules/knowledge/documents',
        name: 'KnowledgeDocuments',
        component: () => import('@/views/modules/knowledge/documents.vue'),
        meta: { title: '知识库文档管理', dynamic: false, hidden: true }
      },
      {
        path: 'print/list',
        name: 'PrintTemplateList',
        component: () => import('@/views/print/list.vue'),
        meta: { title: '打印模板中台', icon: 'PrintOutline', dynamic: false }
      },
      {
        path: 'print/designer',
        name: 'PrintTemplateDesigner',
        component: () => import('@/views/print/index.vue'),
        meta: { title: '报表打印设计器', dynamic: false, hidden: true }
      }
    ]
  }
]
