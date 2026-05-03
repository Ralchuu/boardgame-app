const http = require('node:http')
const { URL } = require('node:url')

const port = Number(process.env.PORT || 3001)
const searchUrl = 'https://store.steampowered.com/api/storesearch/'
const detailsUrl = 'https://store.steampowered.com/api/appdetails'

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

function sendJson(res, statusCode, payload) {
  setCorsHeaders(res)
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(payload))
}

async function forwardJson(targetUrl) {
  const response = await fetch(targetUrl, {
    headers: {
      Accept: 'application/json',
    },
  })

  return {
    status: response.status,
    contentType: response.headers.get('content-type') || 'application/json; charset=utf-8',
    body: await response.text(),
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)

    if (req.method === 'OPTIONS') {
      setCorsHeaders(res)
      res.writeHead(204)
      res.end()
      return
    }

    if (req.method !== 'GET') {
      sendJson(res, 405, { error: 'Method not allowed' })
      return
    }

    if (requestUrl.pathname === '/health') {
      sendJson(res, 200, { ok: true })
      return
    }

    if (requestUrl.pathname === '/api/steam/search' || requestUrl.pathname === '/search') {
      const query = requestUrl.searchParams.get('q') || requestUrl.searchParams.get('query') || ''

      if (!query.trim()) {
        sendJson(res, 400, { error: 'Missing q parameter' })
        return
      }

      // Request localized prices using Finland country code (EUR)
      const upstream = await forwardJson(`${searchUrl}?term=${encodeURIComponent(query.trim())}&l=en&cc=fi`)
      setCorsHeaders(res)
      res.writeHead(upstream.status, { 'Content-Type': upstream.contentType })
      res.end(upstream.body)
      return
    }

    if (requestUrl.pathname === '/api/steam/details' || requestUrl.pathname === '/details') {
      const appid = requestUrl.searchParams.get('appid')

      if (!appid || Number.isNaN(Number(appid))) {
        sendJson(res, 400, { error: 'Missing appid parameter' })
        return
      }

      // Request localized prices using Finland country code (EUR)
      const upstream = await forwardJson(`${detailsUrl}?appids=${appid}&l=en&cc=fi`)
      setCorsHeaders(res)
      res.writeHead(upstream.status, { 'Content-Type': upstream.contentType })
      res.end(upstream.body)
      return
    }

    sendJson(res, 404, { error: 'Not found' })
  } catch (error) {
    sendJson(res, 500, {
      error: 'Proxy error',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

server.listen(port, '0.0.0.0', () => {
  console.log(`Steam proxy listening on http://0.0.0.0:${port}`)
  console.log('Use /api/steam/search?q=... and /api/steam/details?appid=...')
})