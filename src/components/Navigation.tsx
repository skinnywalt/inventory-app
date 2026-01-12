'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation' // Added useRouter
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Switchboard from './Switchboard'

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)
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
    }
    fetchUserRole()
  }, [])

  // MOVED: Conditional check must be after hooks
  if (pathname === '/login') return null;

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', roles: ['admin', 'supervisor', 'seller'] },
    { name: 'Inventory', href: '/inventory', roles: ['admin', 'supervisor'] },
    { name: 'Clients', href: '/clients', roles: ['admin', 'supervisor'] },
    { name: 'Sales Terminal', href: '/sales', roles: ['admin', 'supervisor', 'seller'] },
  ]

  return (
    <nav className="border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-40">
      <div className="flex items-center gap-10">
        <Link href="/dashboard" className="text-sm font-black tracking-tighter uppercase">
          ISINVSYS <span className="text-blue-600">PRO</span>
        </Link>
        
        <div className="flex gap-6">
          {navLinks.map((link) => {
            if (role && link.roles.includes(role)) {
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[11px] font-bold uppercase tracking-widest transition-colors ${
                    pathname === link.href ? 'text-black' : 'text-gray-400 hover:text-black'
                  }`}
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
        <button 
          onClick={handleSignOut}
          className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors border-l pl-6 border-gray-200"
        >
          Sign Out
        </button>
      </div>
    </nav>
  )
}