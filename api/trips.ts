
export const config = {
  runtime: 'edge',
};

const REDIS_KEY = 'tripsplit_data';

export default async function handler(request: Request) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    return new Response(JSON.stringify({ 
      error: 'Vercel KV environment variables are missing.',
      info: 'Please ensure your KV database is connected to the project in the Vercel dashboard.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // GET: Fetch all trips
    if (request.method === 'GET') {
      const response = await fetch(`${url}/get/${REDIS_KEY}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await response.json();
      // Upstash REST returns { result: "value" }
      // We parse it if it's a string, otherwise use it directly
      let trips = [];
      if (data.result) {
        trips = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
      }

      return new Response(JSON.stringify(trips), {
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
      
      const response = await fetch(`${url}/set/${REDIS_KEY}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(trips)
      });

      if (!response.ok) {
        throw new Error(`KV Store returned ${response.status}`);
      }

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
      info: 'REST API call to KV failed.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
