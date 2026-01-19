'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function CompanyManager() {
  const [organizations, setOrganizations] = useState<any[]>([])
  const [newOrgName, setNewOrgName] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const fetchOrgs = async () => {
    const { data } = await supabase.from('organizations').select('*').order('name')
    if (data) setOrganizations(data)
  }

  useEffect(() => {
    fetchOrgs()
  }, [])

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newOrgName) return
    setLoading(true)
    const { error } = await supabase.from('organizations').insert([{ name: newOrgName }])
    if (error) alert("Error: " + error.message)
    else {
      setNewOrgName('')
      fetchOrgs()
    }
    setLoading(false)
  }

  const handleDelete = async (id: string, name: string) => {
    const warning = `¿Confirmar eliminación de "${name}"?\n\n• Se eliminarán productos y ventas.\n• Usuarios perderán acceso.`;
    if (!confirm(warning)) return
    setLoading(true)
    const { error } = await supabase.from('organizations').delete().eq('id', id)
    if (error) alert(`Error: ${error.message}`)
    else fetchOrgs()
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6 md:p-10 font-sans text-[#111827]">
      <div className="max-w-[1000px] mx-auto space-y-10">
        
        <div className="space-y-1">
          <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#9CA3AF] hover:text-[#3B82F6] transition-all group mb-2">
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Menu Principal
          </Link>
          <h1 className="text-4xl font-bold tracking-tight text-[#111827]">Ajustes de Sistema</h1>
        </div>

        {/* Square Grayish Registrar Box */}
        <section className="bg-white p-12 border border-[#E5E7EB] rounded-md shadow-sm">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-[#3B82F6] mb-8">Nueva Organización</h2>
          <form onSubmit={handleAddCompany} className="flex flex-col md:flex-row gap-4">
            <input 
              type="text" 
              placeholder="Nombre de la entidad..."
              className="flex-1 h-14 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-6 text-sm font-medium text-[#111827] focus:border-[#3B82F6] outline-none transition-all"
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
            />
            <button 
              type="submit"
              disabled={loading || !newOrgName}
              className="bg-[#111827] text-white px-12 h-14 rounded-lg font-bold text-xs tracking-widest uppercase hover:bg-[#1F2937] transition-all shadow-sm"
            >
              {loading ? 'Procesando...' : 'Registrar'}
            </button>
          </form>
        </section>

        {/* Clean Organizations List */}
        <section className="bg-white border border-[#E5E7EB] rounded-md shadow-sm overflow-hidden">
          <div className="px-8 py-5 border-b border-[#E5E7EB] bg-[#F9FAFB]">
            <h2 className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest">Organizaciones Activas</h2>
          </div>
          <div className="divide-y divide-[#F3F4F6]">
            {organizations.map((org) => (
              <div key={org.id} className="px-8 py-6 flex justify-between items-center hover:bg-[#F9FAFB] transition-colors group">
                <h3 className="text-sm font-bold text-[#111827]">{org.name}</h3>
                <button onClick={() => handleDelete(org.id, org.name)} className="p-3 text-[#E5E7EB] hover:text-red-600 transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}