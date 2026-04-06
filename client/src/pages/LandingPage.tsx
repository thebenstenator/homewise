import { Link } from 'react-router-dom'
import {
  Wind,
  Droplets,
  Refrigerator,
  WashingMachine,
  Flame,
  Trash2,
  ShieldAlert,
  AlarmSmoke,
  GalleryHorizontalEnd,
  Waves,
  Zap,
  Utensils,
  CheckCircle,
  Bell,
  Wrench,
  Home,
} from 'lucide-react'

const applianceIcons = [
  { label: 'HVAC', icon: Wind },
  { label: 'Window AC', icon: Wind },
  { label: 'Gas Water Heater', icon: Flame },
  { label: 'Electric Water Heater', icon: Zap },
  { label: 'Refrigerator', icon: Refrigerator },
  { label: 'Dishwasher', icon: Utensils },
  { label: 'Washer', icon: WashingMachine },
  { label: 'Gas Dryer', icon: Flame },
  { label: 'Electric Dryer', icon: Zap },
  { label: 'Disposal', icon: Trash2 },
  { label: 'Smoke Detector', icon: AlarmSmoke },
  { label: 'CO Detector', icon: ShieldAlert },
  { label: 'Garage Door', icon: GalleryHorizontalEnd },
  { label: 'Gutters', icon: Droplets },
  { label: 'Sump Pump', icon: Waves },
]

const features = [
  'Completely free — no credit card ever',
  'Covers 15+ appliance types out of the box',
  'Smart reminders before things break',
  'DIY guides for every maintenance task',
  'Find local pros with one tap',
  'Works on any device, any browser',
  'No ads, no upsells, no nonsense',
  'Your data stays yours',
]

const steps = [
  {
    icon: Home,
    title: 'Add your appliances',
    desc: 'Tell us what you have — HVAC, water heater, washer, and more. Takes a few minutes.',
  },
  {
    icon: Bell,
    title: 'Get smart reminders',
    desc: 'We track maintenance intervals and email you before things go wrong.',
  },
  {
    icon: Wrench,
    title: 'DIY or hire a pro',
    desc: "Step-by-step guides for the handy. Local professional search for when you'd rather not.",
  },
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <header className="bg-slate-800 text-white px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-xl font-bold text-green-400 tracking-tight">HomeWise</span>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm text-slate-300 hover:text-white transition-colors">
              Log In
            </Link>
            <Link
              to="/register"
              className="text-sm bg-green-600 text-white px-4 py-1.5 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-slate-800 text-white px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">
            Never forget home<br className="hidden sm:block" /> maintenance again.
          </h1>
          <p className="text-lg text-slate-300 mb-8 leading-relaxed">
            Track your home appliances, get maintenance reminders before things break,
            and find local pros when you need them. Free, no subscription.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register"
              className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold text-base hover:bg-green-700 transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="border border-slate-600 text-slate-300 px-8 py-3 rounded-xl font-semibold text-base hover:bg-slate-700 transition-colors"
            >
              Log In
            </Link>
          </div>
          <p className="text-xs text-slate-500 mt-4">No credit card. No trial. Just free.</p>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-10">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mx-auto mb-4">
                  <step.icon size={22} className="text-green-700" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-10">What's included</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3 justify-center sm:justify-start">
                <CheckCircle size={16} className="text-green-600 shrink-0" />
                <span className="text-sm text-slate-700">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Appliance coverage */}
      <section className="px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-3">Covers your whole home</h2>
          <p className="text-sm text-slate-500 text-center mb-10">
            17 appliance types with pre-built maintenance schedules — more to come.
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
            {applianceIcons.map(({ label, icon: Icon }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-xl"
              >
                <Icon size={22} className="text-slate-600" />
                <span className="text-xs text-slate-500 text-center leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-green-600 px-4 py-16 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to take care of your home?</h2>
          <p className="text-green-100 mb-6 text-sm">
            Set up in under 3 minutes. No credit card required.
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-green-700 px-8 py-3 rounded-xl font-semibold text-base hover:bg-green-50 transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 text-slate-400 px-4 py-8 text-center text-sm mt-auto">
        <p className="font-medium text-slate-300 mb-1">HomeWise</p>
        <p>Free home maintenance tracking. Made by a homeowner, for homeowners.</p>
        <div className="flex justify-center gap-4 mt-3">
          <Link to="/privacy" className="hover:text-slate-200 transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-slate-200 transition-colors">Terms of Service</Link>
        </div>
      </footer>
    </div>
  )
}
