'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function Dashboard() {
  const [products, setProducts] = useState<any[]>([])
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const loadDashboardData = async () => {
    const orgId = localStorage.getItem('selected_org_id')
    if (!orgId) return

    const [prodRes, saleRes] = await Promise.all([
      supabase.from('products').select('*').eq('organization_id', orgId),
      supabase.from('sales').select('*').eq('organization_id', orgId).order('created_at', { ascending: false })
    ])

    if (prodRes.data) setProducts(prodRes.data)
    if (saleRes.data) setSales(saleRes.data)
    setLoading(false)
  }

  useEffect(() => {
    loadDashboardData()
    window.addEventListener('storage', loadDashboardData)
    return () => window.removeEventListener('storage', loadDashboardData)
  }, [])

  const stats = useMemo(() => {
    const totalInventoryValue = products.reduce((acc, p) => acc + (p.quantity * p.min_price), 0)
    const lowStockCount = products.filter(p => p.quantity < 10).length
    const totalRevenue = sales.reduce((acc, s) => acc + s.total_amount, 0)
    return { totalInventoryValue, lowStockCount, totalRevenue }
  }, [products, sales])

  if (loading) return <div className="p-20 text-center font-bold text-gray-400">LOADING ANALYTICS...</div>

  return (
    <div className="p-6 max-w-[1600px] mx-auto bg-white min-h-screen">
      <div className="border-b pb-6 mb-10">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Executive Dashboard</h1>
        <p className="text-sm text-gray-500">Real-time performance metrics and inventory health.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="border border-gray-200 p-6 rounded-sm shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Asset Value</p>
          <p className="text-3xl font-bold text-gray-900">${stats.totalInventoryValue.toLocaleString()}</p>
        </div>
        <div className="border border-gray-200 p-6 rounded-sm shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-blue-600">${stats.totalRevenue.toLocaleString()}</p>
        </div>
        <div className={`border p-6 rounded-sm shadow-sm ${stats.lowStockCount > 0 ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Stock Alerts</p>
          <p className={`text-3xl font-bold ${stats.lowStockCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>{stats.lowStockCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="border border-gray-200 rounded-sm">
          <div className="bg-gray-50 p-4 border-b border-gray-200 font-bold text-sm">Recent Transactions</div>
          <div className="p-4 space-y-3">
            {sales.slice(0, 5).map(s => (
              <div key={s.id} className="flex justify-between text-sm border-b border-gray-50 pb-2">
                <span className="text-gray-600">ID: {s.id.slice(0,8)}</span>
                <span className="font-bold text-green-600">+${s.total_amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}