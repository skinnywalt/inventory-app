'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link' // Import Link for the back button

export default function CompanyManager() {
  const [organizations, setOrganizations] = useState<any[]>([])
  const [newOrgName, setNewOrgName] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const fetchOrgs = async () => {
    const { data } = await supabase.from('organizations').select('*').order('name')
    if (data) setOrganizations(data)
  }

  useEffect(() => {
    fetchOrgs()
  }, [])

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newOrgName) return
    setLoading(true)

    const { error } = await supabase
      .from('organizations')
      .insert([{ name: newOrgName }])

    if (error) {
      alert("Error: " + error.message)
    } else {
      setNewOrgName('')
      fetchOrgs()
    }
    setLoading(false)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This will affect all linked products.`)) return
    
    const { error } = await supabase.from('organizations').delete().eq('id', id)
    if (error) alert(error.message)
    else fetchOrgs()
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
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

      <header className="mb-10">
        <h1 className="text-4xl font-black tracking-tight text-gray-900">
          Admin <span className="text-blue-600">Settings</span>
        </h1>
        <p className="text-gray-500 mt-2">Manage organizations and system-wide configurations.</p>
      </header>

      {/* Add Section */}
      <section className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 mb-8">
        <h2 className="text-xl font-bold mb-6 text-gray-800">Register New Company</h2>
        <form onSubmit={handleAddCompany} className="flex flex-col md:flex-row gap-4">
          <input 
            type="text" 
            placeholder="Company Name (e.g., North Logistics)"
            className="flex-1 p-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium"
            value={newOrgName}
            onChange={(e) => setNewOrgName(e.target.value)}
          />
          <button 
            type="submit"
            disabled={loading || !newOrgName}
            className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-blue-700 disabled:bg-gray-300 transition-all shadow-lg active:scale-95"
          >
            {loading ? 'Creating...' : 'Register Company'}
          </button>
        </form>
      </section>

      {/* List Section */}
      <section className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-800">Active Organizations</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {organizations.length > 0 ? (
            organizations.map((org) => (
              <div key={org.id} className="px-8 py-6 flex justify-between items-center hover:bg-gray-50 transition-colors group">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{org.name}</h3>
                  <code className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded mt-1 inline-block font-mono">
                    ID: {org.id}
                  </code>
                </div>
                <button 
                  onClick={() => handleDelete(org.id, org.name)}
                  className="p-3 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                >
                  <span className="text-xl">🗑️</span>
                </button>
              </div>
            ))
          ) : (
            <div className="p-20 text-center">
              <p className="text-gray-400 italic">No companies registered yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}