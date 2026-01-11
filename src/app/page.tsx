import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl rotate-3">
        <span className="text-white font-black text-3xl">IS</span>
      </div>
      
      <h1 className="text-5xl font-black tracking-tighter text-gray-900 mb-4">
        Inventory Management <span className="text-blue-600">System</span>
      </h1>
      
      <p className="text-xl text-gray-500 max-w-2xl mb-12">
        A professional multi-tenant solution for managing 3,000+ items across 4 distinct companies.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link 
          href="/inventory" 
          className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all hover:scale-105 shadow-lg"
        >
          View Inventory
        </Link>
        <Link 
          href="/sales" 
          className="bg-white text-gray-900 border-2 border-gray-200 px-8 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all hover:scale-105 shadow-md"
        >
          Sales Terminal
        </Link>
      </div>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-5xl">
        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-blue-600 mb-2">📊</div>
          <h3 className="font-bold mb-1">Scale</h3>
          <p className="text-sm text-gray-500">Optimized for M2 performance with 3,000+ items.</p>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-blue-600 mb-2">🛡️</div>
          <h3 className="font-bold mb-1">Guardrails</h3>
          <p className="text-sm text-gray-500">Database triggers prevent sales below cost.</p>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-blue-600 mb-2">🏢</div>
          <h3 className="font-bold mb-1">Multi-Tenant</h3>
          <p className="text-sm text-gray-500">The Switchboard toggles between all 4 companies.</p>
        </div>
      </div>
    </div>
  );
}