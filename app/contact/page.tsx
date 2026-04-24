import Navbar from "@/app/components/Navbar";
import { IconMail } from "@tabler/icons-react";

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

        <div className="flex justify-center">
          <div className="p-10 rounded-[40px] glass border border-white/[0.05] hover:border-white/[0.1] transition-all group max-w-sm w-full text-center">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <IconMail className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3">Email Support</h3>
            <p className="text-zinc-500 text-sm mb-6 leading-relaxed">
              For any inquiries, support, or feedback, please reach out to us via email.
            </p>
            <a 
              href="mailto:saferill93@gmail.com" 
              className="inline-block px-6 py-3 rounded-2xl bg-white text-black font-bold hover:scale-105 transition-transform"
            >
              saferill93@gmail.com
            </a>
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
