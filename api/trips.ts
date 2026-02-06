
// Diese Route nutzt die REST-API von Upstash (Vercel Marketplace)
// Kompatibel mit der Edge Runtime (kein TCP/Net Modul nötig)

export const config = {
  runtime: 'edge',
};

const DB_KEY = 'tripsplit_v1_data';

export default async function handler(request: Request) {
  // Unterstützung für alle gängigen Varianten der Umgebungsvariablen
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    return new Response(
      JSON.stringify({ 
        error: 'Datenbank nicht verknüpft.',
        details: 'Bitte installiere "Upstash" über den Vercel Marketplace und verknüpfe es mit diesem Projekt.' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const method = request.method;

  try {
    // GET: Daten abrufen mit dem Redis-Befehl GET
    if (method === 'GET') {
      const res = await fetch(`${url}/get/${DB_KEY}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await res.json();
      let trips = [];
      
      if (data && data.result) {
        // Falls das Ergebnis ein String ist (bei Redis oft der Fall), parsen wir ihn
        trips = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
      }
      
      return new Response(JSON.stringify(trips), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store' 
        }
      });
    }

    // POST: Daten speichern mit dem Redis-Befehl SET
    if (method === 'POST') {
      const body = await request.json();
      
      // Wir senden den Befehl als POST an den Basis-Endpunkt
      // Upstash REST API erwartet: [Befehl, Key, Value]
      const res = await fetch(url, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(['SET', DB_KEY, JSON.stringify(body)])
      });
      
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Upstash Error: ${res.status} - ${errText}`);
      }
      
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('Method Not Allowed', { status: 405 });
  } catch (err: any) {
    console.error('API Error:', err.message);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
