# Cloudflare Workers Deployment Guide

This guide will help you deploy your React application to Cloudflare Workers/Pages.

## Prerequisites

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
2. **Wrangler CLI**: Install the Cloudflare CLI tool
3. **Node.js**: Version 18 or higher

## Installation

1. Install Wrangler CLI globally:
```bash
npm install -g wrangler
```

2. Install project dependencies:
```bash
npm install
```

## Authentication

1. Login to Cloudflare:
```bash
wrangler login
```

2. This will open a browser window for authentication.

## Deployment Options

### Option 1: Cloudflare Pages (Recommended)

Cloudflare Pages is the easiest way to deploy static React applications.

1. **Build the project:**
```bash
npm run build:cf
```

2. **Deploy to Cloudflare Pages:**
```bash
npm run deploy
```

3. **Alternative: Deploy via Cloudflare Dashboard:**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Navigate to "Pages"
   - Click "Create a project"
   - Connect your Git repository
   - Set build settings:
     - Build command: `npm run build:cf`
     - Build output directory: `dist`
     - Root directory: `/`

### Option 2: Cloudflare Workers

For more advanced use cases with server-side logic.

1. **Deploy as a Worker:**
```bash
npm run deploy:worker
```

## Environment Variables

The following environment variables are already configured in `wrangler.toml`:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

To add more environment variables:

1. **For Cloudflare Pages:**
   - Go to your project in Cloudflare Dashboard
   - Navigate to Settings > Environment variables
   - Add your variables

2. **For Cloudflare Workers:**
   - Update `wrangler.toml` file
   - Add variables under `[vars]` section

## Custom Domain

1. **In Cloudflare Dashboard:**
   - Go to your Pages project
   - Navigate to "Custom domains"
   - Add your domain
   - Follow DNS setup instructions

## Development

To test locally with Cloudflare Workers:

```bash
npm run cf:dev
```

This will start a local development server that mimics the Cloudflare Workers environment.

## Troubleshooting

### Common Issues:

1. **Build Failures:**
   - Ensure all dependencies are installed: `npm install`
   - Check Node.js version: `node --version` (should be 18+)

2. **Environment Variables Not Working:**
   - Verify variables are set in Cloudflare Dashboard
   - Check `wrangler.toml` configuration

3. **Routing Issues:**
   - The `_worker.js` file handles SPA routing
   - Ensure all routes fallback to `index.html`

### Useful Commands:

```bash
# Check Wrangler version
wrangler --version

# List your projects
wrangler pages project list

# View deployment logs
wrangler pages deployment tail

# Delete a deployment
wrangler pages deployment delete <deployment-id>
```

## File Structure

The following files were added/modified for Cloudflare deployment:

- `wrangler.toml` - Cloudflare Workers configuration
- `public/_worker.js` - Worker script for SPA routing
- `src/worker.ts` - TypeScript worker source
- `package.json` - Updated with deployment scripts
- `vite.config.ts` - Updated build configuration

## Support

If you encounter issues:

1. Check the [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/)
2. Review the [Cloudflare Pages documentation](https://developers.cloudflare.com/pages/)
3. Check the [Wrangler CLI documentation](https://developers.cloudflare.com/workers/wrangler/)

## Next Steps

After successful deployment:

1. Test all routes and functionality
2. Set up custom domain if needed
3. Configure analytics and monitoring
4. Set up CI/CD for automatic deployments
