'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import BulkUpload from './bulk-upload' 

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const supabase = createClient()

  const loadInventory = async () => {
    setLoading(true)
    const orgId = localStorage.getItem('selected_org_id')
    if (!orgId) {
      setProducts([])
      setLoading(false)
      return
    }
    const { data } = await supabase.from('products').select('*').eq('organization_id', orgId).order('name')
    setProducts(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadInventory()
    window.addEventListener('storage', loadInventory)
    return () => window.removeEventListener('storage', loadInventory)
  }, [])

  const filteredProducts = useMemo(() => {
    return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku?.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [products, searchTerm])

  return (
    <div className="p-6 max-w-[1600px] mx-auto bg-white min-h-screen">
      <div className="flex justify-between items-center mb-10 border-b pb-6">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Inventory Control</h1>
        <BulkUpload onComplete={loadInventory} />
      </div>

      <div className="mb-6">
        <input 
          type="text" 
          placeholder="Filter by name or SKU..."
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-sm focus:ring-1 focus:ring-black outline-none text-sm shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="border border-gray-200 rounded-sm shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr className="text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4 text-center">SKU</th>
              <th className="px-6 py-4 text-center">Stock</th>
              <th className="px-6 py-4 text-right">Unit Min</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-sm">
            {filteredProducts.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{p.name}</td>
                <td className="px-6 py-4 text-center font-mono text-gray-500">{p.sku || 'N/A'}</td>
                <td className={`px-6 py-4 text-center font-bold ${p.quantity < 10 ? 'text-red-600' : ''}`}>{p.quantity}</td>
                <td className="px-6 py-4 text-right font-bold">${p.min_price.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}