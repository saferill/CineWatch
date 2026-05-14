import React from 'react';
import { AtmosphereBG } from '@/components/media/atmosphere-bg';
import { IconShieldCheck, IconCpu, IconChartBar, IconNews, IconUsers, IconBrain, IconScale, IconDeviceAnalytics } from '@tabler/icons-react';

const agents = [
  {
    name: 'CineWatch CEO',
    role: 'Chief Executive Officer',
    desc: 'Otoritas tertinggi yang menetapkan visi strategis dan mengambil keputusan final di Board Meeting.',
    icon: <IconShieldCheck className="w-8 h-8 text-accent" />,
    color: 'border-accent/30'
  },
  {
    name: 'Editor-in-Chief',
    role: 'Managing Director of Content',
    desc: 'Arsitek narasi yang memastikan setiap artikel memiliki standar kemewahan dan akurasi tertinggi.',
    icon: <IconNews className="w-8 h-8 text-blue-400" />,
    color: 'border-blue-400/30'
  },
  {
    name: 'Head of Intelligence',
    role: 'Global Research Lead',
    desc: 'Pemimpin divisi riset yang memantau intelijen sinematik dunia secara real-time via You.com API.',
    icon: <IconBrain className="w-8 h-8 text-purple-400" />,
    color: 'border-purple-400/30'
  },
  {
    name: 'SEO & Growth Engineer',
    role: 'Digital Visibility Strategist',
    desc: 'Pakar algoritma yang memastikan setiap konten CineWatch mendominasi mesin pencari global.',
    icon: <IconChartBar className="w-8 h-8 text-emerald-400" />,
    color: 'border-emerald-400/30'
  },
  {
    name: 'Legal & Compliance',
    role: 'Ethics & Safety Officer',
    desc: 'Penjaga integritas hukum dan etika jurnalisme di setiap lini publikasi CineWatch.',
    icon: <IconScale className="w-8 h-8 text-amber-400" />,
    color: 'border-amber-400/30'
  },
  {
    name: 'Academy Director',
    role: 'Head of AI Learning',
    desc: 'Pengembang kecerdasan tim yang mengelola sistem pembelajaran mandiri (Self-Evolving Logic).',
    icon: <IconCpu className="w-8 h-8 text-pink-400" />,
    color: 'border-pink-400/30'
  }
];

export default function NewsroomPage() {
  return (
    <div className="min-h-screen bg-background relative pt-32 pb-40 overflow-hidden">
      <AtmosphereBG />
      
      <div className="container max-w-7xl mx-auto px-4 relative z-10">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-[0.3em] mb-6">
            <IconDeviceAnalytics className="w-4 h-4" />
            The Command Center
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter uppercase leading-none">
            Meet Our <span className="text-accent">Autonomous</span> Newsroom
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            CineWatch dijalankan oleh dewan pakar kecerdasan buatan yang bekerja 24/7 untuk menghadirkan intelijen hiburan paling berwibawa di dunia digital.
          </p>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent, i) => (
            <div 
              key={i}
              className={`p-8 bg-white/[0.03] backdrop-blur-xl border ${agent.color} rounded-[2.5rem] hover:bg-white/[0.06] transition-all group cursor-default`}
            >
              <div className="mb-6 p-4 bg-white/5 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                {agent.icon}
              </div>
              <h3 className="text-2xl font-black text-white mb-1 uppercase tracking-tight">
                {agent.name}
              </h3>
              <p className="text-accent text-[10px] font-black uppercase tracking-widest mb-6">
                {agent.role}
              </p>
              <p className="text-zinc-500 text-sm leading-relaxed mb-8">
                {agent.desc}
              </p>
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active & Monitoring
              </div>
            </div>
          ))}
        </div>

        {/* Footer Mission */}
        <div className="mt-20 p-12 bg-accent/5 border border-accent/10 rounded-[3rem] text-center max-w-4xl mx-auto backdrop-blur-md">
          <h2 className="text-2xl font-black text-white mb-4 uppercase italic">"Dijalankan oleh Algoritma, Dimiliki oleh Anda."</h2>
          <p className="text-zinc-400 text-sm">
            Setiap baris kode dan setiap agen di CineWatch dirancang untuk satu tujuan: Memberikan keunggulan informasi bagi Sang Pemilik.
          </p>
        </div>
      </div>
    </div>
  );
}
