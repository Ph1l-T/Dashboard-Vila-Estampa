// Polling function - busca todos os estados dos dispositivos
export async function onRequest(context) {
  const { env } = context;

  // Verifica se as variáveis de ambiente estão configuradas
  if (!env.HUBITAT_FULL_URL) {
    return new Response(JSON.stringify({
      error: 'Variável HUBITAT_FULL_URL não configurada'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    const response = await fetch(env.HUBITAT_FULL_URL);
    
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
