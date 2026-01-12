'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Papa from 'papaparse'

export default function BulkUpload({ onComplete }: { onComplete: () => void }) {
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !localStorage.getItem('selected_org_id')) return

    setUploading(true)
    const orgId = localStorage.getItem('selected_org_id')

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const formattedData = (results.data as any[]).map(row => {
          const price = parseFloat(row.min_price || row.MinPrice || 0)
          return {
            name: row.name || row.Name || 'Unnamed Product',
            sku: row.sku || row.SKU || 'NOSKU-' + Date.now(),
            quantity: parseInt(row.quantity || row.Quantity || 0),
            min_price: price,
            current_price: price,
            organization_id: orgId 
          }
        })

        // Use the RPC function we just created in SQL
        const { error } = await supabase.rpc('upsert_inventory', { items: formattedData })

        if (error) alert(`Upload failed: ${error.message}`)
        else {
          alert(`Processed ${formattedData.length} items. Existing SKUs were updated.`)
          onComplete()
        }
        setUploading(false)
        e.target.value = ''
      }
    })
  }

  return (
    <label className="cursor-pointer bg-black text-white px-5 py-2 text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-gray-800 transition-all border border-black">
      {uploading ? 'Processing...' : 'Bulk Import'}
      <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={uploading} />
    </label>
  )
}