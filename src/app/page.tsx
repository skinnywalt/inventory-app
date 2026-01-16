'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function LandingPage() {
  const [organizations, setOrganizations] = useState<any[]>([])
  const [selectedOrg, setSelectedOrg] = useState<string>('')
  const [role, setRole] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const loadHomeData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      setRole(profile?.role || 'seller')

      const { data: orgs } = await supabase.from('organizations').select('*').order('name')
      setOrganizations(orgs || [])

      const saved = localStorage.getItem('selected_org_id')
      if (saved) {
        setSelectedOrg(saved)
      } else if (orgs && orgs.length > 0) {
        setSelectedOrg(orgs[0].id)
        localStorage.setItem('selected_org_id', orgs[0].id)
      }
      setIsSyncing(false)
    }
    loadHomeData()
  }, [])

  const handleOrgChange = (id: string) => {
    setSelectedOrg(id)
    localStorage.setItem('selected_org_id', id)
    window.dispatchEvent(new Event("storage"))
    window.dispatchEvent(new CustomEvent('orgChanged', { detail: id }))
  }

  const modules = [
    { name: 'Analytics', desc: 'Performance metrics', href: '/dashboard', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
    { name: 'Inventory', desc: 'Stock & SKU control', href: '/inventory', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { name: 'Shipments', desc: 'Terminal & Billing', href: '/sales', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { name: 'Customers', desc: 'CRM Directory', href: '/clients', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
  ]

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] p-6 lg:p-10 font-sans">
      <div className="max-w-[1400px] mx-auto grid grid-cols-12 gap-6">
        
        {/* Primary Command Section */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-white rounded-[24px] p-8 border border-[#E5E7EB] shadow-sm">
            <h1 className="text-3xl font-semibold tracking-tight text-[#111827] mb-1">Command Center</h1>
            <p className="text-[#6B7280] text-sm mb-8">System status: <span className="text-[#10B981] font-bold">Active</span></p>
            
            <div className="w-full md:w-80 space-y-2">
              <label htmlFor="org-select" className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Selected Organization</label>
              <select 
                id="org-select"
                value={selectedOrg}
                onChange={(e) => handleOrgChange(e.target.value)}
                className="w-full bg-[#F3F4F6] border-none rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-[#3B82F6] transition-all outline-none cursor-pointer appearance-none"
              >
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Module Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modules.map((m) => (
              <Link key={m.href} href={m.href} className="group">
                <div className="h-40 p-6 bg-white border border-[#E5E7EB] rounded-[24px] shadow-sm hover:border-[#3B82F6] transition-all flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 bg-[#F3F4F6] rounded-xl flex items-center justify-center text-[#3B82F6]">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={m.icon} />
                      </svg>
                    </div>
                    <svg className="w-4 h-4 text-[#E5E7EB] group-hover:text-[#3B82F6] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="3"/></svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#111827]">{m.name}</h3>
                    <p className="text-xs text-[#6B7280] mt-0.5">{m.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* System Settings & Meta Column */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[24px] p-6 border border-[#E5E7EB] shadow-sm h-full flex flex-col justify-between">
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-[#111827] uppercase tracking-wider">System Configuration</h3>
              
              <Link href="/settings" className="group flex items-center justify-between p-4 bg-[#F9FAFB] rounded-2xl hover:bg-white border border-transparent hover:border-[#E5E7EB] transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-white border border-[#E5E7EB] rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  </div>
                  <span className="text-xs font-bold text-[#111827]">Organization Manager</span>
                </div>
                <svg className="w-4 h-4 text-[#E5E7EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="3"/></svg>
              </Link>
            </div>

            <div className="pt-6 border-t border-[#F3F4F6]">
              <div className="flex justify-between items-center text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest">
                <span>Infrastructure</span>
                <span>v1.0.4</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}