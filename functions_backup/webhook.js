// Webhook - recebe notificações do Hubitat
export async function onRequest(context) {
  const { request } = context;

  if (request.method === 'POST') {
    try {
      const data = await request.json();
      console.log('Webhook recebido:', data);
      
      return new Response(JSON.stringify({
        status: 'received',
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        error: error.message
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  return new Response('Webhook endpoint - use POST', {
    status: 200,
    headers: { 'Content-Type': 'text/plain' }
  });
}
