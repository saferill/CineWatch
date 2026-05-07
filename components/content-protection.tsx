'use client'

import { useEffect } from 'react'

export function ContentProtection() {
  useEffect(() => {
    // 1. Frame Busting (Prevent site from being framed)
    if (window.self !== window.top) {
      window.top!.location.href = window.self.location.href;
    }

    // 2. Prevent right-click on specific elements if needed
    const handleContextMenu = (e: MouseEvent) => {
       // Allow right click on inputs and textareas
       const target = e.target as HTMLElement
       if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
       e.preventDefault()
    }

    document.addEventListener('contextmenu', handleContextMenu)
    return () => document.removeEventListener('contextmenu', handleContextMenu)
  }, [])

  return null
}
