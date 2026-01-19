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
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-4 md:p-8 font-sans">
      <div className="w-full max-w-[520px] space-y-12">
        
        <div className="text-center space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#3B82F6] opacity-90">
           Maneja inventario, ventas y clientes
          </h2>
          <h1 className="text-6xl md:text-7xl font-bold tracking-tighter text-[#111827]">
            NEXO<span className="text-[#3B82F6]">.</span>
          </h1>
        </div>

        <form 
          onSubmit={handleLogin} 
          className="bg-white px-8 md:px-14 py-16 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-10"
        >
          <div className="space-y-8">
            <div className="space-y-3">
              <label htmlFor="email" className="text-[10px] font-bold text-[#6B7280] uppercase tracking-[0.2em] ml-1">
                Correo Electrónico
              </label>
              <input 
                id="email"
                required
                type="email" 
                placeholder="nombre@correo.com" 
                className="w-full h-14 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-6 text-sm font-medium text-[#111827] focus:border-[#3B82F6] transition-all outline-none appearance-none placeholder:text-[#9CA3AF]/60"
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
            
            <div className="space-y-3">
              <label htmlFor="password" className="text-[10px] font-bold text-[#6B7280] uppercase tracking-[0.2em] ml-1">
                Contraseña
              </label>
              <input 
                id="password"
                required
                type="password" 
                placeholder="••••••••" 
                className="w-full h-14 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-6 text-sm font-medium text-[#111827] focus:border-[#3B82F6] transition-all outline-none appearance-none"
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full h-16 bg-[#111827] text-white rounded-xl font-bold text-xs tracking-[0.2em] hover:bg-[#1F2937] transition-all disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] uppercase"
          >
            {loading ? 'Validando...' : 'Inicia Sesión'}
          </button>
        </form>

        <footer className="text-center space-y-10">
          <div className="flex items-center justify-center gap-10">
            <span className="h-px w-20 bg-[#E5E7EB]"></span>
            <p className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-[0.4em]">Protocolo: RBAC</p>
            <span className="h-px w-20 bg-[#E5E7EB]"></span>
          </div>
        </footer>
      </div>
    </div>
  )
}