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
            <h1 className="text-4xl font-bold tracking-tight mb-2 text-[#111827]">Menu Principal</h1>
            <p className="text-[#6B7280] font-medium italic">Sesion Activa: Administrador</p>
            
            <div className="mt-8 pt-8 border-t border-[#F3F4F6]">
              <label className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest block mb-3">Organizaciones : </label>
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
            <ModuleCard title="Analiticas" href="/dashboard"/>
            <ModuleCard title="Inventario" href="/inventory"/>
            <ModuleCard title="Recibo de Envios" href="/sales"/>
            <ModuleCard title="Clientes" href="/clients"/>
          </div>
        </div>

        {/* Right Column: System Settings & Meta */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[24px] p-8 border border-[#E5E7EB] shadow-sm h-full flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold mb-6 text-[#111827]">Configuracion de Sistema</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed mb-8">

              </p>
              
              <Link href="/settings" className="block w-full">
                <div className="p-4 bg-[#F3F4F6] rounded-2xl border border-transparent hover:border-[#3B82F6] hover:bg-white transition-all text-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#111827]">Ajustes</span>
                </div>
              </Link>
            </div>

            <div className="pt-8 border-t border-[#F3F4F6]">
              <div className="flex justify-between items-center text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.2em]">
                <span>Infraestructura</span>
                <span className="text-[#3B82F6]">v1.0.4 stable</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

function ModuleCard({ title, desc, href, stats }: any) {
  return (
    <Link href={href} className="group">
      <div className="bg-white p-6 rounded-[24px] border border-[#E5E7EB] shadow-sm hover:border-[#3B82F6] transition-all flex flex-col justify-between h-36">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-[#111827] text-lg">{title}</h3>
          <span className="text-[9px] font-black uppercase tracking-widest bg-blue-50 text-[#3B82F6] px-3 py-1 rounded-full">{stats}</span>
        </div>
        <div>
          <p className="text-xs text-[#6B7280] font-medium leading-relaxed">{desc}</p>
          <p className="text-[10px] font-bold text-[#3B82F6] mt-2 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">Modulo de Acceso →</p>
        </div>
      </div>
    </Link>
  )
}