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

  // Load inventory based on active organization ID
  const loadInventory = async () => {
    const orgId = localStorage.getItem('selected_org_id')
    
    if (!orgId) {
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
    loadInventory()

    // Sync with Switchboard events
    window.addEventListener('storage', loadInventory)
    window.addEventListener('orgChanged', loadInventory)

    return () => {
      window.removeEventListener('storage', loadInventory)
      window.removeEventListener('orgChanged', loadInventory)
    }
  }, [])

  // Optimized search filtering
  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [products, searchTerm])

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6 md:p-10 font-sans text-[#111827]">
      <div className="max-w-[1300px] mx-auto space-y-8">
        
        {/* Navigation & Header Composition */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#9CA3AF] hover:text-[#3B82F6] transition-all group mb-2"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span> 
              Menu Principal
            </Link>
            <h1 className="text-4xl font-bold tracking-tight text-[#111827]">Control de Inventario</h1>
            <p className="text-[#6B7280] text-sm font-medium">
              {loading ? 'Sincronizando...' : `${products.length} productos registrados`}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <ManualAdd onComplete={loadInventory} />
            <BulkUpload onComplete={loadInventory} />
          </div>
        </div>

        {/* Search Bento Card */}
        <div className="bg-white p-2 rounded-2xl border border-[#E5E7EB] shadow-sm flex items-center max-w-md">
          <div className="pl-4 pr-2 text-[#9CA3AF]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            type="text"
            placeholder="Buscar por nombre o SKU..."
            className="w-full p-3 bg-transparent text-sm font-medium outline-none placeholder:text-[#9CA3AF]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Main Inventory Table Card */}
        <div className="bg-white rounded-[24px] border border-[#E5E7EB] shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <th className="px-8 py-5 text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest">Detalles Del Producto</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest text-center">SKU</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest text-center">Cantidad En Stock</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest text-right">Precio por Unidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {loading ? (
                // Skeleton UI placeholder
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-8 py-6 h-20 bg-white"></td>
                  </tr>
                ))
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-24 text-center text-[#9CA3AF] text-sm italic font-medium">
                    No se encontró inventario para esta organización.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="group hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-[#111827]">{p.name}</p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="text-[11px] font-mono font-bold bg-[#F3F4F6] text-[#6B7280] px-3 py-1 rounded-lg">
                        {p.sku || '---'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex flex-col items-center">
                        <span className={`text-sm font-bold ${p.quantity < 10 ? 'text-[#EF4444]' : 'text-[#111827]'}`}>
                          {p.quantity}
                        </span>
                        {p.quantity < 10 && (
                          <span className="text-[8px] font-black uppercase text-[#EF4444] mt-1 bg-red-50 px-2 py-0.5 rounded-full">
                            Bajo Stock
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right font-bold text-sm text-[#3B82F6]">
                      ${Number(p.min_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* System Metadata Footer */}
        <div className="flex justify-between items-center pt-4 text-[10px] font-bold text-[#D1D5DB] uppercase tracking-[0.2em]">
          <span>Protocolo NEXO v1.0</span>
          <span>Actualización en tiempo real activa</span>
        </div>
      </div>
    </div>
  )
}