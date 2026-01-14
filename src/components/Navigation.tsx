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
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        setRole(profile?.role || 'seller')
      }
      setLoading(false)
    }
    fetchUserRole()
  }, [])

  if (pathname === '/login') return null

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    localStorage.clear() // Clear storage to prevent "ghost" orgs
    router.push('/login')
  }

  // NAVIGATION CONFIGURATION
  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', roles: ['admin'] },
    { name: 'Inventory', href: '/inventory', roles: ['admin', 'supervisor'] },
    { name: 'Clients', href: '/clients', roles: ['admin', 'supervisor'] },
    { name: 'Sales Terminal', href: '/sales', roles: ['admin', 'supervisor', 'seller'] },
  ]

  return (
    <nav className="border-b border-gray-200 bg-white px-6 h-16 flex items-center justify-between shadow-sm sticky top-0 z-40">
      <div className="flex items-center gap-10">
        <Link href="/" className="font-black text-xl tracking-tighter uppercase flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs">IS</div>
          InvSys <span className="text-blue-600 text-[10px] ml-1">PRO</span>
        </Link>
        
        <div className="flex gap-6">
          {/* Only show links once loading is done */}
          {!loading && navLinks.map((link) => {
            // ADMIN logic: If role is admin, show everything.
            if (role === 'admin' || (role && link.roles.includes(role))) {
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[11px] font-bold uppercase tracking-widest transition-colors ${
                    pathname === link.href ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-black'
                  } pb-1`}
                >
                  {link.name}
                </Link>
              )
            }
            return null
          })}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <Switchboard />
        <button onClick={handleSignOut} className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 px-3 py-2 rounded transition-all">
          Sign Out
        </button>
      </div>
    </nav>
  )
}