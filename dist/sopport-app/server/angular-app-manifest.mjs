
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
      "chunk-FRQI77DQ.js"
    ],
    "route": "/login"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-6JMWLEIH.js"
    ],
    "route": "/tickets"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-Y62EQMTC.js"
    ],
    "route": "/dashboard"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-TB3IW5GV.js"
    ],
    "route": "/settings"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-DQFPTK6Z.js"
    ],
    "route": "/agents"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-MOVT2HFG.js"
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
    'index.csr.html': {size: 23872, hash: '9a1d916396e8fc214cef9dd96d3a5b53654ba04e384485b2e144a0a1db66d9d3', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 15943, hash: 'c807b61abdefb8cb045b47e67958b6b40bfb08ad0f972c97eb9f59ac89952b20', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'login/index.html': {size: 35549, hash: '44a5de6f6b90b3b9ed9ac0942af834cfabbe1bac4c98e1841ab954b9fafd1a0e', text: () => import('./assets-chunks/login_index_html.mjs').then(m => m.default)},
    'styles-77EXK4NZ.css': {size: 41577, hash: 'lHxd6F4NRBo', text: () => import('./assets-chunks/styles-77EXK4NZ_css.mjs').then(m => m.default)}
  },
};
