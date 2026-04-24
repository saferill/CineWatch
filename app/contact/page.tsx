import Navbar from "@/app/components/Navbar";
import { IconMail, IconBrandDiscord, IconBrandGithub } from "@tabler/icons-react";

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="text-4xl font-black mb-8 tracking-tight">Contact Us</h1>
        
        <p className="text-zinc-400 text-lg mb-12 max-w-2xl leading-relaxed">
          Have questions, suggestions, or found a bug? We'd love to hear from you. 
          Connect with us through the channels below.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl glass border border-white/[0.05] hover:border-white/[0.1] transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <IconMail className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold mb-2">Email</h3>
            <p className="text-zinc-500 text-sm mb-4">Official inquiries and support.</p>
            <a href="mailto:support@saferill.com" className="text-white font-medium hover:text-accent transition-colors">support@saferill.com</a>
          </div>

          <div className="p-8 rounded-3xl glass border border-white/[0.05] hover:border-white/[0.1] transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <IconBrandDiscord className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold mb-2">Discord</h3>
            <p className="text-zinc-500 text-sm mb-4">Join our community server.</p>
            <a href="#" className="text-white font-medium hover:text-blue-400 transition-colors">saferill#0000</a>
          </div>

          <div className="p-8 rounded-3xl glass border border-white/[0.05] hover:border-white/[0.1] transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <IconBrandGithub className="w-6 h-6 text-zinc-300" />
            </div>
            <h3 className="text-lg font-bold mb-2">GitHub</h3>
            <p className="text-zinc-500 text-sm mb-4">Report issues or contribute.</p>
            <a href="https://github.com/saferill/CineWatch" target="_blank" className="text-white font-medium hover:text-zinc-300 transition-colors">CineWatch Repo</a>
          </div>
        </div>

        <div className="mt-16 p-10 rounded-[40px] bg-white/[0.02] border border-white/[0.05] text-center">
          <h2 className="text-2xl font-bold mb-4">Want to give feedback?</h2>
          <p className="text-zinc-400 mb-8 max-w-md mx-auto">
            We are constantly improving CineWatch. Your feedback helps us make it the best streaming experience.
          </p>
          <button className="px-8 py-3 rounded-2xl bg-accent text-accent-foreground font-bold hover:scale-105 transition-transform">
            Send Feedback
          </button>
        </div>
      </main>
    </>
  );
}
