# TagGaze - 轻量级电商与社媒视觉排版工具

专注于“最后一公里转化”的极轻纯前端 Web 排版工具。支持 3:4 竖屏主画幅、营销文字防御性排版、防盗水印、高转化信任徽章及精准画质体积压缩导出。

## 🌟 核心特性

- **3:4 爆款画幅先行**：默认 3:4 竖屏（1200×1600 / 900×1200），兼容 1:1 与 16:9。
- **营销文案引擎**：Google Fonts (Bebas Neue, Anton, Montserrat 等) + 开源中文字体，支持文字描边、投影与底板色块。
- **全局防盗水印**：一键开启斜向对角全图平铺防盗或单点水印，自定义文案、透明度与角度。
- **高转化资产库**：内置 5 星好评、品质盾牌、包邮卡车等极简 SVG 徽章，支持上传自定义店铺 Logo。
- **智能体积压缩**：支持实时预估导出的 JPG / WebP 文件大小，提供“一键智能达标（二分法自动推算最佳画质）”。
- **多端响应式**：桌面端双侧栏高效操作，手机/平板小屏自动转为底部抽屉式面板，支持触控缩放。
- **纯本地极速隐私**：基于 IndexedDB 自动保存工程，零账号免登录，不上传任何用户底图到云端。

## 🛠️ 极轻技术栈

- **构建工具**: Vite 6
- **UI 框架**: Vue 3 (`<script setup>` + TypeScript)
- **渲染核心**: Konva.js
- **UI 样式**: Tailwind CSS (零运行时 CSS)
- **图标体系**: Lucide Icons
- **本地存储**: idb-keyval (< 1KB)

## 🚀 本地开发与构建

```bash
# 1. 安装依赖
npm install

# 2. 启动本地开发服务
npm run dev

# 3. 生产环境打包
npm run build
```

打包产物位于 `dist/` 目录。

## 🌐 部署指南

### Cloudflare Pages
1. 在 Cloudflare Pages 中连接本仓库。
2. 构建设置：
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
3. 根目录 `public/_headers` 已预置静态资源缓存策略。

### Vercel
1. 在 Vercel 中导入本仓库。
2. 根目录 `vercel.json` 已配置单页路由（SPA Rewrite）与缓存规则。
3. 一键部署即用。
