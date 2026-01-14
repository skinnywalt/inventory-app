'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function Switchboard() {
  const [organizations, setOrganizations] = useState<any[]>([])
  const [selectedOrgId, setSelectedOrgId] = useState<string>('')
  const [mounted, setMounted] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const fetchOrgsAndRole = async () => {
      // 1. Get the current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 2. Fetch the user's role and assigned organization from profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, organization_id')
        .eq('id', user.id)
        .single()

      const role = profile?.role || 'seller'
      setUserRole(role)

      // 3. Logic to fetch Organizations
      let orgData = []
      if (role === 'admin') {
        // Admin: Load everything so you can switch between any company
        const { data } = await supabase.from('organizations').select('*').order('name')
        orgData = data || []
      } else {
        // Seller/Supervisor: Only load their assigned organization
        const { data } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', profile?.organization_id)
        orgData = data || []
      }

      setOrganizations(orgData)

      // 4. Persistence logic
      const saved = localStorage.getItem('selected_org_id')
      
      // If admin has a saved selection, use it. 
      // If seller, force them to their assigned org regardless of localstorage.
      if (role !== 'admin' && profile?.organization_id) {
        setSelectedOrgId(profile.organization_id)
        localStorage.setItem('selected_org_id', profile.organization_id)
      } else if (saved && orgData.some(o => o.id === saved)) {
        setSelectedOrgId(saved)
      } else if (orgData.length > 0) {
        setSelectedOrgId(orgData[0].id)
        localStorage.setItem('selected_org_id', orgData[0].id)
      }
    }

    fetchOrgsAndRole()
  }, [])

  const handleSwitch = (id: string) => {
    setSelectedOrgId(id)
    localStorage.setItem('selected_org_id', id)
    window.dispatchEvent(new Event("storage"))
    router.refresh()
  }

  if (!mounted) return <div className="h-8 w-48 bg-gray-100 animate-pulse rounded-sm border border-gray-200"></div>

  // If there's only one org and the user isn't an admin, we could hide the dropdown entirely
  // But for now, we'll just keep it locked to that one choice.
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="org-select" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        {userRole === 'admin' ? 'Switch Org:' : 'Company:'}
      </label>
      <div className={`border rounded-sm px-2 py-1 bg-white transition-all shadow-sm ${
        userRole === 'admin' ? 'border-blue-300 hover:border-blue-500' : 'border-gray-200'
      }`}>
        <select
          id="org-select"
          disabled={userRole !== 'admin' && organizations.length <= 1}
          value={selectedOrgId}
          onChange={(e) => handleSwitch(e.target.value)}
          className={`bg-transparent font-bold text-xs focus:outline-none cursor-pointer pr-1 ${
            userRole === 'admin' ? 'text-blue-600' : 'text-gray-900'
          }`}
        >
          {organizations.length === 0 ? (
            <option value="">Access Denied</option>
          ) : (
            organizations.map((org) => (
              <option key={org.id} value={org.id} className="text-gray-900">
                {org.name}
              </option>
            ))
          )}
        </select>
      </div>
    </div>
  )
}