/**
 * Generates an elegant, high-resolution (1200x1600) studio e-commerce mock hero image on an offscreen canvas
 * Optimized for Light Theme editorial luxury aesthetics (warm off-white studio with soft ambient lighting).
 */
export function generateDemoHeroImage(): string {
  const width = 1200
  const height = 1600
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  // 1. Airy, warm studio off-white backdrop gradient
  const grad = ctx.createRadialGradient(width / 2, height * 0.45, 80, width / 2, height / 2, 950)
  grad.addColorStop(0, '#ffffff')
  grad.addColorStop(0.55, '#f5f2ed')
  grad.addColorStop(1, '#e8e2d8')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, width, height)

  // 2. Subtle architectural pedestal / studio podium
  const podiumY = height * 0.72
  // Ambient soft shadow
  const shadowGrad = ctx.createRadialGradient(width / 2, podiumY + 28, 40, width / 2, podiumY + 28, 380)
  shadowGrad.addColorStop(0, 'rgba(61, 68, 81, 0.18)')
  shadowGrad.addColorStop(0.6, 'rgba(61, 68, 81, 0.05)')
  shadowGrad.addColorStop(1, 'rgba(61, 68, 81, 0)')
  ctx.fillStyle = shadowGrad
  ctx.beginPath()
  ctx.ellipse(width / 2, podiumY + 28, 380, 48, 0, 0, Math.PI * 2)
  ctx.fill()

  // Podium stone surface
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.ellipse(width / 2, podiumY, 340, 42, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(61, 68, 81, 0.12)'
  ctx.lineWidth = 1.5
  ctx.stroke()

  // 3. E-commerce Hero Product Silhouette (Minimalist Luxury Essence Bottle)
  const bottleW = 280
  const bottleH = 440
  const bottleX = (width - bottleW) / 2
  const bottleY = podiumY - bottleH + 15

  // Bottle Body Glow & Shadow
  ctx.save()
  ctx.shadowColor = 'rgba(61, 68, 81, 0.12)'
  ctx.shadowBlur = 32
  ctx.shadowOffsetY = 12

  // Frosted bottle gradient
  const glassGrad = ctx.createLinearGradient(bottleX, bottleY, bottleX + bottleW, bottleY + bottleH)
  glassGrad.addColorStop(0, '#f9f8f6')
  glassGrad.addColorStop(0.2, '#ffffff')
  glassGrad.addColorStop(0.7, '#ede8e1')
  glassGrad.addColorStop(1, '#dfd8cc')
  ctx.fillStyle = glassGrad
  ctx.beginPath()
  ctx.roundRect(bottleX, bottleY + 70, bottleW, bottleH - 70, 36)
  ctx.fill()
  ctx.strokeStyle = 'rgba(61, 68, 81, 0.18)'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.restore()

  // Bottle Cap (Brushed Slate Accent)
  const capW = 120
  const capH = 85
  const capX = (width - capW) / 2
  const capY = bottleY
  const capGrad = ctx.createLinearGradient(capX, capY, capX + capW, capY)
  capGrad.addColorStop(0, '#757d8a')
  capGrad.addColorStop(0.5, '#9cb4cd')
  capGrad.addColorStop(1, '#63798e')
  ctx.fillStyle = capGrad
  ctx.beginPath()
  ctx.roundRect(capX, capY, capW, capH, 12)
  ctx.fill()

  // Bottle Label Area
  const labelW = 180
  const labelH = 160
  const labelX = (width - labelW) / 2
  const labelY = bottleY + 160
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.roundRect(labelX, labelY, labelW, labelH, 8)
  ctx.fill()
  ctx.strokeStyle = 'rgba(61, 68, 81, 0.14)'
  ctx.lineWidth = 1.2
  ctx.stroke()

  // Label text in Chronicle Serif & Sans
  ctx.fillStyle = '#3d4451'
  ctx.font = '600 22px "Noto Serif SC", serif'
  ctx.textAlign = 'center'
  ctx.fillText('N° 07 ESSENCE', width / 2, labelY + 65)

  ctx.fillStyle = '#757d8a'
  ctx.font = '300 13px "Noto Sans SC", sans-serif'
  ctx.fillText('STUDIO HERO EDITION', width / 2, labelY + 95)
  ctx.fillText('100 ML · 3.4 FL.OZ', width / 2, labelY + 120)

  // Floating geometric aesthetic ring
  ctx.strokeStyle = 'rgba(130, 161, 185, 0.22)'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.arc(width / 2, height * 0.44, 420, 0, Math.PI * 2)
  ctx.stroke()

  return canvas.toDataURL('image/jpeg', 0.92)
}

