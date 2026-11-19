import type { CanvasDimensions } from '@/types'

export const CANVAS_PRESETS: CanvasDimensions[] = [
  {
    id: 'xhs-3-4-hd',
    name: '3:4 竖屏高清 (小红书/电商爆款首图)',
    platform: '小红书 / 电商爆款',
    ratio: '3:4',
    width: 1200,
    height: 1600,
    desc: '推荐：小红书、跨境电商爆款首图主流画幅'
  },
  {
    id: 'xhs-3-4-std',
    name: '3:4 快速标清 (Ozon 平台标准)',
    platform: 'Ozon / 快速出图',
    ratio: '3:4',
    width: 900,
    height: 1200,
    desc: '适配 Ozon 推荐画幅与极速文件体积控制'
  },
  {
    id: 'ecom-1-1-hd',
    name: '1:1 方形主图 (天猫/淘宝/京东/Amazon)',
    platform: '天猫 / 淘宝 / 京东',
    ratio: '1:1',
    width: 1000,
    height: 1000,
    desc: '国内与跨境电商通用正方形首图与搜索主图'
  },
  {
    id: 'ecom-1-1-tmall',
    name: '1:1 标清方图 (天猫 800×800 规范)',
    platform: '天猫 / 淘宝',
    ratio: '1:1',
    width: 800,
    height: 800,
    desc: '天猫官方建议店铺主图标准'
  },
  {
    id: 'tiktok-9-16',
    name: '9:16 全屏竖版 (抖音/TikTok/视频号)',
    platform: '抖音 / TikTok / Reels',
    ratio: '9:16',
    width: 1080,
    height: 1920,
    desc: '短视频全屏挂车图、Reels 与视频号封面'
  },
  {
    id: 'video-16-9',
    name: '16:9 横版宽屏 (B站/YouTube/横幅)',
    platform: 'B站 / YouTube / 轮播图',
    ratio: '16:9',
    width: 1920,
    height: 1080,
    desc: '电商首页轮播横幅与视频主图封面'
  },
  {
    id: 'classic-4-3',
    name: '4:3 经典画幅 (商品卡片/独立站)',
    platform: '独立站 / 平板展示',
    ratio: '4:3',
    width: 1200,
    height: 900,
    desc: '经典商用比例与多图并列排版'
  }
]
