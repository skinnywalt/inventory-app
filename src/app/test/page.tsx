import { createClient } from '@/utils/supabase/server';

export default async function TestPage() {
  const supabase = await createClient();
  
  // This just asks the database: "Are you there?"
  const { data, error } = await supabase.from('organizations').select('count');

  return (
    <div className="p-10">
      <h1 className="text-xl font-bold">Connection Status:</h1>
      {error ? (
        <p className="text-red-500">❌ Error: {error.message}</p>
      ) : (
        <p className="text-green-500">✅ Success! Connected to Supabase.</p>
      )}
      <p className="mt-4 text-gray-500 text-sm">
        Check your terminal if you see a "process.env" error—it means your .env.local keys are missing!
      </p>
    </div>
  );
}