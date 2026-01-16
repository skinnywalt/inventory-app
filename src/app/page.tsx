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
    { name: 'Analytics', desc: 'Real-time revenue & metrics', href: '/dashboard', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
    { name: 'Inventory', desc: 'Stock control & bulk management', href: '/inventory', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { name: 'Shipments', desc: 'POS Terminal & invoicing', href: '/sales', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { name: 'Customers', desc: 'Client directory & history', href: '/clients', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
  ]

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] px-6 py-12 lg:py-20">
      <div className="max-w-[1100px] mx-auto">
        
        {/* Header Composition */}
        <header className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight text-[#111827]">Command Center</h1>
            <p className="text-[#6B7280] text-sm font-medium">Monitoring multi-tenant infrastructure</p>
          </div>

          {/* Tenant Selector Card */}
          <div className="w-full md:w-72 bg-white border border-[#E5E7EB] rounded-xl p-1.5 shadow-sm">
            <div className="px-3 pt-2 pb-1">
              <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Active Organization</span>
            </div>
            <select 
              value={selectedOrg}
              onChange={(e) => handleOrgChange(e.target.value)}
              className="w-full bg-transparent px-3 py-2 text-sm font-semibold focus:outline-none cursor-pointer"
            >
              {organizations.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>
        </header>

        {/* Module Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {isSyncing ? (
            // Skeleton Loader State
            [...Array(4)].map((_, i) => (
              <div key={i} className="h-44 bg-white border border-[#E5E7EB] rounded-xl animate-pulse" />
            ))
          ) : (
            modules.map((m) => (
              <Link key={m.href} href={m.href} className="group">
                <div className="h-44 p-6 bg-white border border-[#E5E7EB] rounded-xl shadow-sm hover:border-[#3B82F6] hover:shadow-md transition-all duration-200 flex flex-col justify-between">
                  <div className="space-y-4">
                    <svg className="w-6 h-6 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={m.icon} />
                    </svg>
                    <div>
                      <h3 className="text-sm font-semibold text-[#111827]">{m.name}</h3>
                      <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">{m.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-[10px] font-bold uppercase text-[#3B82F6] tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                    Open Module 
                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Footer Settings */}
        <footer className="mt-12 pt-8 border-t border-[#E5E7EB] flex justify-between items-center">
          <p className="text-[11px] font-medium text-[#6B7280]">v1.0.4 Production Build</p>
          <Link href="/settings" className="flex items-center gap-2 text-[11px] font-bold text-[#6B7280] hover:text-[#3B82F6] transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            System Settings
          </Link>
        </footer>
      </div>
    </div>
  )
}