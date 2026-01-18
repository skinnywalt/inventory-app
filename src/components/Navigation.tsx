'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Switchboard from './Switchboard'

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Use .single() to get the specific profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (!error && profile) {
          setRole(profile.role)
          console.log("Navigation detected role:", profile.role)
        }
      }
    }
    fetchUserRole()
  }, [])

  if (pathname === '/login') return null

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('selected_org_id') 
    router.refresh()
    router.push('/login')
  }

  // NAVIGATION CONFIGURATION
  const navLinks = [
    { name: 'Homepage', href: '/', roles: ['admin']},
  ]

  return (
    <nav className="border-b border-gray-100 bg-white px-8 h-16 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-8">
        {/* The Logo: Acts as the "Homepage" button for Admin */}
        <Link href={role === 'admin' ? '/' : '/'} className="font-black text-xl tracking-tighter uppercase flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs">IS</div>
          NEXO <span className="text-blue-600 text-[10px] ml-1"></span>
        </Link>
        
        {/* Only Admin sees the explicit 'Command Center' text link */}
        {role === 'admin' && (
          <Link href="/" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors">
            Command Center
          </Link>
        )}
      </div>

      <div className="flex items-center gap-6">
        
        <button onClick={handleSignOut} className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 px-3 py-2 rounded transition-all">
          Finalizar Sesion
        </button>
      </div>
    </nav>
  )
}