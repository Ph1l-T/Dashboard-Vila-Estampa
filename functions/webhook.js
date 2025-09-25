// Webhook Hubitat -> Dashboard
// Adicione no Maker API em: "URL to POST device events to" => https://SEU_DOMINIO/webhook?token=SEU_TOKEN
// Defina WEBHOOK_SHARED_SECRET como variável de ambiente para validar.
// Opcional: WEBHOOK_DEVICE_ALLOWLIST = lista separada por vírgulas de device IDs permitidos (ex: "231,232,259").
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  if (request.method !== 'POST') {
    return new Response('Webhook endpoint - use POST', { status: 200 });
  }

  // Autenticação simples (token via query ?token= ou header X-Webhook-Token)
  const tokenProvided = url.searchParams.get('token') || request.headers.get('x-webhook-token');
  if (env.WEBHOOK_SHARED_SECRET) {
    if (!tokenProvided || tokenProvided !== env.WEBHOOK_SHARED_SECRET) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' }});
    }
  }

  let payload;
  try {
    payload = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ success:false, error: 'Invalid JSON body' }), { status: 400, headers: { 'Content-Type': 'application/json' }});
  }

  // Estrutura típica do Hubitat (pode variar conforme app):
  // {
  //   "name":"switch",
  //   "value":"on",
  //   "displayName":"Luz Sala",
  //   "deviceId":"231",
  //   "descriptionText":"Luz Sala was turned on",
  //   "unit":null
  // }

  const allowlist = (env.WEBHOOK_DEVICE_ALLOWLIST || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  if (allowlist.length > 0) {
    const deviceId = String(payload.deviceId || payload.deviceID || '');
    if (!allowlist.includes(deviceId)) {
      return new Response(JSON.stringify({ success:false, ignored:true, reason:'Device not in allowlist' }), { status: 200, headers: { 'Content-Type': 'application/json' }});
    }
  }

  // Preparar evento normalizado
  const event = {
    deviceId: payload.deviceId || payload.deviceID || null,
    name: payload.name || null,
    value: payload.value || null,
    displayName: payload.displayName || payload.label || null,
    description: payload.descriptionText || null,
    raw: payload,
    receivedAt: new Date().toISOString()
  };

  // Log (fica em Workers logs no painel)
  console.log('Hubitat webhook event:', event);

  // No futuro: poderíamos armazenar em KV / D1 / R2 -> não implementado aqui.

  return new Response(JSON.stringify({ success:true, event }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control':'no-store' }
  });
}
