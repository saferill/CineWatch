'use client'

import React, { useState } from 'react'
import { IconAlertCircle, IconCheck, IconLoader2 } from '@tabler/icons-react'
import { toast } from 'sonner'

interface ReportButtonProps {
  mediaTitle: string
  mediaId: string
  mediaType: string
  episode?: string | number
  serverName?: string
}

export function ReportButton({ mediaTitle, mediaId, mediaType, episode, serverName }: ReportButtonProps) {
  const [loading, setLoading] = useState(false)
  const [reported, setReported] = useState(false)

  const handleReport = async () => {
    if (reported) {
      toast.info('Kamu sudah melaporkan link ini.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaTitle,
          mediaId,
          mediaType,
          episode,
          serverName,
          reason: 'Link Mati / Error Playback',
          url: window.location.href,
          userAgent: navigator.userAgent
        })
      })

      if (res.ok) {
        setReported(true)
        toast.success('Laporan berhasil dikirim! Tim kami akan segera memperbaikinya.')
      } else {
        throw new Error()
      }
    } catch (error) {
      toast.error('Gagal mengirim laporan. Coba lagi nanti.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleReport}
      disabled={loading || reported}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
        ${reported 
          ? 'bg-green-500/10 text-green-500 border border-green-500/20 cursor-default' 
          : 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white'
        }
      `}
    >
      {loading ? (
        <IconLoader2 className="w-3.5 h-3.5 animate-spin" />
      ) : reported ? (
        <IconCheck className="w-3.5 h-3.5" />
      ) : (
        <IconAlertCircle className="w-3.5 h-3.5" />
      )}
      {reported ? 'Laporan Terkirim' : 'Lapor Link Mati'}
    </button>
  )
}
