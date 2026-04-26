'use client'

import { useEffect } from 'react'

export function AntiInspect() {
  useEffect(() => {
    // Only run this protection in production so it doesn't annoy us during development
    if (process.env.NODE_ENV !== 'production') {
      console.log('Anti-Inspect disabled in development mode.')
      return
    }

    // 1. Matikan Klik Kanan (Context Menu)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }

    // 2. Matikan Shortcut Keyboard untuk Inspect Element
    const handleKeyDown = (e: KeyboardEvent) => {
      // Mencegah F12
      if (e.key === 'F12') {
        e.preventDefault()
      }
      
      // Mencegah Ctrl+Shift+I (Inspect), Ctrl+Shift+J (Console), Ctrl+Shift+C (Element)
      if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) {
        e.preventDefault()
      }
      
      // Mencegah Ctrl+U (View Source)
      if (e.ctrlKey && e.key.toUpperCase() === 'U') {
        e.preventDefault()
      }
    }

    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)

    // 3. Sistem Deteksi "Debugger Trap" & Penghancuran Halaman
    const detectDevTools = setInterval(() => {
      const start = performance.now()
      
      // Statement ini akan membuat browser PAUSE jika Inspect Element terbuka
      // eslint-disable-next-line no-debugger
      debugger

      const end = performance.now()
      
      // Jika butuh lebih dari 100ms untuk mengeksekusi 'debugger', berarti DevTools sedang terbuka dan menahan script!
      if (end - start > 100) {
        // HANCURKAN HALAMAN DAN TAMPILKAN ERROR
        document.body.innerHTML = `
          <div style="background-color: black; color: #ff3333; height: 100vh; width: 100vw; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: monospace; text-align: center; padding: 2rem; position: fixed; top: 0; left: 0; z-index: 999999;">
            <h1 style="font-size: 3rem; margin-bottom: 1rem; border-bottom: 2px solid #ff3333; padding-bottom: 1rem;">🚨 FATAL ERROR 🚨</h1>
            <p style="font-size: 1.5rem; line-height: 1.8;">UNAUTHORIZED ACCESS DETECTED.</p>
            <p style="font-size: 1.2rem; margin-top: 1rem; color: #888;">Developer tools / Inspect Element is strictly prohibited on this server.</p>
            <p style="font-size: 1rem; margin-top: 2rem; color: #555;">Session Terminated. IP Logged.</p>
          </div>
        `
        // Opsional: Membuat infinite loop agar browser mereka crash/nge-hang
        let x = 0
        while (true) {
          x += 1
          if (x > 100000000) x = 0 // cegah optimasi compiler
        }
      }
    }, 1000)

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
      clearInterval(detectDevTools)
    }
  }, [])

  return null
}
