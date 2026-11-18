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
