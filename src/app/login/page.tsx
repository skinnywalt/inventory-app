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
      {/* Container width remains 480px for a solid desktop presence */}
      <div className="w-full max-w-[480px] space-y-12">
        
        {/* Typographic Brand Identity */}
        <div className="text-center space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#3B82F6] opacity-90">
           Maneja inventario, ventas y clientes
          </h2>
          <h1 className="text-6xl font-bold tracking-tighter text-[#111827]">
            NEXO<span className="text-[#3B82F6]">.</span>
          </h1>
        </div>

        {/* Main Login Box */}
        <form 
          onSubmit={handleLogin} 
          className="bg-white px-12 py-14 rounded-2xl border border-[#E5E7EB] shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-10"
        >
          <div className="space-y-8">
            {/* Email Field */}
            <div className="space-y-3">
              <label 
                htmlFor="email" 
                className="text-[10px] font-bold text-[#6B7280] uppercase tracking-[0.15em] ml-1"
              >
                Correo Electrónico
              </label>
              <input 
                id="email"
                required
                type="email" 
                placeholder="nombre@correo.com" 
                className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-5 py-4 text-sm font-medium text-[#111827] focus:border-[#3B82F6] focus:ring-4 focus:ring-[#3B82F6]/5 transition-all outline-none appearance-none placeholder:text-[#9CA3AF]/60"
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
            
            {/* Password Field */}
            <div className="space-y-3">
              <label 
                htmlFor="password" 
                className="text-[10px] font-bold text-[#6B7280] uppercase tracking-[0.15em] ml-1"
              >
                Contraseña
              </label>
              <input 
                id="password"
                required
                type="password" 
                placeholder="••••••••" 
                className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-5 py-4 text-sm font-medium text-[#111827] focus:border-[#3B82F6] focus:ring-4 focus:ring-[#3B82F6]/5 transition-all outline-none appearance-none"
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-[#111827] text-white py-5 rounded-xl font-bold text-xs tracking-[0.2em] hover:bg-[#1F2937] active:scale-[0.98] transition-all disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] shadow-md shadow-gray-200/50 uppercase"
          >
            {loading ? 'Validando...' : 'Inicia Sesión'}
          </button>
        </form>

        {/* System Meta */}
        <footer className="text-center space-y-8">
          <div className="flex items-center justify-center gap-8">
            <span className="h-px w-16 bg-[#E5E7EB]"></span>
            <p className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-[0.3em]">
              Protocolo: RBAC
            </p>
            <span className="h-px w-16 bg-[#E5E7EB]"></span>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-widest">
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