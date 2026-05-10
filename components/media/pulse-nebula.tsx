'use client'

import React, { useEffect, useRef } from 'react'

export function PulseNebula() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const userImg = new Image()
    userImg.src = '/gource/data/user.png'
    const fileImg = new Image()
    fileImg.src = '/gource/data/file.png'
    const beamImg = new Image()
    beamImg.src = '/gource/data/beam.png'

    let animationFrameId: number
    const beams: any[] = []
    const nodeCount = 12
    const nodes: any[] = []

    // Initialize nodes (the "files" in Gource style)
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        id: i
      })
    }

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    window.addEventListener('resize', resize)
    resize()

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Update and draw nodes (Files)
      nodes.forEach(node => {
        node.x += node.vx
        node.y += node.vy

        if (node.x < 10 || node.x > canvas.width - 10) node.vx *= -1
        if (node.y < 10 || node.y > canvas.height - 10) node.vy *= -1

        if (fileImg.complete) {
          ctx.globalAlpha = 0.6
          ctx.drawImage(fileImg, node.x - 6, node.y - 6, 12, 12)
          ctx.globalAlpha = 1.0
        }
      })

      // Simulate "Activity Beams" (Gource style)
      if (Math.random() < 0.03) {
        const targetNode = nodes[Math.floor(Math.random() * nodes.length)]
        beams.push({
          progress: 0,
          targetNode,
          userId: Math.floor(Math.random() * 5)
        })
      }

      // Draw User (Central Hub or floating users)
      if (userImg.complete) {
        ctx.drawImage(userImg, canvas.width / 2 - 12, canvas.height / 2 - 12, 24, 24)
      }

      beams.forEach((b, index) => {
        b.progress += 0.03
        
        if (beamImg.complete) {
           const startX = canvas.width / 2
           const startY = canvas.height / 2
           const endX = b.targetNode.x
           const endY = b.targetNode.y
           
           // Draw Beam
           ctx.save()
           const dx = endX - startX
           const dy = endY - startY
           const angle = Math.atan2(dy, dx)
           const dist = Math.sqrt(dx*dx + dy*dy) * b.progress
           
           ctx.translate(startX, startY)
           ctx.rotate(angle)
           ctx.globalAlpha = 1 - b.progress
           ctx.drawImage(beamImg, 0, -2, dist, 4)
           ctx.restore()
        }

        if (b.progress >= 1) {
          beams.splice(index, 1)
        }
      })

      animationFrameId = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-60">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}
