'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Leaf, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    if (mode === 'register') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Account created! Please check your email to confirm.')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        toast.error(error.message)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    }
    setLoading(false)
  }

  const inputCls =
    'w-full bg-white/5 border border-cream/10 font-sans text-sm text-cream px-4 py-3.5 focus:outline-none focus:border-gold/60 transition-colors placeholder:text-cream/20'
  const labelCls = 'font-sans text-[10px] text-cream/40 tracking-[0.2em] uppercase mb-1.5 block'

  return (
    <div className="min-h-screen bg-forest flex">
      {/* Left decorative */}
      <div className="hidden lg:flex lg:w-5/12 flex-col justify-between p-16 border-r border-cream/10">
        <Link href="/" className="flex items-center gap-2">
          <Leaf size={16} className="text-gold" />
          <span className="font-serif text-2xl font-bold text-cream">Mrittika</span>
        </Link>
        <div>
          <div className="w-8 h-px bg-gold mb-8" />
          <p className="font-serif text-5xl font-black text-cream leading-tight mb-6">
            Staff
            <br />
            Portal.
          </p>
          <p className="font-sans text-sm text-cream/40 leading-relaxed max-w-xs">
            Manage orders, update product pricing, track deliveries, and view
            income streams from your secure dashboard.
          </p>
        </div>
        <p className="font-sans text-xs text-cream/15">&copy; 2026 Mrittika</p>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-8 py-16">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="flex items-center gap-2 text-cream/30 hover:text-gold transition-colors mb-12 font-sans text-sm"
          >
            <ArrowLeft size={14} />
            Back to store
          </Link>

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <Leaf size={16} className="text-gold" />
            <span className="font-serif text-2xl font-bold text-cream">Mrittika</span>
          </div>

          {/* Tab switcher */}
          <div className="flex border border-cream/10 mb-8">
            {(['login', 'register'] as const).map((tab) => (
              <button
                key={tab}
                id={`auth-tab-${tab}`}
                onClick={() => setMode(tab)}
                className={`flex-1 py-3 font-sans text-sm font-semibold capitalize transition-colors ${
                  mode === tab
                    ? 'bg-gold text-cream'
                    : 'text-cream/35 hover:text-cream/60'
                }`}
              >
                {tab === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {mode === 'register' && (
                <div>
                  <label className={labelCls}>Full Name</label>
                  <input
                    required
                    type="text"
                    id="register-fullname"
                    placeholder="Your name"
                    className={inputCls}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              )}
              <div>
                <label className={labelCls}>Email Address</label>
                <input
                  required
                  type="email"
                  id="auth-email"
                  placeholder="name@example.com"
                  className={inputCls}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Password</label>
                <input
                  required
                  type="password"
                  id="auth-password"
                  placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                  className={inputCls}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button
                type="submit"
                id="auth-submit-btn"
                disabled={loading}
                className="w-full bg-gold text-cream font-sans font-bold text-sm tracking-widest py-4 hover:bg-gold-light transition-colors disabled:opacity-40 uppercase mt-2"
              >
                {loading
                  ? 'Please wait...'
                  : mode === 'login'
                  ? 'Sign In'
                  : 'Create Account'}
              </button>
            </motion.form>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
