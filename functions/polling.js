/**
 * Polling endpoint para buscar estados de múltiplos dispositivos
 * Route: /polling - GET /polling?devices=231,232,233
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS
    });
  }

  if (request.method !== 'GET') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: CORS_HEADERS 
    });
  }

  const deviceIds = url.searchParams.get('devices');
  if (!deviceIds) {
    return new Response(JSON.stringify({ error: 'Missing devices parameter - use ?devices=231,232,233' }), {
      status: 400,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json',
      }
    });
  }

  // Debug das variáveis de ambiente
  console.log('Environment variables:', {
    hasBaseUrl: !!env.HUBITAT_BASE_URL,
    hasAccessToken: !!env.HUBITAT_ACCESS_TOKEN,
    envKeys: Object.keys(env || {})
  });

  const HUBITAT_BASE_URL = env.HUBITAT_BASE_URL || 'https://cloud.hubitat.com/api/e45cb756-9028-44c2-8a00-e6fb3651856c/apps/172/devices';
  const ACCESS_TOKEN = env.HUBITAT_ACCESS_TOKEN || '8204fd02-e90e-4c0d-b083-431625526d10';

  const deviceList = deviceIds.split(',').filter(Boolean);
  const deviceStates = {};

  try {
    console.log(`Polling devices: ${deviceList.join(', ')}`);
    
    // Fetch states in parallel
    const promises = deviceList.map(async (deviceId) => {
      const url = `${HUBITAT_BASE_URL}/${deviceId}?access_token=${ACCESS_TOKEN}`;
      try {
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          // Extract switch state from attributes
          const switchAttr = data.attributes?.find(attr => attr.name === 'switch');
          const state = switchAttr?.currentValue || switchAttr?.value || 'off';
          return { deviceId, state, success: true };
        } else {
          return { deviceId, state: 'off', success: false, error: response.status };
        }
      } catch (error) {
        return { deviceId, state: 'off', success: false, error: error.message };
      }
    });

    const results = await Promise.all(promises);
    
    // Build response object
    results.forEach(result => {
      deviceStates[result.deviceId] = {
        state: result.state,
        success: result.success,
        ...(result.error && { error: result.error })
      };
    });

    return new Response(JSON.stringify({
      timestamp: new Date().toISOString(),
      devices: deviceStates
    }), {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json',
      }
    });

  } catch (error) {
    console.error('Polling Error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Polling failed',
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