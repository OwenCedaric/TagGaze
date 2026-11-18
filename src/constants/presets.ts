import type { CanvasDimensions } from '@/types'

export const CANVAS_PRESETS: CanvasDimensions[] = [
  {
    name: '3:4 竖屏 (小红书/电商爆款)',
    ratio: '3:4',
    width: 1200,
    height: 1600
  },
  {
    name: '3:4 快速标清',
    ratio: '3:4',
    width: 900,
    height: 1200
  },
  {
    name: '1:1 方形 (电商主图/Ozon)',
    ratio: '1:1',
    width: 1000,
    height: 1000
  },
  {
    name: '16:9 横版 (视频/展示封面)',
    ratio: '16:9',
    width: 1920,
    height: 1080
  }
]
