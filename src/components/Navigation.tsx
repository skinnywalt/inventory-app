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
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setLoading(false)
          return
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (error) throw error
        setRole(profile?.role || 'seller')
      } catch (err) {
        console.error("Nav Error:", err)
        setRole('seller') // Safe fallback
      } finally {
        setLoading(false)
      }
    }
    fetchUserRole()
  }, [])

  if (pathname === '/login') return null

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/login')
  }

  // DEFINITION OF ACCESSIBLE LINKS
  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', roles: ['admin'] },
    { name: 'Inventory', href: '/inventory', roles: ['admin', 'supervisor'] },
    { name: 'Clients', href: '/clients', roles: ['admin', 'supervisor'] },
    { name: 'Sales Terminal', href: '/sales', roles: ['admin', 'supervisor', 'seller'] },
  ]

  return (
    <nav className="border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-40">
      <div className="flex items-center gap-10">
        <Link href={role === 'seller' ? '/sales' : '/dashboard'} className="flex items-center gap-2">
           <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
             <span className="text-white font-black text-xs">IS</span>
           </div>
           <span className="font-black text-xl tracking-tighter uppercase">InvSys</span>
        </Link>
        
        <div className="flex gap-6">
          {!loading && navLinks.map((link) => {
            // ADMIN sees everything, others filtered by roles array
            if (role === 'admin' || (role && link.roles.includes(role))) {
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[11px] font-bold uppercase tracking-widest transition-colors ${
                    pathname === link.href ? 'text-blue-600' : 'text-gray-400 hover:text-black'
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
        {/* Visual Badge for debugging your role */}
        {role && (
          <span className="text-[9px] bg-gray-100 px-2 py-1 rounded-full font-bold uppercase text-gray-500 tracking-tighter">
            Mode: {role}
          </span>
        )}
        
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