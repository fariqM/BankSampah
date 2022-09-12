
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('src/pages/Home.vue'), name:'home' },
      { path: 'tes1', component: () => import('src/pages/Setor.vue'), name:'tes1' },
      { path: 'tes2', component: () => import('src/pages/Tarik.vue'), name:'tes2' }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
