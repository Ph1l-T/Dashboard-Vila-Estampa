/**
 * Cloudflare Pages Function para fazer proxy das requisições ao Hubitat
 * Route: /hubitat-proxy - aceita todos os comandos via query params
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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

  // Get parameters from query string
  const deviceId = url.searchParams.get('device');
  const command = url.searchParams.get('command');
  const value = url.searchParams.get('value');

  if (!deviceId) {
    return new Response(JSON.stringify({ error: 'Device ID required - use ?device=123' }), { 
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
    });
  }

  // Build Hubitat URL - remover /all da URL base se presente
  const HUBITAT_FULL_URL = env.HUBITAT_BASE_URL || 'https://cloud.hubitat.com/api/e45cb756-9028-44c2-8a00-e6fb3651856c/apps/172/devices/all?access_token=beddf703-c860-47bf-a6df-3df6ccc98138';
  const HUBITAT_BASE_URL = HUBITAT_FULL_URL.split('/all?')[0] || 'https://cloud.hubitat.com/api/e45cb756-9028-44c2-8a00-e6fb3651856c/apps/172/devices';
  const ACCESS_TOKEN = env.HUBITAT_ACCESS_TOKEN || 'beddf703-c860-47bf-a6df-3df6ccc98138';

  let hubitatUrl = `${HUBITAT_BASE_URL}/${deviceId}`;
  
  if (command) {
    hubitatUrl += `/${command}`;
    if (value) {
      hubitatUrl += `/${value}`;
    }
  }
  
  hubitatUrl += `?access_token=${ACCESS_TOKEN}`;

  try {
    console.log(`Proxying to Hubitat: ${hubitatUrl}`);
    
    // Forward request to Hubitat
    const hubitatResponse = await fetch(hubitatUrl, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    let responseData;
    const contentType = hubitatResponse.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await hubitatResponse.json();
    } else {
      responseData = await hubitatResponse.text();
    }

    return new Response(JSON.stringify(responseData), {
      status: hubitatResponse.status,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json',
      }
    });

  } catch (error) {
    console.error('Hubitat API Error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to communicate with Hubitat',
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