/**
 * Generates a pair of high-resolution demo images for Split Screen Comparison (Before & After)
 */
export function generateDemoSplitImages(): { imageA: string; imageB: string } {
  const width = 800
  const height = 1200

  // 1. Generate Image A (Before)
  const canvasA = document.createElement('canvas')
  canvasA.width = width
  canvasA.height = height
  const ctxA = canvasA.getContext('2d')
  if (ctxA) {
    // Backdrop: Muted warm gray
    const gradA = ctxA.createLinearGradient(0, 0, 0, height)
    gradA.addColorStop(0, '#e5e1da')
    gradA.addColorStop(1, '#c9c2b5')
    ctxA.fillStyle = gradA
    ctxA.fillRect(0, 0, width, height)

    // Center product silhouette (matte / pre-treatment)
    ctxA.fillStyle = 'rgba(61, 68, 81, 0.12)'
    ctxA.beginPath()
    ctxA.ellipse(width / 2, height * 0.72, 220, 36, 0, 0, Math.PI * 2)
    ctxA.fill()

    ctxA.fillStyle = '#b8af9f'
    ctxA.beginPath()
    ctxA.roundRect(width / 2 - 120, height * 0.35, 240, 380, 24)
    ctxA.fill()

    // Title / Badge
    ctxA.fillStyle = 'rgba(61, 68, 81, 0.75)'
    ctxA.font = 'bold 36px "Noto Sans SC", sans-serif'
    ctxA.textAlign = 'center'
    ctxA.fillText('BEFORE', width / 2, height * 0.22)
    ctxA.font = '20px "Noto Sans SC", sans-serif'
    ctxA.fillStyle = 'rgba(61, 68, 81, 0.55)'
    ctxA.fillText('使用前 · 暗沉粗糙干燥', width / 2, height * 0.26)
  }

  // 2. Generate Image B (After)
  const canvasB = document.createElement('canvas')
  canvasB.width = width
  canvasB.height = height
  const ctxB = canvasB.getContext('2d')
  if (ctxB) {
    // Backdrop: Bright luminous glowing gradient
    const gradB = ctxB.createRadialGradient(width / 2, height * 0.45, 60, width / 2, height * 0.5, 700)
    gradB.addColorStop(0, '#ffffff')
    gradB.addColorStop(0.6, '#f1f5f9')
    gradB.addColorStop(1, '#dbeafe')
    ctxB.fillStyle = gradB
    ctxB.fillRect(0, 0, width, height)

    // Center product silhouette (glowing / luminous essence)
    ctxB.shadowColor = 'rgba(56, 189, 248, 0.35)'
    ctxB.shadowBlur = 40
    ctxB.fillStyle = '#ffffff'
    ctxB.beginPath()
    ctxB.roundRect(width / 2 - 120, height * 0.35, 240, 380, 24)
    ctxB.fill()
    ctxB.strokeStyle = '#38bdf8'
    ctxB.lineWidth = 3
    ctxB.stroke()

    // Title / Badge
    ctxB.shadowBlur = 0
    ctxB.fillStyle = '#0284c7'
    ctxB.font = 'bold 36px "Noto Sans SC", sans-serif'
    ctxB.textAlign = 'center'
    ctxB.fillText('AFTER', width / 2, height * 0.22)
    ctxB.font = '20px "Noto Sans SC", sans-serif'
    ctxB.fillStyle = '#0369a1'
    ctxB.fillText('使用后 · 水光透亮细嫩', width / 2, height * 0.26)
  }

  return {
    imageA: canvasA.toDataURL('image/jpeg', 0.9),
    imageB: canvasB.toDataURL('image/jpeg', 0.9)
  }
}
