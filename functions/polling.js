// Polling function - busca todos os estados dos dispositivos
// Agora construindo a URL a partir de HUBITAT_BASE_URL + /all + token, sem usar HUBITAT_FULL_URL
export async function onRequest(context) {
  const { env } = context;

  // Precisamos apenas dessas duas variáveis agora
  if (!env.HUBITAT_BASE_URL || !env.HUBITAT_ACCESS_TOKEN) {
    return new Response(JSON.stringify({
      error: 'Variáveis obrigatórias não configuradas: HUBITAT_BASE_URL e/ou HUBITAT_ACCESS_TOKEN'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    // Normaliza base removendo eventual barra final
    const base = env.HUBITAT_BASE_URL.replace(/\/$/, '');
    const pollingUrl = `${base}/all?access_token=${env.HUBITAT_ACCESS_TOKEN}`;

    const response = await fetch(pollingUrl, { cf: { cacheTtl: 0, cacheEverything: false } });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify({
      success: true,
      source: 'hubitat',
      deviceCount: Array.isArray(data) ? data.length : undefined,
      data
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
