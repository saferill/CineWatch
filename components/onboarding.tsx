'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play } from 'lucide-react'

import { Icons } from '@/components/icons'
import { siteConfig } from '@/config/site'

export const Onboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    // Check if user has already seen onboarding
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding')
    if (!hasSeenOnboarding) {
      setShowOnboarding(true)
    }
  }, [])

  const handleFinish = () => {
    localStorage.setItem('hasSeenOnboarding', 'true')
    setShowOnboarding(false)
  }

  const nextStep = () => {
    if (step < 1) {
      setStep(step + 1)
    } else {
      handleFinish()
    }
  }

  if (!showOnboarding) return null

  return (
    <AnimatePresence>
      {showOnboarding && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: 'easeInOut' } }}
        >
          {/* Decorative background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full bg-cyan-500/20 blur-[120px] pointer-events-none" />

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step0"
                className="flex flex-col items-center justify-center text-center px-4"
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.1, y: -20 }}
                transition={{ duration: 0.6 }}
              >
                <div className="mb-8 relative">
                  <motion.div
                    initial={{ rotate: -180, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ duration: 1, type: 'spring', bounce: 0.5 }}
                  >
                    <Icons.reelLogo className="size-32 drop-shadow-[0_0_30px_rgba(6,182,212,0.6)]" />
                  </motion.div>
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-4">
                  Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">{siteConfig.name}</span>
                </h1>
                <p className="text-slate-400 text-lg md:text-xl max-w-lg mb-10">
                  Your ultimate destination for movies, TV series, and anime. Discover, track, and watch instantly.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={nextStep}
                  className="px-8 py-4 bg-white text-black font-bold rounded-full flex items-center gap-2 hover:bg-cyan-50 transition-colors shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                >
                  Get Started <Icons.arrowRight className="ml-2" />
                </motion.button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step1"
                className="flex flex-col items-center justify-center text-center px-4 w-full max-w-4xl"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 w-full">
                  <motion.div
                    className="flex flex-col items-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="size-16 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4">
                      <Play className="size-8 text-cyan-400 fill-cyan-400/20" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Unlimited Streaming</h3>
                    <p className="text-slate-400 text-sm">Access thousands of movies and anime from multiple premium servers.</p>
                  </motion.div>

                  <motion.div
                    className="flex flex-col items-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="size-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
                      <Icons.search className="size-8 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Smart Search</h3>
                    <p className="text-slate-400 text-sm">Find exactly what you're looking for with our lightning-fast search engine.</p>
                  </motion.div>

                  <motion.div
                    className="flex flex-col items-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="size-16 rounded-full bg-pink-500/20 flex items-center justify-center mb-4">
                      <Icons.sun className="size-8 text-pink-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Beautiful UI</h3>
                    <p className="text-slate-400 text-sm">Enjoy a premium, distraction-free viewing experience crafted just for you.</p>
                  </motion.div>
                </div>
                
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setStep(0)}
                    className="px-6 py-3 bg-white/10 text-white font-medium rounded-full hover:bg-white/20 transition-colors"
                  >
                    Back
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={nextStep}
                    className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-full shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]"
                  >
                    Start Watching
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stepper indicators */}
          <div className="absolute bottom-10 flex gap-2">
            <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 0 ? 'w-8 bg-cyan-400' : 'w-4 bg-white/20'}`} />
            <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 1 ? 'w-8 bg-cyan-400' : 'w-4 bg-white/20'}`} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
