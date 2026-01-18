'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function ManualAdd({ onComplete }: { onComplete: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState({ name: '', sku: '', quantity: 0, price: 0 })
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const orgId = localStorage.getItem('selected_org_id')
    
    const payload = [{
      ...form,
      min_price: form.price,
      current_price: form.price,
      organization_id: orgId
    }]

    const { error } = await supabase.rpc('upsert_inventory', { items: payload })

    if (error) alert(error.message)
    else {
      setForm({ name: '', sku: '', quantity: 0, price: 0 })
      setIsOpen(false)
      onComplete()
    }
  }

  if (!isOpen) return (
    <button onClick={() => setIsOpen(true)} className="border border-black px-5 py-2 text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-gray-50 transition-all">
      + Añadir Un Producto
    </button>
  )

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 border border-gray-200 shadow-2xl w-full max-w-md space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest border-b pb-4 mb-4">Entrada Manual</h2>
        
        <input required placeholder="Nombre del Producto" className="w-full p-3 border text-sm outline-none focus:border-black" 
               value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        
        <input required placeholder="SKU" className="w-full p-3 border text-sm outline-none focus:border-black font-mono" 
               value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} />
        
        <div className="flex gap-4">
          <input required type="number" placeholder="Cantidad" className="w-1/2 p-3 border text-sm outline-none focus:border-black" 
                 onChange={e => setForm({...form, quantity: parseInt(e.target.value)})} />
          <input required type="number" step="0.01" placeholder="Precio" className="w-1/2 p-3 border text-sm outline-none focus:border-black" 
                 onChange={e => setForm({...form, price: parseFloat(e.target.value)})} />
        </div>

        <div className="flex gap-2 pt-4">
          <button type="submit" className="flex-1 bg-black text-white py-3 text-[10px] font-bold uppercase tracking-widest">Guardar Producto</button>
          <button type="button" onClick={() => setIsOpen(false)} className="px-6 py-3 border text-[10px] font-bold uppercase tracking-widest">Cancelar</button>
        </div>
      </form>
    </div>
  )
}