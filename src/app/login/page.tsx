'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false) // Added loading state
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
      // router.refresh() ensures the server-side components (like the Middleware) 
      // see the new session cookies immediately.
      router.refresh() 
      router.push('/dashboard') 
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleLogin} className="p-10 bg-white rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="mb-8 text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-blue-200 shadow-lg">
            <span className="text-white font-black text-lg tracking-tighter">IS</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter">Welcome to <span className="text-blue-600">InvSys</span></h1>
          <p className="text-gray-400 text-sm font-medium mt-2 uppercase tracking-widest">Enterprise Access</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-2">Email Address</label>
            <input 
              required
              type="email" placeholder="name@company.com" 
              className="w-full p-4 border border-gray-100 rounded-2xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-2">Password</label>
            <input 
              required
              type="password" placeholder="••••••••" 
              className="w-full p-4 border border-gray-100 rounded-2xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-blue-600 text-white p-5 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:bg-gray-300 mt-4"
          >
            {loading ? 'AUTHENTICATING...' : 'SIGN IN'}
          </button>
        </div>
        
        <p className="text-center text-[10px] text-gray-300 font-bold uppercase tracking-widest mt-8">
          Secured by Supabase Auth & RLS
        </p>
      </form>
    </div>
  )
}