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
      {/* Increased max-width from 400px to 480px for better proportions */}
      <div className="w-full max-w-[480px] space-y-10">
        
        {/* Typographic Brand Identity */}
        <div className="text-center space-y-3">
          <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#3B82F6] opacity-80">
           Maneja inventario, ventas y clientes
          </h2>
          <h1 className="text-5xl font-bold tracking-tight text-[#111827]">
            NEXO<span className="text-[#3B82F6]">.</span>
          </h1>
        </div>

        {/* Login Container - Increased padding to p-12 for more whitespace */}
        <form 
          onSubmit={handleLogin} 
          className="bg-white p-12 rounded-[40px] border border-[#E5E7EB] shadow-sm space-y-8"
        >
          <div className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2.5">
              <label 
                htmlFor="email" 
                className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest ml-1"
              >
                Correo Electrónico
              </label>
              <input 
                id="email"
                required
                type="email" 
                placeholder="nombre@correo.com" 
                className="w-full bg-[#F3F4F6] border-none rounded-2xl px-5 py-4 text-sm font-semibold text-[#111827] focus:ring-2 focus:ring-[#3B82F6] transition-all outline-none appearance-none placeholder:text-[#9CA3AF]/50"
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
            
            {/* Password Field */}
            <div className="space-y-2.5">
              <label 
                htmlFor="password" 
                className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest ml-1"
              >
                Contraseña
              </label>
              <input 
                id="password"
                required
                type="password" 
                placeholder="••••••••" 
                className="w-full bg-[#F3F4F6] border-none rounded-2xl px-5 py-4 text-sm font-semibold text-[#111827] focus:ring-2 focus:ring-[#3B82F6] transition-all outline-none appearance-none"
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-[#3B82F6] text-white py-5 rounded-2xl font-bold text-sm tracking-widest hover:bg-[#2563EB] active:scale-[0.97] transition-all disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] shadow-sm uppercase"
          >
            {loading ? 'Validando...' : 'Inicia Sesión'}
          </button>
        </form>

        {/* System Meta */}
        <footer className="text-center space-y-6">
          <div className="flex items-center justify-center gap-6">
            <span className="h-px w-12 bg-[#E5E7EB]"></span>
            <p className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-[0.2em]">
              Protocolo: RBAC
            </p>
            <span className="h-px w-12 bg-[#E5E7EB]"></span>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-[#D1D5DB] font-bold uppercase tracking-widest">
              Solo Personal Autorizado
            </p>
            <p className="text-[9px] text-[#D1D5DB] font-medium uppercase tracking-tighter">
              Monitoreo de acceso inautorizado activo
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}