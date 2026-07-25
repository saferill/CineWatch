

export default function TermsPage() {
  return (
    <>
      
      <main className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="text-4xl font-black mb-8 tracking-tight">Terms of Service</h1>
        
        <div className="space-y-8 text-zinc-400 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing CineWatch, you agree to comply with and be bound by these Terms of Service. 
              This website is intended for personal, non-commercial entertainment purposes only.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">2. Content Disclaimer</h2>
            <p>
              CineWatch does not host any videos on its servers. All content is provided by non-affiliated 
              third parties. We are a metadata aggregator and search engine for content already available 
              on the web. We are not responsible for the legality or content of these third-party sources.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">3. Intellectual Property</h2>
            <p>
              All movie posters, backdrops, and metadata are the property of their respective owners 
              and are provided via TMDB and Anilist APIs for informational purposes. The CineWatch 
              design and branding are the property of saferill.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">4. User Conduct</h2>
            <p>
              Users agree not to use the service for any illegal activities or to attempt to 
              disrupt the service through any technical means.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">5. Limitation of Liability</h2>
            <p>
              CineWatch is provided "as is" without any warranties. We shall not be liable for any 
              damages arising from your use of the website or the third-party players provided.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
