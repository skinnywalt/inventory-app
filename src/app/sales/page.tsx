'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function SalesPage() {
  // State for Database Data
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // State for the "Cart" (Multi-item sale)
  const [cart, setCart] = useState<any[]>([])

  // State for the current item being added
  const [selectedId, setSelectedId] = useState('')
  const [inputPrice, setInputPrice] = useState<number | ''>('')
  const [quantity, setQuantity] = useState<number | ''>(1)

  const supabase = createClient()

  // Load products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase.from('products').select('*').order('name')
      if (data) setProducts(data)
    }
    fetchProducts()
  }, [])

  // Helper: Find details of the item currently selected in the dropdown
  const selectedProduct = products.find(p => p.id === selectedId)
  
  // Logic: Is the current input valid to be added to the cart?
  const isPriceValid = selectedProduct && Number(inputPrice) >= selectedProduct.min_price
  const hasEnoughStock = selectedProduct && selectedProduct.quantity >= Number(quantity)

  // 1. Function: Add item to the local list (Cart)
  const addToCart = () => {
    if (!selectedProduct || !isPriceValid || !hasEnoughStock) return

    const newItem = {
      product_id: selectedId,
      name: selectedProduct.name,
      unit_price: Number(inputPrice),
      quantity: Number(quantity),
      total: Number(inputPrice) * Number(quantity)
    }

    setCart([...cart, newItem])
    
    // Reset inputs for next item
    setSelectedId('')
    setInputPrice('')
    setQuantity(1)
  }

  // 2. Function: Generate the PDF Receipt
  const generatePDF = (items: any[], total: number) => {
    const doc = new jsPDF()
    doc.setFontSize(20)
    doc.text("SHIPPING RECEIPT", 105, 20, { align: "center" })
    
    doc.setFontSize(10)
    doc.text(`Date: ${new Date().toLocaleString()}`, 14, 30)
    doc.text(`Company: Multi-Tenant Inventory System`, 14, 35)

    const tableRows = items.map(item => [
      item.name,
      item.quantity,
      `$${item.unit_price.toFixed(2)}`,
      `$${item.total.toFixed(2)}`
    ])

    autoTable(doc, {
      startY: 45,
      head: [['Product', 'Qty', 'Unit Price', 'Subtotal']],
      body: tableRows,
      foot: [['', '', 'TOTAL:', `$${total.toFixed(2)}`]]
    })

    doc.save(`Receipt_${Date.now()}.pdf`)
  }

  // 3. Function: Save to Database & Print
  const handleFinalSale = async () => {
    if (cart.length === 0) return
    setLoading(true)

    // A. Create the main Sale record
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert([{ organization_id: products[0].organization_id }])
      .select()
      .single()

    if (saleError) {
      alert("Error creating sale: " + saleError.message)
      setLoading(false)
      return
    }

    // B. Create the individual items linked to that sale
    const saleItems = cart.map(item => ({
      sale_id: sale.id,
      product_id: item.product_id,
      unit_price: item.unit_price,
      quantity: item.quantity
    }))

    const { error: itemsError } = await supabase.from('sale_items').insert(saleItems)

    if (itemsError) {
      alert("Database error: " + itemsError.message)
    } else {
      // C. Success! Print and Refresh
      const total = cart.reduce((sum, item) => sum + item.total, 0)
      generatePDF(cart, total)
      alert("Sale successful! Receipt downloaded.")
      window.location.reload()
    }
    setLoading(false)
  }

  const grandTotal = cart.reduce((sum, item) => sum + item.total, 0)

  return (
    <div className="p-10 max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
      
      {/* Left Column: Input Form */}
      <div className="flex-1 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Add to Shipment</h2>
        
        <div className="space-y-5">
          <div>
            <label htmlFor="product" className="block text-sm font-semibold text-gray-600">Product</label>
            <select 
              id="product"
              className="mt-1 w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
              value={selectedId}
              onChange={(e) => {
                setSelectedId(e.target.value)
                const p = products.find(prod => prod.id === e.target.value)
                if (p) setInputPrice(p.min_price)
              }}
            >
              <option value="">-- Search Products --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} (Stock: {p.quantity})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-semibold text-gray-600">
                Sale Price {selectedProduct && `(Min: $${selectedProduct.min_price})`}
              </label>
              <input 
                id="price"
                type="number" 
                className={`mt-1 w-full p-3 border rounded-lg ${!isPriceValid && selectedId ? 'border-red-500 bg-red-50' : 'bg-gray-50'}`}
                value={inputPrice}
                placeholder="0.00"
                onChange={(e) => setInputPrice(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
            <div>
              <label htmlFor="qty" className="block text-sm font-semibold text-gray-600">Quantity</label>
              <input 
                id="qty"
                type="number" 
                className="mt-1 w-full p-3 border rounded-lg bg-gray-50"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
          </div>

          {!isPriceValid && selectedId && (
            <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm font-bold animate-pulse">
              ⚠️ PRICE TOO LOW: Minimum required is ${selectedProduct?.min_price}
            </div>
          )}

          <button 
            onClick={addToCart}
            disabled={!selectedId || !isPriceValid || !hasEnoughStock}
            className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-200 transition-all"
          >
            Add to Receipt
          </button>
        </div>
      </div>

      {/* Right Column: Receipt Preview */}
      <div className="w-full md:w-96 bg-gray-900 text-white p-8 rounded-2xl shadow-2xl flex flex-col">
        <h2 className="text-xl font-bold mb-6 border-b border-gray-700 pb-4 text-blue-400">Current Receipt</h2>
        
        <div className="flex-1 space-y-4 overflow-y-auto">
          {cart.length === 0 ? (
            <p className="text-gray-500 italic text-center py-10">No items added yet...</p>
          ) : (
            cart.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start border-b border-gray-800 pb-3">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-gray-400">Qty: {item.quantity} × ${item.unit_price}</p>
                </div>
                <p className="font-bold">${item.total.toFixed(2)}</p>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-700">
            <div className="flex justify-between text-2xl font-black mb-6">
              <span>TOTAL</span>
              <span className="text-green-400">${grandTotal.toFixed(2)}</span>
            </div>
            <button 
              onClick={handleFinalSale}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-400 text-gray-900 py-4 rounded-xl font-black text-lg transition-all"
            >
              {loading ? 'SAVING...' : 'COMPLETE & PRINT PDF'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}