'use client'

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function LandingPage() {
  const [role, setRole] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const checkRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        setRole(data?.role || 'seller');
      }
    };
    checkRole();
  }, []);

  const adminModules = [
    { name: 'Dashboard', desc: 'Analytics & Revenue', href: '/dashboard', icon: '📈', color: 'bg-blue-50 text-blue-600' },
    { name: 'Inventory', desc: 'Manage 3,000+ Items', href: '/inventory', icon: '📦', color: 'bg-amber-50 text-amber-600' },
    { name: 'Sales Terminal', desc: 'Generate Receipts', href: '/sales', icon: '💳', color: 'bg-emerald-50 text-emerald-600' },
    { name: 'Client Directory', desc: 'CRM & Management', href: '/clients', icon: '👥', color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-12">
      {/* Header Section */}
      <div className="mb-16 text-center md:text-left">
        <div className="inline-flex items-center gap-3 mb-6 bg-blue-50 px-4 py-2 rounded-full">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
          <span className="text-blue-700 text-xs font-black uppercase tracking-widest">System Online</span>
        </div>
        
        <h1 className="text-6xl font-black tracking-tight text-gray-900 mb-4 leading-tight">
          Control Center <span className="text-blue-600 text-3xl align-top">v1.0</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl">
          Authenticated as <span className="text-gray-900 font-bold uppercase underline decoration-blue-500 decoration-2">{role}</span>. 
          Manage multi-tenant operations across all integrated organizations.
        </p>
      </div>

      {/* Admin Quick-Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
        {adminModules.map((module) => (
          <Link key={module.href} href={module.href} className="group">
            <div className="h-full p-8 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col items-start text-left">
              <div className={`w-14 h-14 ${module.color} rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform`}>
                {module.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{module.name}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                {module.desc}
              </p>
              <span className="mt-auto text-xs font-black uppercase tracking-widest text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                Enter Module →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* System Status Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-gray-100">
        <div className="flex items-center gap-4">
          <div className="text-2xl">🛡️</div>
          <div>
            <h4 className="text-sm font-bold">Secure Access</h4>
            <p className="text-xs text-gray-400">Row Level Security Active</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-2xl">⚡</div>
          <div>
            <h4 className="text-sm font-bold">M2 Optimized</h4>
            <p className="text-xs text-gray-400">Low-latency data fetching</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-2xl">🏢</div>
          <div>
            <h4 className="text-sm font-bold">Global Switchboard</h4>
            <p className="text-xs text-gray-400">Tenant-isolation enforced</p>
          </div>
        </div>
      </div>
    </div>
  );
}