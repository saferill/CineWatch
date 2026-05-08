import React, { useState } from 'react'
import { Mail, LogIn, Globe } from 'lucide-react'
import { Icons } from '@/components/icons'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function AuthModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      }
    })

    if (error) {
      console.error('Login Error:', error.message)
      toast.error(error.message)
    } else {
      toast.success('Magic link sent! Check your email.')
      onClose()
    }
    setLoading(false)
  }

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-zinc-950 border-white/10 rounded-[2.5rem] p-8 shadow-[0_0_100px_rgba(0,0,0,1)] z-[9999]">
        <DialogHeader className="text-center">
          <div className="size-16 bg-accent/20 text-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LogIn className="size-8" />
          </div>
          <DialogTitle className="text-3xl font-black text-white uppercase tracking-tighter mb-2">
            Welcome Back
          </DialogTitle>
          <DialogDescription className="text-zinc-500 text-xs font-bold uppercase tracking-widest px-4">
            Sign in to sync your favorites across all devices
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Google Login Hidden Temporarily for Testing */}
          {/* 
          <Button 
            variant="outline" 
            className="w-full h-14 rounded-2xl bg-white/5 border-white/10 text-white hover:bg-white hover:text-black font-bold gap-3 transition-all duration-300"
            onClick={() => handleOAuthLogin('google')}
          >
            <Globe className="size-5" />
            Continue with Google
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/5"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zinc-950 px-4 text-zinc-600 font-bold tracking-widest">Or email</span>
            </div>
          </div>
          */}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-500" />
              <input
                type="email"
                placeholder="name@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white focus:outline-none focus:border-accent/50 transition-colors text-sm"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-accent text-black hover:bg-accent/80 font-black uppercase tracking-widest"
            >
              {loading ? "Sending..." : "Send Magic Link"}
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
          By continuing, you agree to CineWatch Terms of Service
        </p>
      </DialogContent>
    </Dialog>
  )
}

