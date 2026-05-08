'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { toast } from 'sonner'

export function FeedbackForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setIsSending(true)
    const webhookUrl = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL

    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            embeds: [{
              title: "💬 FEEDBACK / LAPORAN BARU",
              description: message,
              color: 0x06b6d4,
              fields: [
                { name: "Halaman", value: window.location.href },
                { name: "Browser", value: navigator.userAgent.slice(0, 100) }
              ],
              timestamp: new Date().toISOString()
            }]
          })
        })
        setIsSuccess(true)
        setMessage('')
        setTimeout(() => {
          setIsSuccess(false)
          setIsOpen(false)
        }, 3000)
      } catch (error) {
        toast.error("Gagal mengirim laporan. Coba lagi nanti.")
      }
    } else {
      toast.error("Sistem laporan belum dikonfigurasi.")
    }
    setIsSending(false)
  }

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 left-4 sm:left-6 z-[90] size-12 sm:size-14 rounded-full bg-accent text-black shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform group"
      >
        <MessageSquare className="size-6" />
        <span className="absolute left-16 bg-black/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Lapor Masalah
        </span>
      </button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden p-8"
            >
              <VisuallyHidden>
                <h2>Formulir Laporan dan Feedback</h2>
              </VisuallyHidden>
              
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="size-6" />
              </button>

              {isSuccess ? (
                <div className="py-12 text-center space-y-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="size-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto"
                  >
                    <CheckCircle2 className="size-10" />
                  </motion.div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Berhasil Terkirim!</h2>
                  <p className="text-zinc-500 text-sm font-medium">Terima kasih atas masukannya. Laporan Anda sudah masuk ke admin.</p>
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Ada Masalah?</h2>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Kirimkan pesan atau laporan bug Anda</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tuliskan detail masalah atau saran Anda di sini..."
                      className="w-full h-40 bg-zinc-900 border border-white/5 rounded-2xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent/50 transition-colors resize-none text-sm"
                      required
                    />
                    
                    <Button 
                      type="submit" 
                      disabled={isSending || !message.trim()}
                      className="w-full h-14 rounded-2xl bg-white text-black hover:bg-zinc-200 font-black uppercase tracking-widest gap-2"
                    >
                      {isSending ? "Mengirim..." : (
                        <>
                          Kirim Laporan <Send className="size-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
