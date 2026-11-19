import type { LayoutTemplate } from '@/types'
import { SVG_ASSETS } from './assets'

export const LAYOUT_TEMPLATES: LayoutTemplate[] = [
  {
    id: 'ecommerce-sale',
    name: '电商爆款大促风',
    category: 'ecommerce',
    tag: '电商大促 / 爆款转化',
    description: '营销大标题 + 券后价格条 + 五星好评与正品双徽章，高点击强转化',
    presetRatio: '3:4',
    previewColor: '#e11d48',
    elements: [
      {
        type: 'text',
        text: '秋季新品 · 旗舰质感',
        fontFamily: "'Noto Serif SC', serif",
        fontSize: 56,
        fontWeight: '700',
        fill: '#3d4451',
        align: 'center',
        y: 130
      },
      {
        type: 'text',
        text: '大促直降 · 限时加赠正装替换装',
        fontFamily: "'Montserrat', 'Noto Sans SC', sans-serif",
        fontSize: 38,
        fontWeight: '700',
        fill: '#ffffff',
        backgroundColor: '#3d4451',
        backgroundPadding: 16,
        backgroundRadius: 6,
        align: 'center',
        y: 1320
      },
      {
        type: 'svg',
        svgContent: SVG_ASSETS.find((a) => a.id === 'badge-5stars')?.svg || '',
        fill: '#82a1b9',
        width: 200,
        height: 40,
        x: 500,
        y: 1180
      },
      {
        type: 'svg',
        svgContent: SVG_ASSETS.find((a) => a.id === 'badge-shield')?.svg || '',
        fill: '#e11d48',
        width: 100,
        height: 100,
        x: 240,
        y: 640
      }
    ]
  },
  {
    id: 'social-beauty',
    name: '小红书美妆种草风',
    category: 'social',
    tag: '小红书 / 博主种草',
    description: '空瓶记人文标题 + 亲测推荐胶囊标签 + 极简手绘重点圈',
    presetRatio: '3:4',
    previewColor: '#10b981',
    elements: [
      {
        type: 'text',
        text: '换季本命 · 空瓶无限回购',
        fontFamily: "'Noto Serif SC', serif",
        fontSize: 52,
        fontWeight: '700',
        fill: '#3d4451',
        align: 'center',
        y: 130
      },
      {
        type: 'text',
        text: '天然植萃 · 敏感肌专研 · 7天深层修护',
        fontFamily: "'Noto Sans SC', sans-serif",
        fontSize: 28,
        fontWeight: '400',
        fill: '#757d8a',
        align: 'center',
        y: 220
      },
      {
        type: 'svg',
        svgContent: SVG_ASSETS.find((a) => a.id === 'tag-recommend')?.svg || '',
        fill: '#10b981',
        width: 160,
        height: 50,
        x: 520,
        y: 1220
      },
      {
        type: 'svg',
        svgContent: SVG_ASSETS.find((a) => a.id === 'pointer-circle')?.svg || '',
        fill: '#e11d48',
        width: 120,
        height: 120,
        x: 420,
        y: 720
      }
    ]
  },
  {
    id: 'flash-sale',
    name: '爆款秒杀直降风',
    category: 'promo',
    tag: '限时秒杀 / 1:1 主图',
    description: '高反差冲击大字 + HOT 爆款火热角标 + 极速顺丰包邮',
    presetRatio: '1:1',
    previewColor: '#f97316',
    elements: [
      {
        type: 'text',
        text: 'LIMITED TIME 50% OFF',
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 64,
        fontWeight: '900',
        fill: '#e11d48',
        align: 'center',
        y: 90
      },
      {
        type: 'text',
        text: '限时秒杀 · 买一赠一 (限今日)',
        fontFamily: "'Noto Sans SC', sans-serif",
        fontSize: 34,
        fontWeight: '700',
        fill: '#ffffff',
        backgroundColor: '#e11d48',
        backgroundPadding: 14,
        backgroundRadius: 4,
        align: 'center',
        y: 840
      },
      {
        type: 'svg',
        svgContent: SVG_ASSETS.find((a) => a.id === 'badge-hot')?.svg || '',
        fill: '#e11d48',
        width: 110,
        height: 110,
        x: 820,
        y: 80
      },
      {
        type: 'svg',
        svgContent: SVG_ASSETS.find((a) => a.id === 'badge-shipping')?.svg || '',
        fill: '#82a1b9',
        width: 100,
        height: 100,
        x: 120,
        y: 820
      }
    ]
  },
  {
    id: 'minimal-clean',
    name: '自然植萃极简风',
    category: 'minimal',
    tag: '极简轻奢 / 典雅高级',
    description: '克制排版留白 + 官方认证星标 + 规格参数条，凸显高端质感',
    presetRatio: '3:4',
    previewColor: '#82a1b9',
    elements: [
      {
        type: 'text',
        text: 'N° 07 BOTANICAL ESSENCE',
        fontFamily: "'Noto Serif SC', serif",
        fontSize: 48,
        fontWeight: '600',
        fill: '#3d4451',
        align: 'center',
        letterSpacing: 2,
        y: 130
      },
      {
        type: 'text',
        text: '100 ML · 3.4 FL.OZ · 官方旗舰正品保障',
        fontFamily: "'Noto Sans SC', sans-serif",
        fontSize: 22,
        fontWeight: '300',
        fill: '#757d8a',
        align: 'center',
        y: 1440
      },
      {
        type: 'svg',
        svgContent: SVG_ASSETS.find((a) => a.id === 'badge-verified')?.svg || '',
        fill: '#82a1b9',
        width: 90,
        height: 90,
        x: 555,
        y: 1260
      }
    ]
  }
]
