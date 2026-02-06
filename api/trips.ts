
// Diese Datei enthält KEINE Imports, um den Fehler TS2307 (Module not found) zu vermeiden.
// Die Runtime ist auf 'edge' gesetzt für maximale Kompatibilität.

export const config = {
  runtime: 'edge',
};

const DB_KEY = 'tripsplit_v1_data';

export default async function (request: Request) {
  // Wir versuchen die Standard-Vercel-KV Variablen zu lesen
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  // Falls die Variablen fehlen, geben wir eine klare Fehlermeldung zurück
  if (!url || !token) {
    return new Response(
      JSON.stringify({ 
        error: 'Datenbank nicht konfiguriert.',
        details: 'Bitte verknüpfe eine "Vercel KV" Instanz im Dashboard, um die REST-Variablen zu erhalten.' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const method = request.method;

  try {
    if (method === 'GET') {
      const res = await fetch(`${url}/get/${DB_KEY}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      let trips = [];
      if (data && data.result) {
        trips = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
      }
      return new Response(JSON.stringify(trips), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
      });
    }

    if (method === 'POST') {
      const body = await request.json();
      const res = await fetch(`${url}/set/${DB_KEY}`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      if (!res.ok) throw new Error(`KV Store Error: ${res.status}`);
      
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('Method Not Allowed', { status: 405 });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
