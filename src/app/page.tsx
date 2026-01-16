'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function CommandCenter() {
  const [organizations, setOrganizations] = useState<any[]>([])
  const [selectedOrg, setSelectedOrg] = useState<string>('')
  const [role, setRole] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      setRole(profile?.role || 'seller')
      const { data: orgs } = await supabase.from('organizations').select('*').order('name')
      setOrganizations(orgs || [])
      const saved = localStorage.getItem('selected_org_id')
      if (saved) setSelectedOrg(saved)
      else if (orgs?.length) {
        setSelectedOrg(orgs[0].id)
        localStorage.setItem('selected_org_id', orgs[0].id)
      }
      setIsSyncing(false)
    }
    loadData()
  }, [])

  const handleOrgChange = (id: string) => {
    setSelectedOrg(id)
    localStorage.setItem('selected_org_id', id)
    window.dispatchEvent(new CustomEvent('orgChanged', { detail: id }))
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-4 md:p-8 font-sans text-[#111827]">
      <div className="max-w-[1400px] mx-auto grid grid-cols-12 gap-6">
        
        {/* Left Column: Welcome & Tenant Selector */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-white rounded-[24px] p-8 border border-[#E5E7EB] shadow-sm">
            <h1 className="text-4xl font-bold tracking-tight mb-2">Command Center</h1>
            <p className="text-[#6B7280] font-medium">Welcome back, Administrator</p>
            
            <div className="mt-8 pt-8 border-t border-[#F3F4F6]">
              <label className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest block mb-3">Active Organization</label>
              <select 
                value={selectedOrg}
                onChange={(e) => handleOrgChange(e.target.value)}
                className="w-full md:w-80 bg-[#F3F4F6] border-none rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-[#3B82F6] outline-none cursor-pointer appearance-none"
              >
                {organizations.map(org => <option key={org.id} value={org.id}>{org.name}</option>)}
              </select>
            </div>
          </div>

          {/* Module Grid (Bento Style) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ModuleCard title="Analytics" desc="Monitor performance & revenue" href="/dashboard" icon="📈" stats="$24.5k total" />
            <ModuleCard title="Inventory" desc="Manage 3,000+ SKU items" href="/inventory" icon="📦" stats="12 low stock" />
            <ModuleCard title="Shipments" desc="Terminal & Invoicing" href="/sales" icon="💳" stats="Ready" />
            <ModuleCard title="Customers" desc="CRM & Directory" href="/clients" icon="👥" stats="Active" />
          </div>
        </div>

        {/* Right Column: Mini-Stats / Recent Activity */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[24px] p-6 border border-[#E5E7EB] shadow-sm h-full">
            <h3 className="text-lg font-bold mb-6">Popular items</h3>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-2 hover:bg-[#F9FAFB] rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#F3F4F6] rounded-lg flex items-center justify-center text-lg">📦</div>
                    <div>
                      <p className="text-sm font-bold">Product Item #{i}</p>
                      <p className="text-[10px] text-green-600 font-bold uppercase">Active</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold">$1,200.00</p>
                </div>
              ))}
            </div>
            <Link href="/inventory" className="block text-center mt-8 py-3 bg-[#F3F4F6] rounded-xl text-xs font-bold hover:bg-[#E5E7EB] transition-colors">
              All products
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}

function ModuleCard({ title, desc, href, icon, stats }: any) {
  return (
    <Link href={href} className="group">
      <div className="bg-white p-6 rounded-[24px] border border-[#E5E7EB] shadow-sm hover:border-[#3B82F6] transition-all flex items-start gap-4 h-32">
        <div className="w-12 h-12 bg-[#F3F4F6] rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">{icon}</div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-[#111827]">{title}</h3>
            <span className="text-[10px] font-bold bg-blue-50 text-[#3B82F6] px-2 py-0.5 rounded-full">{stats}</span>
          </div>
          <p className="text-xs text-[#6B7280] mt-1">{desc}</p>
        </div>
      </div>
    </Link>
  )
}