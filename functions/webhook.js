/**
 * Webhook endpoint para receber notificações automáticas do Hubitat
 * Route: /webhook - POST /webhook
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

export async function onRequest(context) {
  const { request } = context;

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS
    });
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: CORS_HEADERS 
    });
  }

  try {
    const webhookData = await request.json();
    
    console.log('📡 Webhook recebido do Hubitat:', webhookData);
    
    // Extrair informações importantes
    const deviceId = webhookData.deviceId;
    const deviceName = webhookData.displayName || webhookData.name;
    const attribute = webhookData.attribute;
    const value = webhookData.value;
    
    // Log para debug
    console.log(`🔔 Dispositivo ${deviceName} (ID: ${deviceId}): ${attribute} = ${value}`);
    
    // Aqui você pode processar a mudança e notificar o frontend
    // Por exemplo, usar Server-Sent Events ou WebSockets
    
    // Resposta de sucesso
    return new Response(JSON.stringify({
      success: true,
      message: '✅ Webhook processado com sucesso',
      received: {
        deviceId,
        deviceName,
        attribute,
        value,
        timestamp: new Date().toISOString()
      }
    }), {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json',
      }
    });

  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Erro ao processar webhook',
      message: error.message 
    }), {
      status: 500,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json',
      }
    });
  }
}