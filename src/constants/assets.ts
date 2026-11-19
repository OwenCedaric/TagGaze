export interface SvgAssetItem {
  id: string
  name: string
  category: 'trust' | 'promo' | 'social' | 'pointers'
  categoryName: string
  svg: string
  defaultFill: string
  defaultWidth?: number
  defaultHeight?: number
}

export const ASSET_CATEGORIES = [
  { id: 'all', name: '全部资产' },
  { id: 'trust', name: '信任与品质' },
  { id: 'promo', name: '大促营销角标' },
  { id: 'social', name: '社媒种草指示' },
  { id: 'pointers', name: '指示箭头与焦点' }
] as const

export const SVG_ASSETS: SvgAssetItem[] = [
  // ================= 1. 信任与品质保障 (Trust & Quality) =================
  {
    id: 'badge-5stars',
    name: '五星好评徽章',
    category: 'trust',
    categoryName: '信任与品质',
    defaultFill: '#82a1b9',
    defaultWidth: 200,
    defaultHeight: 40,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="32" viewBox="0 0 160 32" fill="currentColor">
      <path d="M16 2l3.7 11.4h12l-9.7 7 3.7 11.4L16 24.8 6.3 31.8l3.7-11.4-9.7-7h12z"/>
      <path d="M48 2l3.7 11.4h12l-9.7 7 3.7 11.4L48 24.8 38.3 31.8l3.7-11.4-9.7-7h12z"/>
      <path d="M80 2l3.7 11.4h12l-9.7 7 3.7 11.4L80 24.8 70.3 31.8l3.7-11.4-9.7-7h12z"/>
      <path d="M112 2l3.7 11.4h12l-9.7 7 3.7 11.4L112 24.8 102.3 31.8l3.7-11.4-9.7-7h12z"/>
      <path d="M144 2l3.7 11.4h12l-9.7 7 3.7 11.4L144 24.8 134.3 31.8l3.7-11.4-9.7-7h12z"/>
    </svg>`
  },
  {
    id: 'badge-shield',
    name: '品质保证盾牌',
    category: 'trust',
    categoryName: '信任与品质',
    defaultFill: '#3d4451',
    defaultWidth: 110,
    defaultHeight: 110,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="currentColor">
      <path d="M32 4L10 14v18c0 15.5 9.4 30 22 34 12.6-4 22-18.5 22-34V14L32 4zm-4 38L18 32l3.8-3.8 6.2 6.2 14.2-14.2 3.8 3.8L28 42z"/>
    </svg>`
  },
  {
    id: 'badge-shipping',
    name: '顺丰极速包邮',
    category: 'trust',
    categoryName: '信任与品质',
    defaultFill: '#82a1b9',
    defaultWidth: 110,
    defaultHeight: 110,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="currentColor">
      <path d="M42 16H8a4 4 0 00-4 4v24h6a8 8 0 0016 0h12a8 8 0 0016 0h6V32l-10-16h-8zm-24 32a4 4 0 110-8 4 4 0 010 8zm30 0a4 4 0 110-8 4 4 0 010 8zm6-18h-8v-8h5.5l5.5 8z"/>
    </svg>`
  },
  {
    id: 'badge-quality',
    name: '典雅甄选印记',
    category: 'trust',
    categoryName: '信任与品质',
    defaultFill: '#3d4451',
    defaultWidth: 110,
    defaultHeight: 110,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5">
      <circle cx="32" cy="32" r="28"/>
      <circle cx="32" cy="32" r="23" stroke-dasharray="3 3"/>
      <path d="M22 32l7 7 13-13" stroke-width="3" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'badge-return',
    name: '7天退换保证',
    category: 'trust',
    categoryName: '信任与品质',
    defaultFill: '#3d4451',
    defaultWidth: 110,
    defaultHeight: 110,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5">
      <path d="M12 28A20 20 0 1 1 18 46" stroke-linecap="round"/>
      <path d="M12 18v10h10" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="32" y="38" font-size="16" font-family="sans-serif" font-weight="bold" text-anchor="middle" fill="currentColor" stroke="none">7D</text>
    </svg>`
  },
  {
    id: 'badge-guarantee',
    name: '假一赔十承诺',
    category: 'trust',
    categoryName: '信任与品质',
    defaultFill: '#e11d48',
    defaultWidth: 110,
    defaultHeight: 110,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5">
      <rect x="8" y="8" width="48" height="48" rx="8" stroke-dasharray="4 2"/>
      <circle cx="32" cy="32" r="16"/>
      <text x="32" y="37" font-size="13" font-family="sans-serif" font-weight="900" text-anchor="middle" fill="currentColor" stroke="none">10×</text>
    </svg>`
  },

  // ================= 2. 大促与营销角标 (Promotions & Ribbons) =================
  {
    id: 'badge-hot',
    name: 'HOT 爆款热卖',
    category: 'promo',
    categoryName: '大促营销角标',
    defaultFill: '#e11d48',
    defaultWidth: 100,
    defaultHeight: 100,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="currentColor">
      <path d="M34 4c0 7-4 12-7 16-2-4-2-8-1-12-8 6-12 16-12 26 0 14.4 11.6 26 26 26s26-11.6 26-26c0-14-8-22-14-27-1 5-4 9-7 10 1-5-1-9-3-13z"/>
      <circle cx="32" cy="44" r="8" fill="#ffffff"/>
    </svg>`
  },
  {
    id: 'badge-new',
    name: 'NEW 新品上市',
    category: 'promo',
    categoryName: '大促营销角标',
    defaultFill: '#e11d48',
    defaultWidth: 120,
    defaultHeight: 60,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="48" viewBox="0 0 120 48" fill="none">
      <rect x="2" y="2" width="116" height="44" rx="22" fill="currentColor"/>
      <text x="60" y="30" font-size="18" font-family="sans-serif" font-weight="900" text-anchor="middle" fill="#ffffff" letter-spacing="2">NEW 新品</text>
    </svg>`
  },
  {
    id: 'badge-top1',
    name: 'TOP 1 热销榜首',
    category: 'promo',
    categoryName: '大促营销角标',
    defaultFill: '#d97706',
    defaultWidth: 110,
    defaultHeight: 110,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="currentColor">
      <path d="M10 20l12 10 10-18 10 18 12-10-4 28H14z"/>
      <rect x="12" y="52" width="40" height="6" rx="2"/>
      <circle cx="10" cy="18" r="3"/>
      <circle cx="32" cy="10" r="3"/>
      <circle cx="54" cy="18" r="3"/>
    </svg>`
  },
  {
    id: 'badge-flashsale',
    name: '限时秒杀闪电',
    category: 'promo',
    categoryName: '大促营销角标',
    defaultFill: '#eab308',
    defaultWidth: 100,
    defaultHeight: 100,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="currentColor">
      <path d="M38 4L14 36h16l-4 24 24-32H34z"/>
    </svg>`
  },
  {
    id: 'badge-bogo',
    name: '买一赠一加礼',
    category: 'promo',
    categoryName: '大促营销角标',
    defaultFill: '#e11d48',
    defaultWidth: 120,
    defaultHeight: 60,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="48" viewBox="0 0 120 48" fill="none">
      <rect x="2" y="2" width="116" height="44" rx="8" fill="currentColor"/>
      <text x="60" y="30" font-size="16" font-family="sans-serif" font-weight="bold" text-anchor="middle" fill="#ffffff" letter-spacing="1">买1赠1正装</text>
    </svg>`
  },
  {
    id: 'badge-coupon',
    name: '大额满减神券',
    category: 'promo',
    categoryName: '大促营销角标',
    defaultFill: '#e11d48',
    defaultWidth: 120,
    defaultHeight: 70,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="60" viewBox="0 0 120 60" fill="currentColor">
      <path d="M4 8a4 4 0 014-4h104a4 4 0 014 4v16a6 6 0 000 12v16a4 4 0 01-4 4H8a4 4 0 01-4-4V36a6 6 0 000-12V8z"/>
      <line x1="38" y1="10" x2="38" y2="50" stroke="#ffffff" stroke-width="2" stroke-dasharray="3 3"/>
      <text x="78" y="36" font-size="15" font-family="sans-serif" font-weight="900" text-anchor="middle" fill="#ffffff">券后立减</text>
    </svg>`
  },

  // ================= 3. 社媒种草与手绘标识 (Social & Pointers) =================
  {
    id: 'tag-recommend',
    name: '🌿 亲测推荐胶囊',
    category: 'social',
    categoryName: '社媒种草指示',
    defaultFill: '#10b981',
    defaultWidth: 150,
    defaultHeight: 50,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="48" viewBox="0 0 160 48" fill="none">
      <rect x="2" y="2" width="156" height="44" rx="22" fill="currentColor"/>
      <circle cx="22" cy="24" r="8" fill="#ffffff"/>
      <text x="88" y="30" font-size="15" font-family="sans-serif" font-weight="bold" text-anchor="middle" fill="#ffffff" letter-spacing="1">🌿 亲测推荐</text>
    </svg>`
  },
  {
    id: 'tag-mustbuy',
    name: '✨ 闭眼入神仙好物',
    category: 'social',
    categoryName: '社媒种草指示',
    defaultFill: '#3d4451',
    defaultWidth: 160,
    defaultHeight: 50,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="170" height="48" viewBox="0 0 170 48" fill="none">
      <rect x="2" y="2" width="166" height="44" rx="8" fill="currentColor"/>
      <text x="85" y="30" font-size="14" font-family="sans-serif" font-weight="bold" text-anchor="middle" fill="#ffffff" letter-spacing="1">✨ 闭眼入不踩雷</text>
    </svg>`
  },
  {
    id: 'pointer-arrow-curved',
    name: '极简弧形指示箭头',
    category: 'social',
    categoryName: '社媒种草指示',
    defaultFill: '#82a1b9',
    defaultWidth: 90,
    defaultHeight: 90,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="currentColor">
      <path d="M52 14c-12-6-28-2-36 10-6 9-5 22 2 30l-4 4 16 2-2-16-4 4c-5-6-6-16-1-23 6-9 19-12 28-7l-5 5 18 2 2-18-6 7z"/>
    </svg>`
  },
  {
    id: 'pointer-circle',
    name: '手绘划重点圈',
    category: 'social',
    categoryName: '社媒种草指示',
    defaultFill: '#e11d48',
    defaultWidth: 110,
    defaultHeight: 110,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round">
      <path d="M32 10c14 0 24 8 24 20s-10 24-25 24C16 54 8 45 8 32c0-13 11-23 26-23 5 0 11 1 16 4"/>
    </svg>`
  },
  {
    id: 'badge-verified',
    name: '官方认证星标',
    category: 'social',
    categoryName: '社媒种草指示',
    defaultFill: '#82a1b9',
    defaultWidth: 100,
    defaultHeight: 100,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="currentColor">
      <path d="M32 4l6 7 9-2 4 9 9 4-2 9 7 6-7 6 2 9-9 4-4 9-9-2-6 7-6-7-9 2-4-9-9-4 2-9-7-6 7-6-2-9 9-4 4-9 9 2z"/>
      <path d="M26 33l5 5 9-10" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  },
  {
    id: 'badge-heart',
    name: '心动种草必买',
    category: 'social',
    categoryName: '社媒种草指示',
    defaultFill: '#e11d48',
    defaultWidth: 100,
    defaultHeight: 100,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="currentColor">
      <path d="M32 54S10 40 10 24a12 12 0 0122-6 12 12 0 0122 6c0 16-22 30-22 30z"/>
    </svg>`
  },

  // ================= 4. 细节指示箭头与标注 (Callout Pointers & Pins) =================
  {
    id: 'arrow-curved-right',
    name: '弧形指示箭头 (向右)',
    category: 'pointers',
    categoryName: '指示箭头与焦点',
    defaultFill: '#e11d48',
    defaultWidth: 100,
    defaultHeight: 80,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="64" viewBox="0 0 80 64" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10 12c24-4 50 8 54 38"/>
      <path d="M50 48l14 2 2-14"/>
    </svg>`
  },
  {
    id: 'arrow-curved-left',
    name: '弧形指示箭头 (向左)',
    category: 'pointers',
    categoryName: '指示箭头与焦点',
    defaultFill: '#e11d48',
    defaultWidth: 100,
    defaultHeight: 80,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="64" viewBox="0 0 80 64" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M70 12c-24-4-50 8-54 38"/>
      <path d="M30 48l-14 2-2-14"/>
    </svg>`
  },
  {
    id: 'arrow-straight',
    name: '极简科技直线标引',
    category: 'pointers',
    categoryName: '指示箭头与焦点',
    defaultFill: '#3d4451',
    defaultWidth: 90,
    defaultHeight: 60,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="72" height="48" viewBox="0 0 72 48" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="8" y1="24" x2="62" y2="24"/>
      <polyline points="46 12 62 24 46 36"/>
      <circle cx="8" cy="24" r="3.5" fill="currentColor"/>
    </svg>`
  },
  {
    id: 'callout-focus-ring',
    name: '核心焦点聚光光圈',
    category: 'pointers',
    categoryName: '指示箭头与焦点',
    defaultFill: '#f59e0b',
    defaultWidth: 100,
    defaultHeight: 100,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="6 4" stroke-linecap="round">
      <circle cx="32" cy="32" r="26"/>
      <circle cx="32" cy="32" r="8" fill="currentColor" opacity="0.6"/>
    </svg>`
  },
  {
    id: 'callout-pin-dot',
    name: '卖点定位锚点标',
    category: 'pointers',
    categoryName: '指示箭头与焦点',
    defaultFill: '#10b981',
    defaultWidth: 80,
    defaultHeight: 90,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="72" viewBox="0 0 64 72" fill="currentColor">
      <path d="M32 4C18.7 4 8 14.7 8 28c0 18 24 40 24 40s24-22 24-40c0-13.3-10.7-24-24-24zm0 33a9 9 0 110-18 9 9 0 010 18z"/>
    </svg>`
  },
  {
    id: 'callout-magnifier',
    name: '微观质感放大镜',
    category: 'pointers',
    categoryName: '指示箭头与焦点',
    defaultFill: '#82a1b9',
    defaultWidth: 90,
    defaultHeight: 90,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round">
      <circle cx="26" cy="26" r="18"/>
      <line x1="39" y1="39" x2="56" y2="56"/>
      <line x1="26" y1="18" x2="26" y2="34" stroke-width="3"/>
      <line x1="18" y1="26" x2="34" y2="26" stroke-width="3"/>
    </svg>`
  }
]
