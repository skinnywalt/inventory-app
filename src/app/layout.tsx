import "./globals.css";
import Navigation from '@/components/Navigation';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased font-sans">
        {/* The Navigation component now handles:
          1. The ISINVSYS Logo
          2. Role-based links (Dashboard, Inventory, Clients, Sales)
          3. The Switchboard 'Shout' logic
        */}
        <Navigation />

        <main className="max-w-[1600px] mx-auto py-8 px-6">
          {children}
        </main>
      </body>
    </html>
  );
}