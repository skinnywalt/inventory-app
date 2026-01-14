'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function Switchboard() {
  const [organizations, setOrganizations] = useState<any[]>([])
  const [selectedOrgId, setSelectedOrgId] = useState<string>('')
  const [mounted, setMounted] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  
  const supabase = createClient()
  const router = useRouter()

  // We use useCallback to ensure the fetch logic is stable
  const initSwitchboard = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, organization_id')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'seller'
    setUserRole(role)

    let orgData = []
    if (role === 'admin') {
      const { data } = await supabase.from('organizations').select('*').order('name')
      orgData = data || []
    } else {
      const { data } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profile?.organization_id)
      orgData = data || []
    }

    setOrganizations(orgData)

    // LOGIC FIX: Determine which Org ID to show
    const saved = localStorage.getItem('selected_org_id')
    
    if (role !== 'admin' && profile?.organization_id) {
      // Force Seller to their assigned org
      setSelectedOrgId(profile.organization_id)
      localStorage.setItem('selected_org_id', profile.organization_id)
    } else if (saved && orgData.some(o => o.id === saved)) {
      // If Admin has a saved valid ID, keep it
      setSelectedOrgId(saved)
    } else if (orgData.length > 0) {
      // Fallback to first available
      setSelectedOrgId(orgData[0].id)
      localStorage.setItem('selected_org_id', orgData[0].id)
    }
  }, [supabase])

  useEffect(() => {
    setMounted(true)
    initSwitchboard()
  }, [initSwitchboard])

  const handleSwitch = (id: string) => {
    if (!id) return
    
    // 1. Update State immediately for UI responsiveness
    setSelectedOrgId(id)
    
    // 2. Persist to localStorage
    localStorage.setItem('selected_org_id', id)

    // 3. Trigger global update for other components (Inventory/Sales)
    window.dispatchEvent(new Event("storage"))

    // 4. Force Next.js to re-fetch Server Component data
    router.refresh()
  }

  if (!mounted) return <div className="h-8 w-48 bg-gray-100 animate-pulse rounded-sm border border-gray-200"></div>

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="org-select" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        {userRole === 'admin' ? 'Switch Org:' : 'Company:'}
      </label>
      <div className={`border rounded-sm px-2 py-1 bg-white transition-all shadow-sm ${
        userRole === 'admin' ? 'border-blue-400 ring-1 ring-blue-50' : 'border-gray-200'
      }`}>
        <select
          id="org-select"
          disabled={userRole !== 'admin'}
          value={selectedOrgId}
          onChange={(e) => handleSwitch(e.target.value)}
          className={`bg-transparent font-bold text-xs focus:outline-none cursor-pointer pr-1 ${
            userRole === 'admin' ? 'text-blue-700' : 'text-gray-900'
          }`}
        >
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}