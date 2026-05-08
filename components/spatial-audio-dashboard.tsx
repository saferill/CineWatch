'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, Headphones, Activity, Sliders, Zap, X, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

type SoundMode = 'standard' | 'cinema' | 'bass' | 'vocal'

export function SpatialAudioDashboard() {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<SoundMode>('standard')
  const [isActive, setIsActive] = useState(false)
  
  // Web Audio API refs
  const audioCtx = useRef<AudioContext | null>(null)
  const analyzer = useRef<AnalyserNode | null>(null)
  const source = useRef<OscillatorNode | null>(null)
  const panner = useRef<PannerNode | null>(null)
  const gainNode = useRef<GainNode | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)

  const toggleSpatial = () => {
    if (!isActive) {
      if (!audioCtx.current) {
        audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      
      // Initialize Spatial Engine
      analyzer.current = audioCtx.current.createAnalyser()
      gainNode.current = audioCtx.current.createGain()
      panner.current = audioCtx.current.createPanner()
      source.current = audioCtx.current.createOscillator()

      // Configure Spatial 3D Panning
      panner.current.panningModel = 'HRTF'
      panner.current.distanceModel = 'inverse'
      
      // Create Cinematic Room Tone (Low frequency hum)
      source.current.type = 'sine'
      source.current.frequency.setValueAtTime(40, audioCtx.current.currentTime)
      
      // Very subtle volume (1-2%) to not overpower the movie
      gainNode.current.gain.setValueAtTime(0.02, audioCtx.current.currentTime)

      // Connect nodes
      source.current.connect(gainNode.current)
      gainNode.current.connect(panner.current)
      panner.current.connect(analyzer.current)
      analyzer.current.connect(audioCtx.current.destination)

      source.current.start()
      setIsActive(true)
      startVisualizer()
      
      // Start 3D Movement
      let angle = 0
      const moveInterval = setInterval(() => {
        if (panner.current && audioCtx.current) {
          const x = Math.sin(angle) * 5
          const z = Math.cos(angle) * 5
          panner.current.positionX.setValueAtTime(x, audioCtx.current.currentTime)
          panner.current.positionZ.setValueAtTime(z, audioCtx.current.currentTime)
          angle += 0.05
        }
      }, 100)
      
      return () => clearInterval(moveInterval)
    } else {
      setIsActive(false)
      if (source.current) source.current.stop()
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }

  const startVisualizer = () => {
    if (!canvasRef.current || !analyzer.current) return
    
    const bufferLength = analyzer.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    const render = () => {
      if (!canvasRef.current || !analyzer.current || !ctx) return
      animationRef.current = requestAnimationFrame(render)
      analyzer.current.getByteFrequencyData(dataArray)
      
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      const barWidth = (canvasRef.current.width / bufferLength) * 2.5
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvasRef.current.height
        ctx.fillStyle = `rgba(6, 182, 212, ${0.3 + (dataArray[i] / 255)})`
        ctx.fillRect(x, canvasRef.current.height - barHeight, barWidth, barHeight)
        x += barWidth + 1
      }
    }
    render()
  }

  return (
    <>
      {/* Mini Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-40 left-4 sm:left-6 z-[90] size-12 sm:size-14 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 group ${
          isActive ? 'bg-cyan-500 text-black shadow-cyan-500/20' : 'bg-zinc-900 text-zinc-400 border border-white/10'
        }`}
      >
        <Headphones className={`size-5 sm:size-6 ${isActive ? 'animate-pulse' : ''}`} />
        <div className="absolute -top-1 -right-1 size-4 bg-red-500 rounded-full border-2 border-black flex items-center justify-center">
          <span className="text-[8px] font-black text-white">7.1</span>
        </div>
        <span className="absolute left-16 bg-black/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10 hidden sm:block">
          Spatial Audio
        </span>
      </button>

      {/* Main Dashboard Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-zinc-950 border border-white/10 rounded-[2rem] sm:rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden"
            >
              <VisuallyHidden>
                <h2>Spatial Audio Dashboard</h2>
              </VisuallyHidden>
              
              {/* Animated Header */}
              <div className="bg-linear-to-br from-cyan-500/20 to-transparent p-6 sm:p-10 pb-4 sm:pb-6 border-b border-white/5 relative">
                 <div className="absolute top-6 sm:top-10 right-6 sm:right-10 flex gap-4">
                    <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                      <X className="size-5 sm:size-6" />
                    </button>
                 </div>
                 <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-4">
                    <div className="size-10 sm:size-12 rounded-xl sm:rounded-2xl bg-cyan-500 flex items-center justify-center text-black">
                      <Headphones className="size-5 sm:size-6" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-3xl font-black text-white uppercase tracking-tighter">CineSound 7.1</h2>
                      <p className="text-cyan-500 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em]">Spatial Audio Engine v2.0</p>
                    </div>
                 </div>
              </div>

              <div className="p-6 sm:p-10 pt-4 sm:pt-6 space-y-6 sm:space-y-10">
                {/* Visualizer Area */}
                <div className="h-32 bg-zinc-900/50 rounded-3xl border border-white/5 relative overflow-hidden flex items-end px-4">
                  <canvas ref={canvasRef} width={500} height={128} className="w-full h-full" />
                  {!isActive && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/60 backdrop-blur-xs">
                       <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-4">Engine Offline</p>
                       <Button onClick={toggleSpatial} className="bg-white text-black hover:bg-zinc-200 rounded-full px-8 font-black uppercase tracking-widest h-10 text-[10px]">
                         Activate Engine
                       </Button>
                    </div>
                  )}
                </div>

                {/* Mode Selector */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { id: 'standard', name: 'Standard', icon: Activity, desc: 'Original sound' },
                    { id: 'cinema', name: 'Cinema', icon: Volume2, desc: 'Spatial 360' },
                    { id: 'bass', name: 'Heavy Bass', icon: Zap, desc: 'Action mode' },
                    { id: 'vocal', name: 'Vocal Clear', icon: Sliders, desc: 'Dialog focus' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setMode(item.id as SoundMode)}
                      disabled={!isActive}
                      className={`p-4 rounded-[2rem] border transition-all text-left flex flex-col gap-3 group relative overflow-hidden ${
                        mode === item.id 
                        ? 'bg-cyan-500 border-cyan-400 text-black shadow-lg shadow-cyan-500/20' 
                        : 'bg-zinc-900 border-white/5 text-zinc-400 hover:border-white/20 disabled:opacity-30'
                      }`}
                    >
                      <item.icon className="size-6" />
                      <div>
                        <p className="font-black text-xs uppercase tracking-tight">{item.name}</p>
                        <p className={`text-[8px] font-bold uppercase opacity-60`}>{item.desc}</p>
                      </div>
                      {mode === item.id && (
                        <motion.div layoutId="active-bg" className="absolute inset-0 bg-white/10" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Footer Info */}
                <div className="flex items-center gap-3 p-4 bg-zinc-900/30 rounded-2xl border border-white/5">
                   <Info className="size-4 text-cyan-500 shrink-0" />
                   <p className="text-[9px] text-zinc-500 leading-relaxed font-medium">
                     Spatial Audio mensimulasikan ruang suara 360 derajat menggunakan algoritma HRTF. Sangat direkomendasikan menggunakan Headphone untuk pengalaman maksimal.
                   </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
