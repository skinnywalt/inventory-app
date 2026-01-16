'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Link from 'next/link'

export default function SalesPage() {
  const [products, setProducts] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [cart, setCart] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [selectedClientId, setSelectedClientId] = useState('')
  const [price, setPrice] = useState<number | ''>('')
  const [qty, setQty] = useState(1)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  
  const supabase = createClient()

  const loadData = async () => {
    setLoading(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let orgId = localStorage.getItem('selected_org_id')
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, organization_id')
      .eq('id', user.id)
      .single()

    setUserRole(profile?.role || 'seller')

    // FIX: Check specifically for profile.organization_id and cast to string
    if (!orgId && profile?.organization_id) {
      orgId = profile.organization_id as string
      localStorage.setItem('selected_org_id', orgId)
    }

    if (!orgId) {
      setLoading(false)
      return
    }

    const [prodRes, clientRes] = await Promise.all([
      supabase.from('products').select('*').eq('organization_id', orgId).order('name'),
      supabase.from('clients').select('*').eq('organization_id', orgId).order('full_name')
    ])

    setProducts(prodRes.data || [])
    setClients(clientRes.data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
    window.addEventListener('storage', loadData)
    window.addEventListener('orgChanged', loadData) 

    return () => {
      window.removeEventListener('storage', loadData)
      window.removeEventListener('orgChanged', loadData)
    }
  }, [])

  // --- Logic Functions ---
  const selectedProduct = products.find(p => p.id === selectedId)

  const addToCart = () => {
    if (!selectedProduct) return
    const numericPrice = Number(price)
    if (numericPrice < selectedProduct.min_price) {
      alert(`Price Error: Minimum price is $${selectedProduct.min_price}`)
      return
    }
    if (qty <= 0) {
      alert("Please enter a valid quantity")
      return
    }

    const cartEntry = { 
      id: selectedProduct.id, 
      name: selectedProduct.name, 
      salePrice: numericPrice, 
      saleQty: qty, 
      rowId: Date.now() 
    }

    setCart(currentCart => [...currentCart, cartEntry])
    setSelectedId('')
    setPrice('')
    setQty(1)
  }

  const removeFromCart = (rowId: number) => {
    setCart(currentCart => currentCart.filter(item => item.rowId !== rowId))
  }

  const total = cart.reduce((s, i) => s + (i.salePrice * i.saleQty), 0)

  const handleCompleteTransaction = async () => {
    if (cart.length === 0 || !selectedClientId) return
    setLoading(true)
    const orgId = localStorage.getItem('selected_org_id')

    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert([{ 
        organization_id: orgId, 
        total_amount: total,
        client_id: selectedClientId 
      }])
      .select().single()

    if (saleError) {
      alert("Sale Error: " + saleError.message)
      setLoading(false)
      return
    }

    const saleItems = cart.map(item => ({
      sale_id: sale.id,
      product_id: item.id,
      unit_price: item.salePrice,
      quantity: item.saleQty
    }))

    const { error: itemsError } = await supabase.from('sale_items').insert(saleItems)

    if (itemsError) {
      alert("Items Error: " + itemsError.message)
    } else {
      generateReceiptPDF(cart, total, selectedClientId)
      setCart([])
      setSelectedClientId('')
      await loadData()
      alert("Transaction Successful")
    }
    setLoading(false)
  }

  const generateReceiptPDF = (items: any[], grandTotal: number, clientId: string) => {
    const clientName = clients.find(c => c.id === clientId)?.full_name || "Guest"
    const doc = new jsPDF()
    doc.setFont("helvetica", "bold")
    doc.text("COMMERCIAL SHIPMENT RECEIPT", 105, 20, { align: "center" })
    doc.setFontSize(10).setFont("helvetica", "normal")
    doc.text(`Client: ${clientName}`, 14, 30)
    doc.text(`Date: ${new Date().toLocaleString()}`, 14, 35)

    autoTable(doc, {
      startY: 45,
      head: [['Item', 'Qty', 'Unit Price', 'Subtotal']],
      body: items.map(i => [i.name, i.saleQty, `$${i.salePrice.toFixed(2)}`, `$${(i.salePrice * i.saleQty).toFixed(2)}`]),
      foot: [['', '', 'TOTAL AMOUNT', `$${grandTotal.toFixed(2)}`]],
      headStyles: { fillColor: [0, 0, 0] },
      theme: 'grid'
    })
    doc.save(`Invoice_${Date.now()}.pdf`)
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] bg-gray-50 overflow-hidden font-sans">
      
      {/* ENTRY SECTION */}
      <div className="flex-1 p-10 bg-white border-r border-gray-200 overflow-y-auto">
        
        {/* BACK BUTTON: Only for Admin */}
        {userRole === 'admin' && (
          <div className="mb-6">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-blue-600 transition-all group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span> 
              Back to Command Center
            </Link>
          </div>
        )}

        <h2 className="text-xl font-bold mb-10 uppercase tracking-widest text-gray-900 border-b pb-4">Shipment Preparation</h2>
        
        <div className="max-w-md space-y-8">
          {/* CLIENT SELECTOR - Accessible */}
          <div className="space-y-2">
            <label htmlFor="client-select" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Client</label>
            <select 
              id="client-select"
              title="Select Target Client"
              className="w-full p-4 border border-gray-300 rounded-sm text-sm focus:border-black outline-none transition-all"
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
            >
              <option value="">-- Choose Target Client --</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
            </select>
          </div>

          {/* PRODUCT SELECTOR - Accessible */}
          <div className="space-y-2">
            <label htmlFor="product-select" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Product</label>
            <select 
              id="product-select"
              title="Choose Product to Add"
              className="w-full p-4 border border-gray-300 rounded-sm text-sm focus:border-black outline-none"
              value={selectedId}
              onChange={(e) => {
                setSelectedId(e.target.value)
                const p = products.find(prod => prod.id === e.target.value)
                if (p) setPrice(p.min_price)
              }}
            >
              <option value="">-- Choose Product --</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} (In stock: {p.quantity})</option>)}
            </select>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <label htmlFor="price-input" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Unit Price</label>
              <input id="price-input" type="number" className="w-full p-4 border border-gray-300 rounded-sm text-sm" value={price} onChange={e => setPrice(Number(e.target.value))} />
            </div>
            <div className="w-32 space-y-2">
              <label htmlFor="qty-input" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Quantity</label>
              <input id="qty-input" type="number" className="w-full p-4 border border-gray-300 rounded-sm text-sm" value={qty} onChange={e => setQty(Number(e.target.value))} />
            </div>
          </div>

          <button 
            onClick={addToCart}
            disabled={!selectedId}
            className="w-full bg-black text-white py-5 font-bold text-[10px] uppercase tracking-[0.3em] rounded-sm hover:bg-gray-800 transition-all shadow-sm"
          >
            Add to Shipment
          </button>
        </div>
      </div>

      {/* CART SECTION */}
      <div className="w-full lg:w-[480px] bg-gray-50 p-10 flex flex-col border-t lg:border-t-0 lg:border-l border-gray-200">
        <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8 border-b border-gray-300 pb-2">Active Shipment Items</h2>
        
        <div className="flex-1 overflow-y-auto space-y-3">
          {loading ? (
             <p className="text-gray-400 text-sm animate-pulse text-center py-20 uppercase font-black">Syncing Systems...</p>
          ) : cart.length === 0 ? (
            <p className="text-gray-400 text-sm italic text-center py-20">No items added to current loadout</p>
          ) : (
            cart.map(item => (
              <div key={item.rowId} className="bg-white border border-gray-200 p-5 rounded-sm flex justify-between items-center shadow-sm">
                <div className="max-w-[60%]">
                  <p className="font-bold text-sm truncate">{item.name}</p>
                  <p className="text-[10px] text-gray-500 uppercase font-bold">{item.saleQty} units @ ${item.salePrice.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-6">
                  <p className="font-bold text-sm text-gray-900">${(item.salePrice * item.saleQty).toFixed(2)}</p>
                  <button onClick={() => removeFromCart(item.rowId)} className="text-gray-300 hover:text-red-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-8 pt-8 border-t-2 border-black">
          <div className="flex justify-between text-3xl font-black mb-10 tracking-tighter text-gray-900">
            <span className="text-gray-400 uppercase text-xs self-center tracking-widest">Total Invoice</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button 
            onClick={handleCompleteTransaction}
            disabled={cart.length === 0 || loading}
            className="w-full bg-blue-600 text-white py-6 font-bold text-xs uppercase tracking-[0.2em] rounded-sm hover:bg-blue-700 transition-all shadow-lg"
          >
            {loading ? 'Processing...' : 'Finalize & Print'}
          </button>
        </div>
      </div>
    </div>
  )
}