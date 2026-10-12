import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import dotenv from 'dotenv'

// Muat variabel environment dari .env jika ada
dotenv.config()

// Middleware dev untuk meniru fungsi Vercel Serverless /api/token saat npm run dev
function devApiPlugin() {
  return {
    name: 'dev-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/token')) {
          const { handleTokenRequest } = await import('./api/token.js')
          
          if (req.method === 'POST') {
            let body = ''
            req.on('data', chunk => { body += chunk })
            req.on('end', async () => {
              try {
                const parsedBody = body ? JSON.parse(body) : {}
                const fakeReq = {
                  method: req.method,
                  headers: req.headers,
                  body: parsedBody,
                  query: {}
                }
                const fakeRes = {
                  statusCode: 200,
                  headers: {},
                  setHeader(k, v) { this.headers[k] = v; res.setHeader(k, v) },
                  status(code) { this.statusCode = code; res.statusCode = code; return this },
                  json(data) {
                    res.setHeader('Content-Type', 'application/json')
                    res.end(JSON.stringify(data))
                  }
                }
                await handleTokenRequest(fakeReq, fakeRes)
              } catch (err) {
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: 'Server dev error: ' + err.message }))
              }
            })
            return
          } else if (req.method === 'GET') {
            const fakeReq = { method: 'GET', headers: req.headers, query: {} }
            const fakeRes = {
              statusCode: 200,
              status(code) { this.statusCode = code; res.statusCode = code; return this },
              json(data) {
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify(data))
              }
            }
            const { handleTokenRequest } = await import('./api/token.js')
            await handleTokenRequest(fakeReq, fakeRes)
            return
          }
        }
        next()
      })
    }
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    devApiPlugin()
  ],
})
