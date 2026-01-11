'use client'

import { useState } from 'react'
import Papa from 'papaparse'
import { createClient } from '@/utils/supabase/client'

export default function BulkUpload({ orgId }: { orgId: string }) {
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const formattedData = results.data.map((row: any) => ({
          name: row.name || row.Name,
          sku: row.sku || row.SKU || '',
          quantity: parseInt(row.quantity || row.Quantity) || 0,
          min_price: parseFloat(row.min_price || row.MinPrice) || 0,
          organization_id: orgId
        }))

        const { error } = await supabase.from('products').insert(formattedData)
        if (error) alert("Error: " + error.message)
        else {
          alert(`Success! Imported ${formattedData.length} products.`)
          window.location.reload()
        }
        setUploading(false)
      }
    })
  }

  return (
    <div className="mb-8 p-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl text-white shadow-lg flex flex-col md:flex-row justify-between items-center gap-4">
      <div>
        <h2 className="text-xl font-bold">Quick Bulk Import</h2>
        <p className="text-blue-100 text-sm">Upload a CSV to update your 3,000+ items instantly.</p>
      </div>
      <label className="cursor-pointer bg-white text-blue-600 px-8 py-3 rounded-2xl font-black hover:bg-blue-50 transition-all shadow-md active:scale-95">
        {uploading ? 'Processing CSV...' : 'CHOOSE CSV FILE'}
        <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
      </label>
    </div>
  )
}