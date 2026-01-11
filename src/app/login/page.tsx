'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const supabase = createClient()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert(error.message)
    else router.push('/inventory')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleLogin} className="p-10 bg-white rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
        <h1 className="text-3xl font-black mb-6 tracking-tighter">Login to <span className="text-blue-600">InvSys</span></h1>
        <div className="space-y-4">
          <input 
            type="email" placeholder="Email" 
            className="w-full p-4 border rounded-2xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            type="password" placeholder="Password" 
            className="w-full p-4 border rounded-2xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setPassword(e.target.value)} 
          />
          <button className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg">
            Sign In
          </button>
        </div>
      </form>
    </div>
  )
}