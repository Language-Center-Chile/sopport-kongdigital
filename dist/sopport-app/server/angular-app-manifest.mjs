
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 1,
    "redirectTo": "/login",
    "route": "/"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-OMYQ6FPU.js"
    ],
    "route": "/login"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-BUZP7YSZ.js"
    ],
    "route": "/tickets"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-RYXCMKDY.js"
    ],
    "route": "/dashboard"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-H4WKMXNY.js"
    ],
    "route": "/settings"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-QBQJLHJN.js"
    ],
    "route": "/agents"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-WIKKPWJQ.js"
    ],
    "route": "/admin-panel"
  },
  {
    "renderMode": 1,
    "redirectTo": "/login",
    "route": "/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 23872, hash: '9a674ddf2afb0a69dba3cc4ec9c1bf1da6553c07b11393e87dc3d6e1a810478f', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 15943, hash: 'f487bc2f47bf59f8be815efd8c0917a51253b88527c7d319c93eae0c22126ab2', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'login/index.html': {size: 35606, hash: '223f15b8e38a4c480775c644c4f2694e162ed3c1a12fe20513df1396afaa5590', text: () => import('./assets-chunks/login_index_html.mjs').then(m => m.default)},
    'styles-3Z4FDA7T.css': {size: 39981, hash: 'fkqWqVEA9z0', text: () => import('./assets-chunks/styles-3Z4FDA7T_css.mjs').then(m => m.default)}
  },
};
