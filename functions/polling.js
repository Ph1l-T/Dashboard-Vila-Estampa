// Polling function - busca todos os estados dos dispositivos
export async function onRequest(context) {
  const { env } = context;

  // Verifica variáveis de ambiente
  if (!env.HUBITAT_BASE_URL || !env.HUBITAT_ACCESS_TOKEN) {
    return new Response(JSON.stringify({
      error: 'Variáveis não configuradas'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    const url = `${env.HUBITAT_BASE_URL}/all?access_token=${env.HUBITAT_ACCESS_TOKEN}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
