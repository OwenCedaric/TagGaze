export interface FontItem {
  name: string
  family: string
  category: 'zh-serif' | 'zh-sans' | 'en'
  previewText: string
}

export const FONTS: FontItem[] = [
  // Chronicle 核心宋体/衬线 (重读、强调、人文质感)
  {
    name: '思源宋体 (典雅/高端主标题)',
    family: "'Noto Serif SC', 'Songti SC', Georgia, serif",
    category: 'zh-serif',
    previewText: '甄选好物 尊享私域'
  },
  // Chronicle 核心黑体/无衬线 (流动、清晰、正文描述)
  {
    name: '思源黑体 (极简现代/卖点正文)',
    family: "'Noto Sans SC', system-ui, sans-serif",
    category: 'zh-sans',
    previewText: '现货包邮 7天无理由退换'
  },
  // 英文营销高点击标题字体
  {
    name: 'Bebas Neue (粗黑窄体/促销折扣)',
    family: "'Bebas Neue', sans-serif",
    category: 'en',
    previewText: 'LIMITED EDITION 50% OFF'
  },
  {
    name: 'Montserrat (精致现代/价格规格)',
    family: "'Montserrat', sans-serif",
    category: 'en',
    previewText: 'Autumn Winter 2026'
  },
  {
    name: 'Anton (硬核冲击大字)',
    family: "'Anton', sans-serif",
    category: 'en',
    previewText: 'NEW ARRIVAL'
  },
  {
    name: 'Oswald (商务紧凑大标题)',
    family: "'Oswald', sans-serif",
    category: 'en',
    previewText: 'PREMIUM QUALITY'
  }
]

// 电商高频排版文字层级规范 (Multi-tier Typography System)
export interface TextTier {
  id: 'hero' | 'subtitle' | 'price' | 'body'
  label: string
  desc: string
  defaultText: string
  fontFamily: string
  fontSize: number
  fontWeight: string
  fill: string
  backgroundColor?: string
  backgroundPadding?: number
  backgroundRadius?: number
  stroke?: string
  strokeWidth?: number
  align: 'left' | 'center' | 'right'
  defaultY: number
}

export const TEXT_TIERS: TextTier[] = [
  {
    id: 'hero',
    label: '营销大标题',
    desc: '视觉主锚点，吸睛转化',
    defaultText: '秋季新品 · 旗舰质感',
    fontFamily: "'Noto Serif SC', serif",
    fontSize: 56,
    fontWeight: '700',
    fill: '#3d4451', // Chronicle Light Primary Ink
    align: 'center',
    defaultY: 130
  },
  {
    id: 'subtitle',
    label: '卖点提炼 / 副标题',
    desc: '核心功效与买点提炼',
    defaultText: '天然植萃 · 敏感肌专研 · 7天深层修护',
    fontFamily: "'Noto Sans SC', sans-serif",
    fontSize: 30,
    fontWeight: '400',
    fill: '#757d8a', // Chronicle Light Secondary Ink
    align: 'center',
    defaultY: 220
  },
  {
    id: 'price',
    label: '营销利益 / 促销标签条',
    desc: '高对比度营销利益胶囊',
    defaultText: '限时买一送一 · 现货顺丰速发',
    fontFamily: "'Montserrat', 'Noto Sans SC', sans-serif",
    fontSize: 40,
    fontWeight: '700',
    fill: '#ffffff',
    backgroundColor: '#3d4451',
    backgroundPadding: 16,
    backgroundRadius: 6,
    align: 'center',
    defaultY: 1320
  },
  {
    id: 'body',
    label: '正文参数 / 保障说明',
    desc: '规格、净含量、服务背书',
    defaultText: '净含量 100ml / 官方正品保障 / 破损包赔',
    fontFamily: "'Noto Sans SC', sans-serif",
    fontSize: 22,
    fontWeight: '300',
    fill: '#757d8a',
    align: 'center',
    defaultY: 1440
  }
]

// 电商与社媒高转化营销利益胶囊规范 (Promo Benefit Capsules - 杜绝货币符号)
export interface PromoBenefitPreset {
  id: string
  title: string
  badgeText: string // 左侧徽标
  benefitText: string // 右侧核心利益
  fullText: string
  fill: string
  backgroundColor: string
  shadowColor?: string
  backgroundRadius?: number
}

