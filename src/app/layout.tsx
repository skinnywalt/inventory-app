import "./globals.css";
import Switchboard from "@/components/Switchboard";
import Link from "next/link";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased font-sans">
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md shadow-sm">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            
            {/* LEFT SIDE: LOGO & NAV */}
            <div className="flex items-center gap-10">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-black text-xs">IS</span>
                </div>
                <span className="font-black text-xl tracking-tighter uppercase">InvSys</span>
              </Link>

              <nav className="hidden md:flex gap-6 text-sm font-bold text-gray-500">
                <Link href="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
                <Link href="/inventory" className="hover:text-blue-600 transition-colors">Inventory</Link>
                <Link href="/sales" className="hover:text-blue-600 transition-colors">Sales Terminal</Link>
              </nav>
            </div>

            {/* RIGHT SIDE: SWITCHBOARD */}
            <Switchboard />

          </div>
        </header>

        <main className="max-w-7xl mx-auto py-8">
          {children}
        </main>
      </body>
    </html>
  );
}