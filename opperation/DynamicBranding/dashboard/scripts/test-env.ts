import "dotenv/config";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
console.log('URL:', url);
console.log('Key length:', key ? key.length : 'undefined');
console.log('Condition check:', !url || !key ? 'FAILS' : 'PASSES');
