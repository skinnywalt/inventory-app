'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

type TabType = 'general' | 'clients' | 'sellers'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('general')
  const [stats, setStats] = useState<any>({ totalRev: 0, salesCount: 0, topClients: [], topSellers: [] })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const loadDashboardData = async () => {
    setLoading(true)
    const orgId = localStorage.getItem('selected_org_id')
    if (!orgId) return

    // Fetch all sales for this org
    const { data: salesData } = await supabase
      .from('sales_leaderboard')
      .select('*')
      .eq('organization_id', orgId)

    if (salesData) {
      // 1. Calculate General Stats
      const totalRev = salesData.reduce((acc, curr) => acc + curr.total_amount, 0)
      
      // 2. Aggregate Clients
      const clientMap = salesData.reduce((acc: any, curr) => {
        acc[curr.client_name] = (acc[curr.client_name] || 0) + curr.total_amount
        return acc
      }, {})
      const sortedClients = Object.entries(clientMap)
        .map(([name, val]) => ({ name, value: val }))
        .sort((a, b) => b.value - a.value)

      // 3. Aggregate Sellers
      const sellerMap = salesData.reduce((acc: any, curr) => {
        const name = curr.user_name || 'Vendedor Desconocido'
        acc[name] = (acc[name] || 0) + curr.total_amount
        return acc
      }, {})
      const sortedSellers = Object.entries(sellerMap)
        .map(([name, val]) => ({ name, value: val }))
        .sort((a, b) => b.value - a.value)

      setStats({
        totalRev,
        salesCount: salesData.length,
        topClients: sortedClients,
        topSellers: sortedSellers
      })
    }
    setLoading(false)
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6 md:p-10 font-sans text-[#111827]">
      <div className="max-w-[1200px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="space-y-1">
          <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#9CA3AF] hover:text-[#3B82F6] mb-2 transition-all group">
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Panel Principal
          </Link>
          <h1 className="text-4xl font-bold tracking-tight text-[#111827]">Análisis de Rendimiento</h1>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-[#E5E7EB] p-1 rounded-xl w-fit">
          {(['general', 'clients', 'sellers'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${
                activeTab === tab ? 'bg-white text-[#111827] shadow-sm' : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              {tab === 'general' ? 'General' : tab === 'clients' ? 'Clientes' : 'Vendedores'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white border border-[#E5E7EB] rounded-md shadow-sm min-h-[400px]">
          {loading ? (
            <div className="p-20 text-center animate-pulse text-[#9CA3AF] font-bold uppercase text-[10px] tracking-widest">
              Sincronizando Métricas...
            </div>
          ) : (
            <div className="p-8">
              {activeTab === 'general' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <StatCard label="Ingresos Totales" value={`$${stats.totalRev.toLocaleString()}`} sub="Acumulado histórico" />
                  <StatCard label="Transacciones" value={stats.salesCount} sub="Ventas completadas" />
                </div>
              )}

              {(activeTab === 'clients' || activeTab === 'sellers') && (
                <div className="space-y-4">
                  <div className="grid grid-cols-12 px-4 py-2 text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest border-b border-[#F3F4F6]">
                    <div className="col-span-8">Nombre</div>
                    <div className="col-span-4 text-right">Volumen de Venta</div>
                  </div>
                  {(activeTab === 'clients' ? stats.topClients : stats.topSellers).map((item: any, i: number) => (
                    <div key={i} className="grid grid-cols-12 px-4 py-4 items-center hover:bg-[#F9FAFB] transition-colors rounded-lg">
                      <div className="col-span-8 flex items-center gap-4">
                        <span className="text-xs font-black text-[#3B82F6] bg-blue-50 w-6 h-6 flex items-center justify-center rounded-md">{i + 1}</span>
                        <span className="text-sm font-bold text-[#111827]">{item.name}</span>
                      </div>
                      <div className="col-span-4 text-right text-sm font-bold text-[#111827]">
                        ${item.value.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub }: any) {
  return (
    <div className="p-8 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl">
      <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.2em] mb-4">{label}</p>
      <h3 className="text-5xl font-bold tracking-tighter text-[#111827] mb-2">{value}</h3>
      <p className="text-xs text-[#6B7280] font-medium italic">{sub}</p>
    </div>
  )
}