'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

interface LeaderboardEntry {
  name: string;
  value: number;
}

type TabType = 'general' | 'clients' | 'sellers' | 'products'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('general')
  const [stats, setStats] = useState({ 
    totalRev: 0, 
    salesCount: 0, 
    topClients: [] as LeaderboardEntry[], 
    topSellers: [] as LeaderboardEntry[],
    topProducts: [] as LeaderboardEntry[]
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const loadDashboardData = async () => {
    setLoading(true)
    const orgId = localStorage.getItem('selected_org_id')
    if (!orgId) return

    // Fetch Leaderboards
    const [salesRes, productRes] = await Promise.all([
      supabase.from('sales_leaderboard').select('*').eq('organization_id', orgId),
      supabase.from('product_leaderboard').select('*').eq('organization_id', orgId)
    ])

    if (salesRes.data) {
      const data = salesRes.data
      const totalRev = data.reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0)
      
      // Aggregate Clients
      const clientMap: Record<string, number> = data.reduce((acc: Record<string, number>, curr) => {
        const name = curr.client_name || 'Consumidor Final'
        acc[name] = (acc[name] || 0) + Number(curr.total_amount || 0)
        return acc
      }, {})

      // Aggregate Sellers (Will now show "Nexo Ventas" correctly)
      const sellerMap: Record<string, number> = data.reduce((acc: Record<string, number>, curr) => {
        const name = curr.user_name || 'Vendedor Desconocido'
        acc[name] = (acc[name] || 0) + Number(curr.total_amount || 0)
        return acc
      }, {})

      // Map Products from the second query
      const sortedProducts: LeaderboardEntry[] = (productRes.data || [])
        .map(item => ({
          name: item.product_name,
          value: Number(item.total_units)
        }))
        .sort((a, b) => b.value - a.value)

      setStats({
        totalRev,
        salesCount: data.length,
        topClients: Object.entries(clientMap).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value),
        topSellers: Object.entries(sellerMap).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value),
        topProducts: sortedProducts
      })
    }
    setLoading(false)
  }

  useEffect(() => { loadDashboardData() }, [])

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6 md:p-10 font-sans text-[#111827]">
      <div className="max-w-[1200px] mx-auto space-y-8">
        
        <div className="space-y-1">
          <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#9CA3AF] hover:text-[#3B82F6] mb-2 transition-all group">
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Menu Principal
          </Link>
          <h1 className="text-4xl font-bold tracking-tight text-[#111827]">Análisis de Rendimiento</h1>
          <p className="text-[#6B7280] text-sm font-medium italic">Datos consolidados de la organización</p>
        </div>

        {/* Tab Navigation - Grayish Bento Style */}
        <div className="flex gap-1 bg-[#E5E7EB] p-1 rounded-xl w-fit">
          {(['general', 'clients', 'sellers', 'products'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${
                activeTab === tab ? 'bg-white text-[#111827] shadow-sm' : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              {tab === 'general' ? 'General' : tab === 'clients' ? 'Clientes' : tab === 'sellers' ? 'Vendedores' : 'Productos'}
            </button>
          ))}
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-md shadow-sm min-h-[450px]">
          {loading ? (
            <div className="p-20 text-center animate-pulse text-[#9CA3AF] font-bold uppercase text-[10px] tracking-widest">
              Sincronizando Métricas...
            </div>
          ) : (
            <div className="p-8">
              {activeTab === 'general' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <StatCard label="Ingresos Totales" value={`$${stats.totalRev.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} sub="Acumulado Histórico" />
                  <StatCard label="Transacciones" value={stats.salesCount} sub="Ventas Procesadas" />
                </div>
              )}

              {activeTab !== 'general' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-12 px-4 py-2 text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest border-b border-[#F3F4F6]">
                    <div className="col-span-8">Nombre</div>
                    <div className="col-span-4 text-right">
                      {activeTab === 'products' ? 'Unidades' : 'Volumen'}
                    </div>
                  </div>
                  {(activeTab === 'clients' ? stats.topClients : activeTab === 'sellers' ? stats.topSellers : stats.topProducts).map((item, i) => (
                    <div key={i} className="grid grid-cols-12 px-4 py-4 items-center hover:bg-[#F9FAFB] transition-colors rounded-lg">
                      <div className="col-span-8 flex items-center gap-4">
                        <span className="text-xs font-black text-[#3B82F6] bg-blue-50 w-6 h-6 flex items-center justify-center rounded-md">{i + 1}</span>
                        <span className="text-sm font-bold text-[#111827]">{item.name}</span>
                      </div>
                      <div className="col-span-4 text-right text-sm font-bold text-[#111827]">
                        {activeTab === 'products' ? `${item.value} Un.` : `$${item.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                      </div>
                    </div>
                  ))}
                  {(activeTab === 'products' ? stats.topProducts : activeTab === 'clients' ? stats.topClients : stats.topSellers).length === 0 && (
                    <div className="p-20 text-center text-[#9CA3AF] text-xs italic font-medium">Sin registros detectados.</div>
                  )}
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