export const PROMO_BENEFIT_PRESETS: PromoBenefitPreset[] = [
  {
    id: 'b-buy1get1',
    title: '买一赠一',
    badgeText: '限时特惠',
    benefitText: '买一赠一 · 现货速发',
    fullText: '【限时特惠】买一赠一 · 现货速发',
    fill: '#ffffff',
    backgroundColor: '#e11d48', // 大促红
    shadowColor: 'rgba(225, 29, 72, 0.35)',
    backgroundRadius: 6
  },
  {
    id: 'b-halfprice',
    title: '第2件半价',
    badgeText: '今日专享',
    benefitText: '第二件半价 · 顺丰直达',
    fullText: '【今日专享】第二件半价 · 顺丰直达',
    fill: '#ffffff',
    backgroundColor: '#f59e0b', // 活力橙
    shadowColor: 'rgba(245, 158, 11, 0.35)',
    backgroundRadius: 6
  },
  {
    id: 'b-directsale',
    title: '直降立减',
    badgeText: '官方大促',
    benefitText: '直降立减 · 赠正装替换装',
    fullText: '【官方大促】直降立减 · 赠正装替换装',
    fill: '#ffffff',
    backgroundColor: '#3d4451', // 高级深灰
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    backgroundRadius: 6
  },
  {
    id: 'b-freemail',
    title: '顺丰正品',
    badgeText: '品质承诺',
    benefitText: '顺丰包邮 · 7天无理由退换',
    fullText: '【品质承诺】顺丰包邮 · 7天无理由退换',
    fill: '#ffffff',
    backgroundColor: '#10b981', // 信任绿
    shadowColor: 'rgba(16, 185, 129, 0.3)',
    backgroundRadius: 6
  },
  {
    id: 'b-giftpack',
    title: '买大送小',
    badgeText: '超值加赠',
    benefitText: '买大送小 · 随单附赠体验装',
    fullText: '【超值加赠】买大送小 · 随单附赠体验装',
    fill: '#ffffff',
    backgroundColor: '#82a1b9', // 冰川蓝
    shadowColor: 'rgba(130, 161, 185, 0.3)',
    backgroundRadius: 6
  },
  {
    id: 'b-hotseed',
    title: '社媒种草',
    badgeText: '小红书精选',
    benefitText: '博主实测力荐 · 闭眼入不踩雷',
    fullText: '【小红书精选】博主实测力荐 · 闭眼入不踩雷',
    fill: '#ffffff',
    backgroundColor: '#e11d48',
    shadowColor: 'rgba(225, 29, 72, 0.35)',
    backgroundRadius: 6
  }
]

// Chronicle 浅色调风格文本预设
export const TEXT_PRESETS = [
  {
    name: '典雅墨字微光 (Chronicle Serif)',
    fontFamily: "'Noto Serif SC', serif",
    fill: '#3d4451',
    stroke: undefined,
    strokeWidth: 0,
    backgroundColor: '#ffffff',
    backgroundPadding: 14,
    backgroundRadius: 4,
    shadowColor: 'rgba(61, 68, 81, 0.12)',
    shadowBlur: 14,
    shadowOffsetY: 6,
    fontWeight: '700'
  },
  {
    name: '深灰高反差底条 (Dark Inset)',
    fontFamily: "'Noto Sans SC', sans-serif",
    fill: '#ffffff',
    backgroundColor: '#3d4451',
    backgroundPadding: 14,
    backgroundRadius: 6,
    shadowColor: 'rgba(0, 0, 0, 0.18)',
    shadowBlur: 10,
    shadowOffsetY: 4,
    fontWeight: '600'
  },
  {
    name: '冰川蓝焦点 (Sole Accent Focus)',
    fontFamily: "'Bebas Neue', sans-serif",
    fill: '#82a1b9',
    stroke: '#ffffff',
    strokeWidth: 4,
    shadowColor: 'rgba(130, 161, 185, 0.25)',
    shadowBlur: 12,
    shadowOffsetY: 4,
    fontWeight: '900'
  },
  {
    name: '极简白纸清描 (Subtle Border)',
    fontFamily: "'Noto Sans SC', sans-serif",
    fill: '#3d4451',
    backgroundColor: '#fbf9f6',
    stroke: '#3d4451',
    strokeWidth: 1,
    backgroundPadding: 12,
    backgroundRadius: 2,
    fontWeight: '500'
  }
]
