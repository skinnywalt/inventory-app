'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function LandingPage() {
  const [organizations, setOrganizations] = useState<any[]>([])
  const [selectedOrg, setSelectedOrg] = useState<string>('')
  const [role, setRole] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const loadHomeData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. Get Profile/Role
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      setRole(profile?.role || 'seller')

      // 2. Get Orgs
      const { data: orgs } = await supabase.from('organizations').select('*').order('name')
      setOrganizations(orgs || [])

      // 3. Set Initial Selection from LocalStorage
      const saved = localStorage.getItem('selected_org_id')
      if (saved) {
        setSelectedOrg(saved)
      } else if (orgs && orgs.length > 0) {
        setSelectedOrg(orgs[0].id)
        localStorage.setItem('selected_org_id', orgs[0].id)
      }
    }
    loadHomeData()
  }, [])

  const handleOrgChange = (id: string) => {
    setSelectedOrg(id)
    localStorage.setItem('selected_org_id', id)
    // "Shout" to the other components that the tenant changed
    window.dispatchEvent(new Event("storage"))
    window.dispatchEvent(new CustomEvent('orgChanged', { detail: id }))
  }

  const adminModules = [
    { name: 'Dashboard', desc: 'Analytics & Revenue', href: '/dashboard', icon: '📈', color: 'bg-blue-50 text-blue-600' },
    { name: 'Inventory', desc: 'Manage Stock Levels', href: '/inventory', icon: '📦', color: 'bg-amber-50 text-amber-600' },
    { name: 'Sales Terminal', desc: 'Shipments & Billing', href: '/sales', icon: '💳', color: 'bg-emerald-50 text-emerald-600' },
    { name: 'Client Directory', desc: 'CRM Management', href: '/clients', icon: '👥', color: 'bg-purple-50 text-purple-600' },
  ]

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
        <div>
          <h1 className="text-5xl font-black tracking-tight text-gray-900 mb-2">
            System <span className="text-blue-600">Command</span>
          </h1>
          <p className="text-gray-500 font-medium italic">Welcome back, Administrator Muralles</p>
        </div>

        {/* --- THE NEW SELECTOR HUB --- */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl w-full md:w-80">
          <label htmlFor="hub-org-select" className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-3">
            Active Management Tenant
          </label>
          <select 
            id="hub-org-select"
            title="Select Organization to Manage"
            value={selectedOrg}
            onChange={(e) => handleOrgChange(e.target.value)}
            className="w-full bg-gray-50 p-3 rounded-xl border-none text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
          >
            {organizations.map(org => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminModules.map((module) => (
          <Link key={module.href} href={module.href} className="group">
            <div className="h-full p-8 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className={`w-12 h-12 ${module.color} rounded-2xl flex items-center justify-center text-xl mb-6`}>
                {module.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{module.name}</h3>
              <p className="text-xs text-gray-400 font-medium leading-relaxed">{module.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Settings Shortcut */}
      <div className="mt-12 pt-12 border-t border-gray-100 flex justify-center">
        <Link href="/settings" className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] hover:text-blue-600 transition-colors">
          ⚙️ Global System Settings
        </Link>
      </div>
    </div>
  )
}