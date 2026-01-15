'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function Switchboard() {
  const [organizations, setOrganizations] = useState<any[]>([])
  const [selectedOrgId, setSelectedOrgId] = useState<string>('')
  const [role, setRole] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false) // Added to prevent hydration flickering
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const loadSwitchboard = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, organization_id')
        .eq('id', user.id)
        .single()
      
      if (error) console.error("Switchboard profile fetch error:", error)
      
      const userRole = profile?.role || 'seller'
      
      // DEBUG: Look at your browser console (F12 or Cmd+Opt+J) to see this!
      console.log("Current Auth User ID:", user.id)
      console.log("Fetched Role from Profiles Table:", userRole)
      
      setRole(userRole)

      let orgData = []
      if (userRole === 'admin') {
        const { data } = await supabase.from('organizations').select('*').order('name')
        orgData = data || []
      } else {
        const { data } = await supabase.from('organizations').select('*').eq('id', profile?.organization_id)
        orgData = data || []
      }
      setOrganizations(orgData)

      const saved = localStorage.getItem('selected_org_id')
      if (saved && orgData.find(o => o.id === saved)) {
        setSelectedOrgId(saved)
      } else if (orgData.length > 0) {
        setSelectedOrgId(orgData[0].id)
        localStorage.setItem('selected_org_id', orgData[0].id)
      }
    }
    loadSwitchboard()
  }, [])

  const handleSwitch = (id: string) => {
    setSelectedOrgId(id)
    localStorage.setItem('selected_org_id', id)
    window.dispatchEvent(new Event("storage"))
    router.refresh()
  }

  // Prevents the "Axe" error and keeps UI clean until mounted
  if (!mounted) return null

  return (
    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
      {/* Added htmlFor to link to the select id */}
      <label 
        htmlFor="org-switcher" 
        className="text-[9px] font-black text-gray-400 uppercase tracking-tighter"
      >
        Active Tenant
      </label>
      
      <select 
        id="org-switcher" // Match with label htmlFor
        title="Select Organization" // Added to satisfy Accessibility tools
        value={selectedOrgId}
        onChange={(e) => handleSwitch(e.target.value)}
        disabled={role !== 'admin' && organizations.length <= 1}
        className="bg-transparent text-xs font-bold text-gray-900 outline-none cursor-pointer"
      >
        {organizations.map(org => (
          <option key={org.id} value={org.id}>{org.name}</option>
        ))}
      </select>
    </div>
  )
}