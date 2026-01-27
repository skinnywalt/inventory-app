'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    
    if (authError) {
      setError(authError.message)
      setLoading(false)
    } else {
      router.refresh() 
      router.push('/') 
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8 font-sans">
      <div className="w-full max-w-110">
        
        {/* Logo Section */}
        <div className="text-center mb-10 space-y-4">
          <div className="inline-flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-primary rounded-[22px] flex items-center justify-center shadow-xl shadow-primary/30">
              <span className="text-white font-bold text-3xl">N</span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-foreground">NEXO</h1>
          </div>
          <p className="text-sm font-medium text-gray-500">
            Maneja inventario, ventas y clientes
          </p>
        </div>

        {/* Card using Oripio Radius */}
        <div className="bg-white rounded-[32px] p-10 shadow-2xl shadow-gray-200/40 border border-gray-100">
          <form onSubmit={handleLogin} className="space-y-8">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-[10px] font-bold text-red-500 uppercase text-center tracking-wider">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-bold text-foreground uppercase tracking-widest ml-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                  <input 
                    required
                    type="email" 
                    className="w-full h-14 bg-background border-2 border-transparent rounded-2xl px-14 text-sm font-bold text-foreground focus:border-primary focus:bg-white transition-all outline-none"
                    placeholder="tu@email.com"
                    onChange={(e) => setEmail(e.target.value)} 
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-xs font-bold text-foreground uppercase tracking-widest ml-1">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                  <input 
                    required
                    type={showPassword ? 'text' : 'password'} 
                    className="w-full h-14 bg-background border-2 border-transparent rounded-2xl px-14 text-sm font-bold text-foreground focus:border-primary focus:bg-white transition-all outline-none"
                    placeholder="••••••••"
                    onChange={(e) => setPassword(e.target.value)} 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full h-16 bg-primary text-white rounded-2xl font-black text-sm tracking-[0.1em] hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin mx-auto" /> : 'INICIAR SESIÓN'}
            </button>
          </form>
        </div>
        
        <footer className="text-center mt-10">
          <p className="text-xs text-gray-400">© 2026 NEXO. Todos los derechos reservados.</p>
        </footer>
      </div>
    </div>
  )
}