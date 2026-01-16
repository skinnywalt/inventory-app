'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function Switchboard() {
  const [organizations, setOrganizations] = useState<any[]>([])
  const [selectedOrgId, setSelectedOrgId] = useState<string>('')
  const [role, setRole] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const loadSwitchboard = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, organization_id')
        .eq('id', user.id)
        .single()

      const userRole = profile?.role || 'seller'
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

      // --- LOGIC FIX START ---
      const saved = localStorage.getItem('selected_org_id')
      let finalId = ''

      if (userRole === 'admin') {
        if (saved && orgData.some(o => o.id === saved)) {
          finalId = saved
        } else if (orgData.length > 0) {
          finalId = orgData[0].id
        }
      } else {
        finalId = profile?.organization_id || ''
      }

      if (finalId) {
        setSelectedOrgId(finalId)
        localStorage.setItem('selected_org_id', finalId)
        
        // Trigger both standard and custom events so pages wake up
        window.dispatchEvent(new Event("storage"))
        window.dispatchEvent(new CustomEvent('orgChanged', { detail: finalId }))
      }
      // --- LOGIC FIX END ---
    }
    loadSwitchboard()
  }, [])

  const handleSwitch = (id: string) => {
    if (!id) return
    setSelectedOrgId(id)
    localStorage.setItem('selected_org_id', id)
    
    // Shout to other tabs and current tab
    window.dispatchEvent(new Event("storage"))
    window.dispatchEvent(new CustomEvent('orgChanged', { detail: id }))
    
    router.refresh()
  }

  if (!mounted) return null

  return (
    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
      <label htmlFor="org-switcher" className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">
        Active Tenant
      </label>
      
      <select 
        id="org-switcher" 
        title="Select Organization"
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