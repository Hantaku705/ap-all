#!/usr/bin/env node
/**
 * Dashboard Live Server
 * dashboard.md をfs.watchで監視し、WebSocketでブラウザにリアルタイム配信する。
 *
 * 使い方:
 *   node dashboard-server.js [dashboard.mdのパス] [ポート]
 *
 * 例:
 *   node dashboard-server.js                          # デフォルト（./dashboard.md, port 3333）
 *   node dashboard-server.js /path/to/dashboard.md    # パス指定
 *   node dashboard-server.js ./dashboard.md 8080      # ポート指定
 */

const http = require('http')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const DASHBOARD_PATH = path.resolve(process.argv[2] || path.join(__dirname, 'dashboard.md'))
const HTML_PATH = path.join(__dirname, 'dashboard.html')
const PORT = parseInt(process.argv[3] || '3333', 10)

// --- WebSocket helpers ---
function acceptWs(req, socket) {
  const key = req.headers['sec-websocket-key']
  const accept = crypto.createHash('sha1')
    .update(key + '258EAFA5-E914-47DA-95CA-5AB9DC11E5B0')
    .digest('base64')
  socket.write(
    'HTTP/1.1 101 Switching Protocols\r\n' +
    'Upgrade: websocket\r\n' +
    'Connection: Upgrade\r\n' +
    'Sec-WebSocket-Accept: ' + accept + '\r\n\r\n'
  )
  return socket
}

function sendWsFrame(socket, data) {
  const buf = Buffer.from(data, 'utf8')
  const len = buf.length
  let header
  if (len < 126) {
    header = Buffer.alloc(2)
    header[0] = 0x81
    header[1] = len
  } else if (len < 65536) {
    header = Buffer.alloc(4)
    header[0] = 0x81
    header[1] = 126
    header.writeUInt16BE(len, 2)
  } else {
    header = Buffer.alloc(10)
    header[0] = 0x81
    header[1] = 127
    header.writeBigUInt64BE(BigInt(len), 2)
  }
  socket.write(Buffer.concat([header, buf]))
}

// --- Main ---
const clients = new Set()

function broadcast() {
  try {
    const data = fs.readFileSync(DASHBOARD_PATH, 'utf8')
    for (const socket of clients) {
      try { sendWsFrame(socket, data) } catch { clients.delete(socket) }
    }
  } catch (err) {
    console.error('Read error:', err.message)
  }
}

// Watch file
let debounce = null
fs.watch(DASHBOARD_PATH, () => {
  clearTimeout(debounce)
  debounce = setTimeout(broadcast, 200)
})

// HTTP server
const server = http.createServer((req, res) => {
  const html = fs.readFileSync(HTML_PATH, 'utf8')
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
  res.end(html)
})

// WebSocket upgrade
server.on('upgrade', (req, socket) => {
  if (req.url === '/ws') {
    acceptWs(req, socket)
    clients.add(socket)
    try {
      const data = fs.readFileSync(DASHBOARD_PATH, 'utf8')
      sendWsFrame(socket, data)
    } catch {}
    socket.on('close', () => clients.delete(socket))
    socket.on('error', () => clients.delete(socket))
  }
})

server.listen(PORT, () => {
  console.log('\n⚔️  Shogun Dashboard Live')
  console.log('   http://localhost:' + PORT)
  console.log('   Watching: ' + DASHBOARD_PATH)
  console.log('   Ctrl+C to stop\n')
})
