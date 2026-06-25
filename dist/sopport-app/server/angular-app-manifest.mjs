
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
      "chunk-5UJDMRS6.js"
    ],
    "route": "/login"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-LPXUO6V7.js"
    ],
    "route": "/tickets"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-2HY3YIHE.js"
    ],
    "route": "/dashboard"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-NRI5ONRQ.js"
    ],
    "route": "/settings"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-CZF34GHE.js"
    ],
    "route": "/agents"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-YEQDRX23.js"
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
    'index.csr.html': {size: 23872, hash: 'be2c3f5b0b527a80e46321c6e07b668517942593896e6ea5b98447f96cf080e5', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 15943, hash: '44af909b1d0c7eb5b5738e9813236ba7ba517cb8183c75e0ea342d5548581d24', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'login/index.html': {size: 35549, hash: 'ab1c9840eead7a2047df65a138174d2377917e3ed37f13cb7b691124694bd527', text: () => import('./assets-chunks/login_index_html.mjs').then(m => m.default)},
    'styles-ER2YUULZ.css': {size: 39809, hash: 'hALjo0tDDQk', text: () => import('./assets-chunks/styles-ER2YUULZ_css.mjs').then(m => m.default)}
  },
};
