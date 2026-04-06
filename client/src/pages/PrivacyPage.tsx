import { Link } from 'react-router-dom'

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="bg-slate-800 text-white px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-green-400 tracking-tight">HomeWise</Link>
        </div>
      </header>

      <main className="flex-1 px-4 py-12">
        <div className="max-w-2xl mx-auto prose prose-slate prose-sm">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Privacy Policy</h1>
          <p className="text-slate-500 text-sm mb-8">Last updated: April 5, 2026</p>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">What we collect</h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-3">
              When you create an account, we collect your name, email address, and zip code.
              As you use HomeWise, we store the appliance information you enter (type, brand, model, install year, and optional notes) and a log of maintenance tasks you mark complete.
            </p>
            <p className="text-slate-600 text-sm leading-relaxed">
              We do not collect payment information. HomeWise is free and has no paid tier.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">How we use it</h2>
            <ul className="text-slate-600 text-sm leading-relaxed space-y-2 list-disc list-inside">
              <li><strong>Maintenance reminders</strong> — we email you a weekly digest of upcoming and overdue tasks based on your appliance data.</li>
              <li><strong>Affiliate referrals</strong> — your zip code is used to pre-fill "Find a Pro" search links to Thumbtack and Angi. We may earn a referral fee if you book through those links. We do not share your personal information with those services.</li>
              <li><strong>Product links</strong> — "Tools & Parts" links go to Amazon search pages tagged with our Associates ID. We may earn a commission on qualifying purchases. No personal data is sent to Amazon through our links.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">Who we share data with</h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-3">
              We use <strong>Resend</strong> (resend.com) to send email. Your email address is shared with Resend solely to deliver reminders and password reset emails. Resend is a data processor acting on our behalf — they do not use your data for their own purposes.
            </p>
            <p className="text-slate-600 text-sm leading-relaxed">
              We do not sell, rent, or share your personal information with any other third party.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">Data storage and security</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Your data is stored in MongoDB Atlas (a US-based cloud database). Passwords are hashed using bcrypt and are never stored in plaintext. Authentication uses an httpOnly cookie — your session token is not accessible to JavaScript running in the browser.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">Email reminders</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              You can turn off email reminders at any time from your <Link to="/profile" className="text-green-600 hover:underline">Profile</Link> page. We do not send marketing email — only the weekly maintenance digest and transactional messages (password reset).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">Your rights</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              You can delete your account and all associated data at any time from your Profile page. If you have any questions or requests about your data, email us at{' '}
              <a href="mailto:privacy@homewise.app" className="text-green-600 hover:underline">privacy@homewise.app</a>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">Cookies</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              We use a single httpOnly cookie to keep you logged in. We do not use tracking cookies or third-party analytics cookies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">Changes to this policy</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              If we make material changes, we'll update the date at the top of this page. Continued use of HomeWise after a change constitutes acceptance.
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
