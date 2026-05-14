'use client';
import React, { useEffect, useState } from 'react'
import { siteConfig } from '@/config/site'
import { supabase } from '@/lib/supabase'

export function Footer() {
  const [ctoStatus, setCtoStatus] = useState('System Synchronized');

  useEffect(() => {
    async function getStatus() {
      const { data } = await supabase
        .from('posts')
        .select('content')
        .eq('slug', 'system-dynamic-config')
        .single();
      
      if (data) {
        try {
          const config = JSON.parse(data.content);
          if (config.cto_status) setCtoStatus(config.cto_status);
        } catch (e) {}
      }
    }
    getStatus();
  }, []);

  return (
    <footer className="container space-y-12 pb-24 pt-16 text-sm text-slate-500">
      <div className="flex flex-col items-center justify-center pt-8 border-t border-white/10 text-xs text-zinc-600 font-medium">
        <div className="mb-4 flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 rounded-full border border-green-500/20">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>CTO STATUS: {ctoStatus}</span>
        </div>
        <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
      </div>
    </footer>
  )
}
