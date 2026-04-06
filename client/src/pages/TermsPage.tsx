import { Link } from 'react-router-dom'

export function TermsPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="bg-slate-800 text-white px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-green-400 tracking-tight">HomeWise</Link>
        </div>
      </header>

      <main className="flex-1 px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Terms of Service</h1>
          <p className="text-slate-500 text-sm mb-8">Last updated: April 5, 2026</p>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">Acceptance</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              By creating an account or using HomeWise, you agree to these Terms of Service. If you don't agree, please don't use the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">What HomeWise is</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              HomeWise is a free home appliance maintenance tracker. It provides maintenance reminders, DIY guides, and links to local service professionals. It is an organizational tool — not a substitute for professional inspection, repair, or safety advice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">Your account</h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-3">
              You are responsible for keeping your account credentials secure. You must be at least 18 years old to use HomeWise. One account per person — do not share accounts.
            </p>
            <p className="text-slate-600 text-sm leading-relaxed">
              You can delete your account at any time from your Profile page. We will delete your data promptly upon request.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">Acceptable use</h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-2">You agree not to:</p>
            <ul className="text-slate-600 text-sm leading-relaxed space-y-1 list-disc list-inside">
              <li>Use the service for any unlawful purpose</li>
              <li>Attempt to access another user's account or data</li>
              <li>Attempt to reverse engineer, scrape, or abuse the API</li>
              <li>Submit false, misleading, or malicious content</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">Affiliate disclosure</h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-3">
              HomeWise earns revenue through affiliate referrals. Specifically:
            </p>
            <ul className="text-slate-600 text-sm leading-relaxed space-y-2 list-disc list-inside">
              <li><strong>Thumbtack and Angi</strong> — "Find a Pro" links may earn HomeWise a referral fee when you request a quote or book a service. This does not affect the price you pay.</li>
              <li><strong>Amazon Associates</strong> — "Tools & Parts" links use our Amazon affiliate tag. We may earn a commission on qualifying purchases at no additional cost to you.</li>
            </ul>
            <p className="text-slate-600 text-sm leading-relaxed mt-3">
              Affiliate relationships do not influence which maintenance tasks are recommended — those are based solely on manufacturer and industry-standard intervals.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">No warranty</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              HomeWise is provided "as is" without any warranty, express or implied. Maintenance reminders and intervals are general guidance — your specific appliances, installation conditions, and usage patterns may require different schedules. Always consult the manufacturer's documentation and, when in doubt, a licensed professional.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">Limitation of liability</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              To the fullest extent permitted by law, HomeWise and its operators are not liable for any damages arising from your use of the service, including missed maintenance reminders, appliance failures, property damage, or any action taken based on information provided by the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">Service availability</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              We aim to keep HomeWise available but make no guarantees of uptime or data retention. We may modify or discontinue the service at any time with reasonable notice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">Changes to these terms</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              We may update these terms from time to time. We'll update the date at the top of this page. Continued use of HomeWise after a change constitutes acceptance of the updated terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">Contact</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Questions about these terms? Email us at{' '}
              <a href="mailto:legal@homewise.app" className="text-green-600 hover:underline">legal@homewise.app</a>.
            </p>
          </section>
        </div>
      </main>

      <footer className="bg-slate-800 text-slate-400 px-4 py-8 text-center text-sm">
        <p className="font-medium text-slate-300 mb-1">HomeWise</p>
        <div className="flex justify-center gap-4 mt-2">
          <Link to="/privacy" className="hover:text-slate-200 transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-slate-200 transition-colors">Terms of Service</Link>
        </div>
      </footer>
    </div>
  )
}
