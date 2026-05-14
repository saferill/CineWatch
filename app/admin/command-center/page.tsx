import React from 'react';
import { supabase } from '@/lib/supabase';
import { AtmosphereBG } from '@/components/media/atmosphere-bg';
import { IconTerminal2, IconBrain, IconTargetArrow, IconActivity, IconHierarchy } from '@tabler/icons-react';

export const dynamic = 'force-dynamic';

export default async function CommandCenterPage() {
  // Fetch Latest Activity
  const { data: logs } = await supabase
    .from('posts')
    .select('*')
    .eq('type', 'Bot History')
    .order('created_at', { ascending: false })
    .limit(10);

  // Fetch Current Vision
  const { data: vision } = await supabase
    .from('posts')
    .select('content')
    .eq('type', 'Bot History')
    .ilike('title', 'Weekly Vision%')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  // Fetch Corporate Memory
  const { data: memory } = await supabase
    .from('posts')
    .select('content, title')
    .eq('type', 'Bot History')
    .ilike('title', 'Corporate Memory%')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return (
    <div className="min-h-screen bg-black relative pt-32 pb-40 overflow-hidden text-zinc-100">
      <AtmosphereBG />
      
      <div className="container max-w-7xl mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Systems Online
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Command <span className="text-accent">Center</span></h1>
            <p className="text-zinc-500 font-medium">Monitoring CineWatch Global Media Operations</p>
          </div>
          
          <div className="flex gap-4">
            <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">Total Agents</p>
              <p className="text-2xl font-black text-white">10</p>
            </div>
            <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">Brain Level</p>
              <p className="text-2xl font-black text-accent">MAX</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column: Live Feed */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-8">
                <IconTerminal2 className="w-6 h-6 text-accent" />
                <h2 className="text-xl font-black uppercase tracking-tight">Recent Internal Activity</h2>
              </div>
              
              <div className="space-y-4">
                {logs?.map((log, i) => (
                  <div key={i} className="group p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-accent">{log.title}</p>
                      <p className="text-[9px] font-medium text-zinc-600">{new Date(log.created_at).toLocaleTimeString()}</p>
                    </div>
                    <p className="text-zinc-400 text-sm leading-relaxed">{log.content?.slice(0, 150)}...</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Side Column: Vision & Memory */}
          <div className="space-y-8">
            {/* Weekly Vision */}
            <div className="bg-accent/10 border border-accent/20 rounded-[2.5rem] p-8 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl group-hover:scale-150 transition-transform" />
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <IconTargetArrow className="w-6 h-6 text-accent" />
                <h2 className="text-xl font-black uppercase tracking-tight">Weekly Mission</h2>
              </div>
              <p className="text-white text-lg font-bold leading-relaxed relative z-10 italic">
                "{vision?.content || 'Establishing dominance in the cinematic news industry.'}"
              </p>
            </div>

            {/* Corporate Memory */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-[2.5rem] p-8 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6">
                <IconBrain className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl font-black uppercase tracking-tight">Corporate Memory</h2>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">{memory?.title || 'Learning Session'}</p>
                <p className="text-zinc-400 text-xs leading-relaxed italic">
                  {memory?.content?.slice(0, 200) || 'Tim sedang mengasimilasi data performa terbaru...'}
                </p>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6">
                <IconActivity className="w-6 h-6 text-zinc-400" />
                <h2 className="text-xl font-black uppercase tracking-tight">System Status</h2>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'News Sentry', status: 'Scanning' },
                  { label: 'Boardroom', status: 'Ready' },
                  { label: 'Editorial Pipeline', status: 'Standby' }
                ].map((s, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{s.label}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">{s.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
