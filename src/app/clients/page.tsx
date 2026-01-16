'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function ClientManagement() {
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isReady, setIsReady] = useState(false) // Track if orgId is available
  const [showAddForm, setShowAddForm] = useState(false)
  const [newClient, setNewClient] = useState({ full_name: '', email: '', phone: '' })
  
  const supabase = createClient()

  const loadClients = async () => {
    const orgId = localStorage.getItem('selected_org_id')
    
    // If orgId isn't set yet, wait for the Switchboard
    if (!orgId) {
      console.log("Clients: Waiting for Organization ID...")
      setLoading(false)
      setIsReady(false)
      return
    }

    setIsReady(true)
    setLoading(true)
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('organization_id', orgId)
      .order('full_name')

    if (!error) setClients(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadClients()
    
    // Listen for storage changes (cross-tab) and custom events (same-tab)
    window.addEventListener('storage', loadClients)
    window.addEventListener('orgChanged', loadClients) 

    return () => {
      window.removeEventListener('storage', loadClients)
      window.removeEventListener('orgChanged', loadClients)
    }
  }, [])

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault()
    const orgId = localStorage.getItem('selected_org_id')
    
    if (!orgId) return alert("No organization selected.")

    const { error } = await supabase
      .from('clients')
      .insert([{ ...newClient, organization_id: orgId }])

    if (error) {
      alert(error.message)
    } else {
      setNewClient({ full_name: '', email: '', phone: '' })
      setShowAddForm(false)
      loadClients()
    }
  }

  // 1. Initial check: If no orgId is found yet, show a polite message instead of a stuck loader
  if (!isReady && !loading) {
    return (
      <div className="p-20 text-center">
        <p className="font-bold text-gray-400 uppercase tracking-widest animate-pulse">
          Synchronizing with Organization Switchboard...
        </p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto bg-white min-h-screen">
      {/* --- BACK BUTTON PLACEMENT --- */}
      <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-blue-600 transition-all group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> 
            Back to Command Center
          </Link>
        </div>
        {/* ---------------------------- */}
      <div className="flex justify-between items-center mb-10 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight uppercase">Client Directory</h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Management Level Access</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm shadow-lg transition-all"
        >
          + Add New Client
        </button>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleAddClient} className="bg-white p-10 border border-gray-100 shadow-2xl w-full max-w-md space-y-5 rounded-sm">
            <div className="mb-4">
               <h2 className="text-xs font-black uppercase tracking-[0.3em] text-blue-600">Register Client</h2>
               <p className="text-[10px] text-gray-400 uppercase font-bold mt-1">New CRM Entry</p>
            </div>
            
            <input required placeholder="Full Name" className="w-full p-4 border border-gray-200 bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all rounded-sm" 
                   value={newClient.full_name} onChange={e => setNewClient({...newClient, full_name: e.target.value})} />
            
            <input type="email" placeholder="Email Address" className="w-full p-4 border border-gray-200 bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all rounded-sm" 
                   value={newClient.email} onChange={e => setNewClient({...newClient, email: e.target.value})} />
            
            <input type="tel" placeholder="Phone Number" className="w-full p-4 border border-gray-200 bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all rounded-sm" 
                   value={newClient.phone} onChange={e => setNewClient({...newClient, phone: e.target.value})} />
            
            <div className="flex gap-3 pt-6">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-4 text-[10px] font-bold uppercase tracking-widest rounded-sm shadow-md">Save Client</button>
              <button type="button" onClick={() => setShowAddForm(false)} className="px-8 py-4 border border-gray-200 text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="border border-gray-200 rounded-sm overflow-hidden shadow-sm bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
              <th className="px-8 py-5">Full Name</th>
              <th className="px-8 py-5">Contact Email</th>
              <th className="px-8 py-5">Phone</th>
              <th className="px-8 py-5 text-right">Join Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100 text-sm">
            {loading ? (
               <tr><td colSpan={4} className="py-20 text-center text-gray-400 font-bold italic animate-pulse">Fetching Client Data...</td></tr>
            ) : clients.length === 0 ? (
              <tr><td colSpan={4} className="py-20 text-center text-gray-300 italic">No clients found for this organization.</td></tr>
            ) : (
              clients.map(client => (
                <tr key={client.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-8 py-5 font-bold text-gray-900 uppercase tracking-tighter">{client.full_name}</td>
                  <td className="px-8 py-5 text-gray-500 font-medium">{client.email || '—'}</td>
                  <td className="px-8 py-5 text-gray-500 font-medium">{client.phone || '—'}</td>
                  <td className="px-8 py-5 text-right text-gray-400 font-mono text-xs">
                    {new Date(client.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}