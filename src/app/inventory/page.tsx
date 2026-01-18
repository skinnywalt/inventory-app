'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import BulkUpload from './bulk-upload' 
import ManualAdd from './manual-add'
import Link from 'next/link'

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const supabase = createClient()

  const loadInventory = async () => {
    // 1. Check storage
    const orgId = localStorage.getItem('selected_org_id')
    
    if (!orgId) {
      console.log("Inventory: No Org ID found, waiting...")
      setProducts([])
      setLoading(false)
      return
    }

    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('organization_id', orgId)
      .order('name')
    
    if (error) {
      console.error("Inventory Fetch Error:", error.message)
    } else {
      setProducts(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    // Initial load
    loadInventory()

    // 2. LISTENERS: Catch updates from Switchboard
    window.addEventListener('storage', loadInventory)
    window.addEventListener('orgChanged', loadInventory) // Custom event from Switchboard

    return () => {
      window.removeEventListener('storage', loadInventory)
      window.removeEventListener('orgChanged', loadInventory)
    }
  }, [])

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [products, searchTerm])

  return (
    <div className="p-6 max-w-[1600px] mx-auto bg-white min-h-screen">
      {/* --- BACK BUTTON PLACEMENT --- */}
      <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-blue-600 transition-all group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> 
            Menu Principal
          </Link>
        </div>
        {/* ---------------------------- */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Control de Inventario</h1>
          <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mt-1">
            {loading ? 'Refreshing stock...' : `${products.length} Items Listed`}
          </p>
        </div>
        <div className="flex gap-2">
          <ManualAdd onComplete={loadInventory} />
          <BulkUpload onComplete={loadInventory} />
        </div>
      </div>

      <div className="mb-6">
        <input 
          type="text" 
          placeholder="Search inventory by name or SKU..."
          className="w-full max-w-md px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr className="text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">
              <th className="px-6 py-4">Detalles Del Producto</th>
              <th className="px-6 py-4 text-center">SKU</th>
              <th className="px-6 py-4 text-center">Cantidad En Stock</th>
              <th className="px-6 py-4 text-right">Precio por Unidad</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100 text-sm">
            {loading ? (
              <tr><td colSpan={4} className="py-20 text-center text-gray-400 font-bold italic animate-pulse">Conectando con Base De Datos</td></tr>
            ) : filteredProducts.length === 0 ? (
              <tr><td colSpan={4} className="py-20 text-center text-gray-400 italic">No Inventario para esta Organizacion</td></tr>
            ) : (
              filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">{p.name}</td>
                  <td className="px-6 py-4 text-center font-mono text-[11px] text-gray-500 bg-gray-50/50">{p.sku || '---'}</td>
                  <td className={`px-6 py-4 text-center font-black ${p.quantity < 10 ? 'text-red-600' : 'text-gray-900'}`}>
                    {p.quantity}
                    {p.quantity < 10 && <span className="ml-2 text-[8px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">Bajo</span>}
                  </td>
                  <td className="px-6 py-4 text-right font-black text-blue-600">${p.min_price.toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}