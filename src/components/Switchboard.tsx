'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function Switchboard() {
  const [organizations, setOrganizations] = useState<any[]>([])
  const [selectedOrgId, setSelectedOrgId] = useState<string>('')
  const [mounted, setMounted] = useState(false)
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const fetchOrgs = async () => {
      const { data } = await supabase.from('organizations').select('*').order('name')
      if (data) {
        setOrganizations(data)
        const saved = localStorage.getItem('selected_org_id')
        if (saved) {
          setSelectedOrgId(saved)
        } else if (data.length > 0) {
          setSelectedOrgId(data[0].id)
          localStorage.setItem('selected_org_id', data[0].id)
        }
      }
    }
    fetchOrgs()
  }, [])

  const handleSwitch = (id: string) => {
    // 1. Update local state
    setSelectedOrgId(id)
    
    // 2. Update persistent storage
    localStorage.setItem('selected_org_id', id)

    // 3. THE "SHOUT": Manually trigger the storage event for the same window.
    // This tells our Inventory, Sales, and Dashboard pages to re-run their fetch functions.
    window.dispatchEvent(new Event("storage"))

    // 4. Refresh server-side data for the new organization
    router.refresh()
  }

  // Prevent hydration mismatch on MacBook Air M2 high-res display
  if (!mounted) return <div className="h-8 w-48 bg-gray-100 animate-pulse rounded-sm border border-gray-200"></div>

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="org-select" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        Org:
      </label>
      <div className="border border-gray-300 rounded-sm px-2 py-1 bg-white hover:border-gray-400 transition-all shadow-sm">
        <select
          id="org-select"
          aria-label="Select Company"
          value={selectedOrgId}
          onChange={(e) => handleSwitch(e.target.value)}
          className="bg-transparent font-bold text-xs text-gray-900 focus:outline-none cursor-pointer pr-1"
        >
          {organizations.length === 0 ? (
            <option value="">No Companies</option>
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