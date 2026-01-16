'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (error) {
      alert(error.message)
      setLoading(false)
    } else {
      router.refresh() 
      router.push('/') 
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-6 font-sans">
      <div className="w-full max-w-[400px] space-y-8">
        
        {/* Typographic Brand Identity */}
        <div className="text-center space-y-2">
          <h2 className="text-[12px] font-black uppercase tracking-[0.3em] text-[#3B82F6]">
            Infrastructure Access
          </h2>
          <h1 className="text-4xl font-bold tracking-tight text-[#111827]">
            InvSys<span className="text-[#3B82F6]">.</span>
          </h1>
        </div>

        {/* Login Container */}
        <form 
          onSubmit={handleLogin} 
          className="bg-white p-8 rounded-[24px] border border-[#E5E7EB] shadow-sm space-y-6"
        >
          <div className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label 
                htmlFor="email" 
                className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest ml-1"
              >
                Corporate Email
              </label>
              <input 
                id="email"
                required
                type="email" 
                placeholder="name@company.com" 
                className="w-full bg-[#F3F4F6] border-none rounded-xl px-4 py-3 text-sm font-semibold text-[#111827] focus:ring-2 focus:ring-[#3B82F6] transition-all outline-none appearance-none"
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
            
            {/* Password Field */}
            <div className="space-y-2">
              <label 
                htmlFor="password" 
                className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest ml-1"
              >
                System Password
              </label>
              <input 
                id="password"
                required
                type="password" 
                placeholder="••••••••" 
                className="w-full bg-[#F3F4F6] border-none rounded-xl px-4 py-3 text-sm font-semibold text-[#111827] focus:ring-2 focus:ring-[#3B82F6] transition-all outline-none appearance-none"
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-[#3B82F6] text-white py-4 rounded-xl font-bold text-sm tracking-wide hover:bg-[#2563EB] active:scale-[0.98] transition-all disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] shadow-sm"
          >
            {loading ? 'AUTHENTICATING...' : 'SIGN IN'}
          </button>
        </form>

        {/* System Meta */}
        <footer className="text-center space-y-4">
          <div className="flex items-center justify-center gap-4">
            <span className="h-px w-8 bg-[#E5E7EB]"></span>
            <p className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-widest">
              Protocol: RBAC Enabled
            </p>
            <span className="h-px w-8 bg-[#E5E7EB]"></span>
          </div>
          <p className="text-[10px] text-[#D1D5DB] font-medium leading-relaxed uppercase tracking-tighter">
            Authorized Personnel Only — Unauthorized Access Monitored
          </p>
        </footer>
      </div>
    </div>
  )
}