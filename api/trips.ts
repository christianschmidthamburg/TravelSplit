
import { kv } from '@vercel/kv';

export const config = {
  runtime: 'edge',
};

const REDIS_KEY = 'tripsplit_data';

export default async function handler(request: Request) {
  try {
    // GET: Fetch all trips
    if (request.method === 'GET') {
      const trips = await kv.get(REDIS_KEY);
      return new Response(JSON.stringify(trips || []), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0'
        },
      });
    }

    // POST: Save or update trips
    if (request.method === 'POST') {
      const trips = await request.json();
      await kv.set(REDIS_KEY, trips);
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('Method Not Allowed', { status: 405 });
  } catch (error: any) {
    console.error('API Handler Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack,
      info: 'Check if Vercel KV environment variables are configured correctly.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
