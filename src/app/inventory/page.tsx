import { createClient } from '@/utils/supabase/server';

export default async function InventoryPage() {
  const supabase = await createClient();
  
  // Fetching data - Next.js handles this on the server side
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true });

  if (error) return <div className="p-10 text-red-500">Error: {error.message}</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Inventory</h1>
        <span className="text-sm text-gray-500">{products?.length || 0} Items Total</span>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min. Sale Price</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products?.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.name}</td>
                <td className={`px-6 py-4 text-sm ${item.quantity < 10 ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                  {item.quantity}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">${item.min_price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}