import Navbar from "@/app/components/Navbar";

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="text-4xl font-black mb-8 tracking-tight">Privacy Policy</h1>
        
        <div className="space-y-8 text-zinc-400 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">1. Data Collection</h2>
            <p>
              CineWatch is designed with privacy in mind. We do not require account registration. 
              Most of your data, including your Watchlist and continue watching progress, is stored 
              locally on your device using <strong>Browser Local Storage</strong>. This means we do 
              not have access to your personal viewing habits.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">2. Cookies and Tracking</h2>
            <p>
              We use minimal cookies and session storage to enhance your experience, such as 
              remembering if you have seen the onboarding screen. We do not use intrusive 
              tracking or sell your data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">3. Third-Party APIs</h2>
            <p>
              CineWatch uses the TMDB API and Anilist API for movie and anime metadata. 
              These services may collect anonymous usage data as per their own privacy policies. 
              When you watch content, the video player may connect to third-party sources 
              over which we have no control.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">4. Updates</h2>
            <p>
              We may update this policy from time to time. Any changes will be posted on this 
              page with an updated revision date.
            </p>
            <p className="mt-4 text-sm italic">Last updated: April 2026</p> Section
          </section>
        </div>
      </main>
    </>
  );
}
