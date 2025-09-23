/**
 * Cloudflare Pages Function para fazer proxy das requisições ao Hubitat
 * Resolve problemas de CORS e centraliza as chamadas
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

  // Extract device ID and command from URL
  // Expected format: /api/hubitat/{deviceId}/{command?}/{value?}
  const pathParts = url.pathname.split('/').filter(Boolean);
  
  if (pathParts.length < 3 || pathParts[0] !== 'api' || pathParts[1] !== 'hubitat') {
    return new Response('Invalid API path', { 
      status: 400,
      headers: CORS_HEADERS 
    });
  }

  const deviceId = pathParts[2];
  const command = pathParts[3] || null;
  const value = pathParts[4] || null;

  // Build Hubitat URL
  const HUBITAT_BASE_URL = env.HUBITAT_BASE_URL || 'https://cloud.hubitat.com/api/e45cb756-9028-44c2-8a00-e6fb3651856c/apps/172/devices';
  const ACCESS_TOKEN = env.HUBITAT_ACCESS_TOKEN || '8204fd02-e90e-4c0d-b083-431625526d10';

  let hubitatUrl = `${HUBITAT_BASE_URL}/${deviceId}`;
  
  if (command) {
    hubitatUrl += `/${command}`;
    if (value !== null) {
      hubitatUrl += `/${value}`;
    }
  }
  
  hubitatUrl += `?access_token=${ACCESS_TOKEN}`;

  try {
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