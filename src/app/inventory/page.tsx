import { createClient } from '@/utils/supabase/server'; // Make sure this helper exists!

export default async function InventoryPage() {
  const supabase = await createClient();
  
  // Fetch products - handles up to 3,000 items smoothly
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true });

  if (error) return <div>Error loading inventory</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Inventory Management</h1>
      
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 font-medium text-gray-900 text-left">Product Name</th>
              <th className="px-4 py-2 font-medium text-gray-900 text-left">SKU</th>
              <th className="px-4 py-2 font-medium text-gray-900 text-left">Quantity</th>
              <th className="px-4 py-2 font-medium text-gray-900 text-left">Min. Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products?.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-2 text-gray-700">{item.name}</td>
                <td className="px-4 py-2 text-gray-700">{item.sku}</td>
                <td className={`px-4 py-2 font-bold ${item.quantity < 10 ? 'text-red-600' : 'text-green-600'}`}>
                  {item.quantity}
                </td>
                <td className="px-4 py-2 text-gray-700">${item.min_price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}