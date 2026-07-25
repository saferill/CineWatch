'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service like PostHog
    console.error(error)
  }, [error])

  return (
    <div className="flex h-[80vh] flex-col items-center justify-center text-center px-4 space-y-6">
      <div className="flex size-20 items-center justify-center rounded-full bg-red-500/10">
        <AlertCircle className="size-10 text-red-500" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Oops! Terjadi Kesalahan.</h2>
        <p className="text-muted-foreground max-w-[500px] mx-auto">
          Kami gagal memuat data dari server (mungkin diblokir oleh jaringan atau server sedang sibuk).
          Silakan periksa koneksi internetmu dan coba lagi.
        </p>
      </div>

      <div className="flex gap-4">
        <Button onClick={() => window.location.reload()} variant="outline">
          Refresh Halaman
        </Button>
        <Button onClick={() => reset()}>
          Coba Muat Ulang
        </Button>
      </div>
    </div>
  )
}
