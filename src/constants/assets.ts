export interface SvgAssetItem {
  id: string
  name: string
  category: 'badge' | 'ribbon' | 'pointer'
  svg: string
  defaultFill: string
}

export const SVG_ASSETS: SvgAssetItem[] = [
  // 信任徽章
  {
    id: 'badge-5stars',
    name: '五星好评',
    category: 'badge',
    defaultFill: '#FBBF24',
    svg: `<svg viewBox="0 0 160 32" fill="currentColor">
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
    category: 'badge',
    defaultFill: '#10B981',
    svg: `<svg viewBox="0 0 64 64" fill="currentColor">
      <path d="M32 4L10 14v18c0 15.5 9.4 30 22 34 12.6-4 22-18.5 22-34V14L32 4zm-4 38L18 32l3.8-3.8 6.2 6.2 14.2-14.2 3.8 3.8L28 42z"/>
    </svg>`
  },
  {
    id: 'badge-shipping',
    name: '极速包邮',
    category: 'badge',
    defaultFill: '#3B82F6',
    svg: `<svg viewBox="0 0 64 64" fill="currentColor">
      <path d="M42 16H8a4 4 0 00-4 4v24h6a8 8 0 0016 0h12a8 8 0 0016 0h6V32l-10-16h-8zm-24 32a4 4 0 110-8 4 4 0 010 8zm30 0a4 4 0 110-8 4 4 0 010 8zm6-18h-8v-8h5.5l5.5 8z"/>
    </svg>`
  },
  {
    id: 'badge-hot',
    name: '爆款火焰',
    category: 'badge',
    defaultFill: '#EF4444',
    svg: `<svg viewBox="0 0 64 64" fill="currentColor">
      <path d="M36 6C36 6 24 18 24 30c0 4.4 2.1 8.3 5.4 10.8-1.4-2.5-2.1-5.3-2.1-8.3 0-6.1 4-12.5 8.7-16.5C40 20 48 28 48 38c0 9.9-8.1 18-18 18S12 47.9 12 38c0-10.5 6.8-21 16-26 0 0-4 8-4 16 0 2.2.4 4.3 1.1 6.2C23.8 32.4 23 30.3 23 28c0-8.8 6.7-18.2 13-22z"/>
    </svg>`
  },

  // 箭头与指示线
  {
    id: 'pointer-arrow-curved',
    name: '曲线手绘箭头',
    category: 'pointer',
    defaultFill: '#FBBF24',
    svg: `<svg viewBox="0 0 64 64" fill="currentColor">
      <path d="M52 14c-12-6-28-2-36 10-6 9-5 22 2 30l-4 4 16 2-2-16-4 4c-5-6-6-16-1-23 6-9 19-12 28-7l-5 5 18 2 2-18-6 7z"/>
    </svg>`
  },
  {
    id: 'pointer-circle',
    name: '手绘重点圈',
    category: 'pointer',
    defaultFill: '#EF4444',
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round">
      <path d="M32 10c14 0 24 8 24 20s-10 24-25 24C16 54 8 45 8 32c0-13 11-23 26-23 5 0 11 1 16 4"/>
    </svg>`
  }
]
