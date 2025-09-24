// Hubitat Proxy - envia comandos para dispositivos
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const device = url.searchParams.get('device');
  const command = url.searchParams.get('command');
  const value = url.searchParams.get('value');

  if (!device || !command) {
    return new Response(JSON.stringify({
      error: 'Parâmetros obrigatórios: device e command'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    // URL base correta (sem /all)
    const baseUrl = 'https://cloud.hubitat.com/api/e45cb756-9028-44c2-8a00-e6fb3651856c/apps/172/devices';
    const accessToken = 'beddf703-c860-47bf-a6df-3df6ccc98138';
    
    let cmdUrl = `${baseUrl}/${device}/${encodeURIComponent(command)}`;
    if (value) cmdUrl += `/${encodeURIComponent(value)}`;
    cmdUrl += `?access_token=${accessToken}`;

    const response = await fetch(cmdUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { success: true, text };
    }

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
