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

  // Nova URL com /all que já inclui o access_token
  const HUBITAT_ALL_URL = env.HUBITAT_BASE_URL || 'https://cloud.hubitat.com/api/e45cb756-9028-44c2-8a00-e6fb3651856c/apps/172/devices/all?access_token=beddf703-c860-47bf-a6df-3df6ccc98138';
  const ACCESS_TOKEN = env.HUBITAT_ACCESS_TOKEN || 'beddf703-c860-47bf-a6df-3df6ccc98138';

  const deviceList = deviceIds.split(',').filter(Boolean);
  const deviceStates = {};

  try {
    console.log(`Polling devices: ${deviceList.join(', ')}`);
    
    // Buscar todos os dispositivos de uma vez usando /all
    console.log('Fetching all devices via /all endpoint...');
    const response = await fetch(HUBITAT_ALL_URL);
    
    if (response.ok) {
      const allDevicesData = await response.json();
      console.log(`Received data for ${allDevicesData.length} devices`);
      
      // Processar apenas os dispositivos solicitados
      deviceList.forEach(deviceId => {
        const deviceData = allDevicesData.find(device => device.id.toString() === deviceId.toString());
        
        if (deviceData && deviceData.attributes) {
          const switchAttr = deviceData.attributes.find(attr => attr.name === 'switch');
          const state = switchAttr?.currentValue || switchAttr?.value || 'off';
          
          deviceStates[deviceId] = {
            state: state,
            success: true
          };
          
          console.log(`✅ Device ${deviceId}: ${state}`);
        } else {
          console.warn(`⚠️ Device ${deviceId} not found in /all response`);
          deviceStates[deviceId] = {
            state: 'off',
            success: false,
            error: 'Device not found'
          };
        }
      });
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

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