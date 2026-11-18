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
    label: '价格 / 促销信息条',
    desc: '高对比度价格信息条',
    defaultText: '券后 ¥199 起  限时赠正装替换装',
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
