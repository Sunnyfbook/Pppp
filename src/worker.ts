// Cloudflare Worker script to serve the React app
export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // Handle API routes if needed
    if (url.pathname.startsWith('/api/')) {
      return handleApiRequest(request, env);
    }
    
    // For all other requests, serve the React app
    return handleStaticRequest(request, env);
  }
};

async function handleApiRequest(request: Request, env: any): Promise<Response> {
  // Handle any API routes here if needed
  // For now, return a simple response
  return new Response(JSON.stringify({ message: 'API endpoint' }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleStaticRequest(request: Request, env: any): Promise<Response> {
  const url = new URL(request.url);
  
  // Get the pathname, defaulting to index.html for root
  let pathname = url.pathname;
  if (pathname === '/') {
    pathname = '/index.html';
  }
  
  // Try to get the file from the KV store or static assets
  try {
    // For Cloudflare Pages, we'll use the built-in asset serving
    // This will be handled by the _worker.js file in the dist folder
    const response = await env.ASSETS.fetch(new Request(url.toString()));
    
    if (response.status === 404) {
      // If file not found, serve index.html for SPA routing
      return await env.ASSETS.fetch(new Request(new URL('/index.html', url.origin).toString()));
    }
    
    return response;
  } catch (error) {
    // Fallback: serve index.html for SPA routing
    return new Response('Not Found', { status: 404 });
  }
}
