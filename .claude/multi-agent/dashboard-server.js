#!/usr/bin/env node
/**
 * Dashboard Live Server
 * dashboard.md をfs.watchで監視し、WebSocketでブラウザにリアルタイム配信する。
 *
 * 使い方:
 *   node dashboard-server.js [dashboard.mdのパス] [ポート]
 */

const http = require('http')
const fs = require('fs')
const path = require('path')
const { WebSocketServer } = require('ws')

const DASHBOARD_PATH = path.resolve(process.argv[2] || path.join(__dirname, 'dashboard.md'))
const HTML_PATH = path.join(__dirname, 'dashboard.html')
const PORT = parseInt(process.argv[3] || '3333', 10)

// HTTP server
const server = http.createServer((req, res) => {
  const html = fs.readFileSync(HTML_PATH, 'utf8')
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
  res.end(html)
})

// WebSocket server
const wss = new WebSocketServer({ server, path: '/ws' })

function broadcast() {
  try {
    const data = fs.readFileSync(DASHBOARD_PATH, 'utf8')
    for (const client of wss.clients) {
      if (client.readyState === 1) client.send(data)
    }
  } catch (err) {
    console.error('Read error:', err.message)
  }
}

wss.on('connection', (ws) => {
  try {
    const data = fs.readFileSync(DASHBOARD_PATH, 'utf8')
    ws.send(data)
  } catch {}
})

// Watch file
let debounce = null
fs.watch(DASHBOARD_PATH, () => {
  clearTimeout(debounce)
  debounce = setTimeout(broadcast, 200)
})

server.listen(PORT, () => {
  console.log('\n⚔️  Shogun Dashboard Live')
  console.log('   http://localhost:' + PORT)
  console.log('   Watching: ' + DASHBOARD_PATH)
  console.log('   Ctrl+C to stop\n')
})
