export interface FontItem {
  name: string
  family: string
  category: 'zh' | 'en'
  previewText: string
}

export const FONTS: FontItem[] = [
  // 英文营销字体 (来自 Google Fonts，高转化标题首选)
  {
    name: 'Bebas Neue (粗黑窄体)',
    family: "'Bebas Neue', sans-serif",
    category: 'en',
    previewText: 'SALE 50% OFF'
  },
  {
    name: 'Anton (硬核冲击力)',
    family: "'Anton', sans-serif",
    category: 'en',
    previewText: 'HOT DEAL'
  },
  {
    name: 'Montserrat (极简现代)',
    family: "'Montserrat', sans-serif",
    category: 'en',
    previewText: 'New Collection'
  },
  {
    name: 'Oswald (商务干练)',
    family: "'Oswald', sans-serif",
    category: 'en',
    previewText: 'PREMIUM QUALITY'
  },
  {
    name: 'Poppins (亲和圆润)',
    family: "'Poppins', sans-serif",
    category: 'en',
    previewText: 'Best Choice'
  },

  // 中文字体 (开源无版权)
  {
    name: '思源黑体 (通用高清)',
    family: "'Noto Sans SC', system-ui, sans-serif",
    category: 'zh',
    previewText: '热销爆款 直降特惠'
  },
  {
    name: '系统苹方/黑体',
    family: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    category: 'zh',
    previewText: '品质好物 强烈推荐'
  }
]

export const TEXT_PRESETS = [
  {
    name: '醒目黄黑标签',
    fill: '#FFFFFF',
    backgroundColor: '#000000',
    backgroundPadding: 16,
    backgroundRadius: 8,
    stroke: '#FBBF24',
    strokeWidth: 2,
    fontWeight: 'bold'
  },
  {
    name: '爆款促销红',
    fill: '#FFFFFF',
    backgroundColor: '#EF4444',
    backgroundPadding: 14,
    backgroundRadius: 6,
    shadowColor: 'rgba(239, 68, 68, 0.4)',
    shadowBlur: 12,
    shadowOffsetY: 6,
    fontWeight: 'bold'
  },
  {
    name: '品质白字黑影',
    fill: '#FFFFFF',
    stroke: '#000000',
    strokeWidth: 4,
    shadowColor: 'rgba(0, 0, 0, 0.7)',
    shadowBlur: 10,
    shadowOffsetY: 6,
    fontWeight: '900'
  },
  {
    name: '极简白底黑字',
    fill: '#171717',
    backgroundColor: '#FFFFFF',
    backgroundPadding: 12,
    backgroundRadius: 4,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowBlur: 8,
    shadowOffsetY: 4,
    fontWeight: '600'
  }
]
