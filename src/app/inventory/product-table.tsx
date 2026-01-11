'use client'

import { useState, useMemo } from 'react'

export default function ProductTable({ initialProducts }: { initialProducts: any[] }) {
  const [searchTerm, setSearchTerm] = useState('')

  // Filters the 3,000 items instantly as the user types
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm, initialProducts])

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative group">
        <input
          type="text"
          placeholder="Search by product name or SKU..."
          className="block w-full pl-5 pr-3 py-4 border border-gray-200 rounded-2xl bg-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm group-hover:shadow-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table Structure */}
      <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Product</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">SKU</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Stock</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Min. Price</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-gray-800">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-400 font-mono">{item.sku || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-lg text-xs font-black ${item.quantity < 10 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                      {item.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">${item.min_price}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-20 text-center text-gray-400 italic">
                  No matching items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}