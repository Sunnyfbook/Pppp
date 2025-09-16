// Cloudflare Pages Worker for SPA routing
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle API routes if needed
    if (url.pathname.startsWith('/api/')) {
      return handleApiRequest(request, env);
    }
    
    // For all other requests, serve the React app
    return handleStaticRequest(request, env);
  }
};

async function handleApiRequest(request, env) {
  // Handle any API routes here if needed
  // For now, return a simple response
  return new Response(JSON.stringify({ message: 'API endpoint' }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleStaticRequest(request, env) {
  const url = new URL(request.url);
  
  // Try to get the file from the static assets
  try {
    const response = await env.ASSETS.fetch(request);
    
    if (response.status === 404) {
      // If file not found, serve index.html for SPA routing
      const indexRequest = new Request(new URL('/index.html', url.origin).toString(), request);
      return await env.ASSETS.fetch(indexRequest);
    }
    
    return response;
  } catch (error) {
    // Fallback: serve index.html for SPA routing
    const indexRequest = new Request(new URL('/index.html', url.origin).toString(), request);
    return await env.ASSETS.fetch(indexRequest);
  }
}
