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

    const { error } = await supabase
      .from('organizations')
      .insert([{ name: newOrgName }])

    if (error) {
      alert("Error: " + error.message)
    } else {
      setNewOrgName('')
      fetchOrgs()
    }
    setLoading(false)
  }

  const handleDelete = async (id: string, name: string) => {
    // Standardizing the warning to match NEXO professionalism
    if (!confirm(`¿Confirmar eliminación de "${name}"? Esta acción borrará permanentemente todos los productos y registros vinculados.`)) return
    
    setLoading(true)
    const { error } = await supabase.from('organizations').delete().eq('id', id)
    
    if (error) {
      // If this fails, it's likely due to linked data without "CASCADE" set
      alert(`Error de Base de Datos: ${error.message}. Asegúrese de que no existan registros vinculados.`)
    } else {
      fetchOrgs()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6 md:p-10 font-sans text-[#111827]">
      <div className="max-w-[1000px] mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="space-y-1">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#9CA3AF] hover:text-[#3B82F6] transition-all group mb-2"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> 
            Menu Principal
          </Link>
          <h1 className="text-4xl font-bold tracking-tight text-[#111827]">Ajustes de Sistema</h1>
          <p className="text-[#6B7280] text-sm font-medium">Gestión de organizaciones y estructura multi-inquilino</p>
        </div>

        {/* Add Section - Square Bento Style */}
        <section className="bg-white p-10 border border-[#E5E7EB] rounded-md shadow-sm">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-[#3B82F6] mb-6">Nueva Organización</h2>
          <form onSubmit={handleAddCompany} className="flex flex-col md:flex-row gap-4">
            <input 
              type="text" 
              placeholder="Nombre de la entidad..."
              className="flex-1 h-14 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-5 text-sm font-medium text-[#111827] focus:border-[#3B82F6] focus:ring-4 focus:ring-[#3B82F6]/5 outline-none transition-all"
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
            />
            <button 
              type="submit"
              disabled={loading || !newOrgName}
              className="bg-[#3B82F6] text-white px-10 h-14 rounded-lg font-bold text-xs tracking-widest uppercase hover:bg-[#2563EB] disabled:bg-gray-200 transition-all shadow-sm"
            >
              {loading ? 'Procesando...' : 'Registrar'}
            </button>
          </form>
        </section>

        {/* List Section - Square NEXO Table */}
        <section className="bg-white border border-[#E5E7EB] rounded-md shadow-sm overflow-hidden">
          <div className="px-8 py-5 border-b border-[#E5E7EB] bg-[#F9FAFB]">
            <h2 className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest">Organizaciones Activas</h2>
          </div>
          <div className="divide-y divide-[#F3F4F6]">
            {organizations.length > 0 ? (
              organizations.map((org) => (
                <div key={org.id} className="px-8 py-6 flex justify-between items-center hover:bg-[#F9FAFB] transition-colors group">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-[#111827]">{org.name}</h3>
                    <code className="text-[10px] bg-[#F3F4F6] text-[#6B7280] px-2 py-0.5 rounded font-mono">
                      REF: {org.id.split('-')[0]}...
                    </code>
                  </div>
                  <button 
                    onClick={() => handleDelete(org.id, org.name)}
                    className="p-3 text-[#E5E7EB] hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Eliminar Organización"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))
            ) : (
              <div className="p-20 text-center">
                <p className="text-[#9CA3AF] text-sm italic font-medium tracking-tight">No se detectaron organizaciones registradas.</p>
              </div>
            )}
          </div>
        </section>

        {/* Infrastructure Meta */}
        <div className="flex justify-between items-center text-[10px] font-bold text-[#D1D5DB] uppercase tracking-[0.2em]">
          <span>Módulo de Configuración Nexo</span>
          <span>Protegido por RBAC</span>
        </div>
      </div>
    </div>
  )
}