'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function SalesPage() {
  const [products, setProducts] = useState<any[]>([])
  const [cart, setCart] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [price, setPrice] = useState<number | ''>('')
  const [qty, setQty] = useState(1)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const loadData = async () => {
    const orgId = localStorage.getItem('selected_org_id')
    if (!orgId) return
    const { data } = await supabase.from('products').select('*').eq('organization_id', orgId).order('name')
    setProducts(data || [])
  }

  useEffect(() => {
    loadData()
    window.addEventListener('storage', loadData)
    return () => window.removeEventListener('storage', loadData)
  }, [])

  // Find the selected product from the state
  const selectedProduct = products.find(p => p.id === selectedId)

  const addToCart = () => {
    // 1. Check if product exists
    if (!selectedProduct) {
      console.error("No product selected");
      return
    }

    // 2. Validate Price Floor
    const numericPrice = Number(price)
    if (numericPrice < selectedProduct.min_price) {
      alert(`Price Error: Minimum price for this item is $${selectedProduct.min_price}`)
      return
    }

    // 3. Validate Quantity
    if (qty <= 0) {
      alert("Please enter a valid quantity")
      return
    }

    // 4. Update Cart with unique rowId
    const cartEntry = { 
      id: selectedProduct.id, 
      name: selectedProduct.name, 
      salePrice: numericPrice, 
      saleQty: qty, 
      rowId: Date.now() 
    }

    setCart(currentCart => [...currentCart, cartEntry])
    
    // Reset inputs for next item
    setSelectedId('')
    setPrice('')
    setQty(1)
  }

  const removeFromCart = (rowId: number) => {
    setCart(currentCart => currentCart.filter(item => item.rowId !== rowId))
  }

  const total = cart.reduce((s, i) => s + (i.salePrice * i.saleQty), 0)

  const handleCompleteTransaction = async () => {
    if (cart.length === 0) return
    setLoading(true)
    const orgId = localStorage.getItem('selected_org_id')

    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert([{ organization_id: orgId, total_amount: total }])
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
      generateReceiptPDF(cart, total)
      setCart([])
      await loadData()
      alert("Transaction Successful")
    }
    setLoading(false)
  }

  const generateReceiptPDF = (items: any[], grandTotal: number) => {
    const doc = new jsPDF()
    doc.text("SALES RECEIPT", 105, 20, { align: "center" })
    autoTable(doc, {
      startY: 30,
      head: [['Item', 'Qty', 'Price', 'Subtotal']],
      body: items.map(i => [i.name, i.saleQty, `$${i.salePrice.toFixed(2)}`, `$${(i.salePrice * i.saleQty).toFixed(2)}`]),
      foot: [['', '', 'TOTAL', `$${grandTotal.toFixed(2)}`]]
    })
    doc.save(`Receipt_${Date.now()}.pdf`)
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50 overflow-hidden">
      {/* ENTRY SECTION */}
      <div className="flex-1 p-8 bg-white border-r border-gray-200 overflow-y-auto">
        <h2 className="text-xl font-bold mb-6">New Shipment Entry</h2>
        <div className="max-w-md space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Product</label>
            <select 
              className="w-full p-3 border border-gray-300 rounded-sm text-sm"
              value={selectedId}
              onChange={(e) => {
                setSelectedId(e.target.value)
                const p = products.find(prod => prod.id === e.target.value)
                if (p) setPrice(p.min_price)
              }}
            >
              <option value="">Select an item...</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} (In stock: {p.quantity})</option>)}
            </select>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Unit Price</label>
              <input 
                type="number" 
                className="w-full p-3 border border-gray-300 rounded-sm text-sm"
                value={price} 
                onChange={e => setPrice(e.target.value === '' ? '' : Number(e.target.value))} 
              />
              {selectedProduct && <span className="text-[9px] text-gray-400">Min Price: ${selectedProduct.min_price}</span>}
            </div>
            <div className="w-32 space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Quantity</label>
              <input 
                type="number" 
                className="w-full p-3 border border-gray-300 rounded-sm text-sm"
                value={qty} 
                onChange={e => setQty(Number(e.target.value))} 
              />
            </div>
          </div>

          <button 
            onClick={addToCart}
            disabled={!selectedId}
            className="w-full bg-black text-white py-4 font-bold rounded-sm uppercase tracking-widest text-xs hover:bg-gray-800 transition-colors"
          >
            Add to Shipment
          </button>
        </div>
      </div>

      {/* CART SECTION */}
      <div className="w-full lg:w-[450px] bg-gray-50 p-8 border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col">
        <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-200 pb-2">Cart Contents</h2>
        
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {cart.length === 0 ? (
            <p className="text-gray-400 text-sm italic text-center py-20">Shipment is currently empty</p>
          ) : (
            cart.map(item => (
              <div key={item.rowId} className="bg-white border border-gray-200 p-4 rounded-sm flex justify-between items-center shadow-sm">
                <div className="max-w-[70%]">
                  <p className="font-bold text-sm truncate">{item.name}</p>
                  <p className="text-[10px] text-gray-500 uppercase">{item.saleQty} units @ ${item.salePrice.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-bold text-sm">${(item.salePrice * item.saleQty).toFixed(2)}</p>
                  <button onClick={() => removeFromCart(item.rowId)} className="text-gray-300 hover:text-red-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-300">
          <div className="flex justify-between text-2xl font-bold mb-6 tracking-tighter">
            <span className="text-gray-400 uppercase text-xs self-center">Grand Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button 
            onClick={handleCompleteTransaction}
            disabled={cart.length === 0 || loading}
            className="w-full bg-blue-600 text-white py-5 font-bold rounded-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-sm"
          >
            {loading ? 'Processing Transaction...' : 'Complete & Print'}
          </button>
        </div>
      </div>
    </div>
  )
}