#!/usr/bin/env node
/**
 * Mock server for testing content-type detection and rich response rendering.
 *
 * Usage:
 *   node examples/integration/content-types-server.mjs
 *
 * Then in another terminal:
 *   npm run build && node dist/cli.js examples/integration/content-types.yaml
 *
 * Serves on http://localhost:4567
 */
import http from 'node:http';
import zlib from 'node:zlib';

const JSON_BODY = JSON.stringify(
	{ id: 1, name: 'Alice', active: true, tags: ['admin', 'user'] },
	null,
	2,
);

const XML_BODY = `<?xml version="1.0" encoding="UTF-8"?>
<users>
  <user id="1" role="admin">
    <name>Alice</name>
    <email>alice@example.com</email>
    <active>true</active>
  </user>
  <user id="2" role="member">
    <name>Bob</name>
    <email>bob@example.com</email>
    <active>false</active>
  </user>
</users>`;

const HTML_BODY = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Test Page</title>
  <style>body { font-family: sans-serif; }</style>
</head>
<body>
  <h1>Hello from the mock server</h1>
  <p>This is a <strong>test</strong> HTML response.</p>
  <ul>
    <li>Item one</li>
    <li>Item two</li>
    <li>Item three</li>
  </ul>
  <footer>
    <p>&copy; 2026 Content-Type Test</p>
  </footer>
</body>
</html>`;

const CSV_BODY = `id,name,email,role,active
1,Alice,alice@example.com,admin,true
2,Bob,bob@example.com,member,false
3,"Charlie, Jr.",charlie@example.com,member,true
4,Diana,diana@example.com,admin,true
5,Eve,"eve@example.com",member,false`;

const JS_BODY = `// User authentication module
const AUTH_SECRET = 'super-secret-key';

async function authenticate(username, password) {
  if (!username || !password) {
    throw new Error('Missing credentials');
  }

  const user = await db.findUser(username);
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.hash);
  return valid ? { id: user.id, role: user.role } : null;
}

export { authenticate };`;

const CSS_BODY = `/* Main application styles */
:root {
  --primary: #3b82f6;
  --danger: #ef4444;
  --spacing: 16px;
}

body {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: #1f2937;
  margin: 0;
  padding: var(--spacing);
}

.card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn-primary {
  background-color: var(--primary);
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 600;
}`;

const DOWNLOAD_REPORT_BODY = `Weekly Activity Report
====================
Generated: 2026-03-05T12:00:00.000Z

Users Active: 1,247
Requests Served: 84,329
Avg Response Time: 42ms
Error Rate: 0.3%

Top Endpoints:
  1. GET  /api/users        — 23,401 hits
  2. POST /api/orders       — 12,876 hits
  3. GET  /api/products     —  9,445 hits
`;

const DOWNLOAD_JSON_BODY = JSON.stringify(
	{
		exported_at: '2026-03-05T12:00:00.000Z',
		users: [
			{ id: 1, name: 'Alice', email: 'alice@example.com', role: 'admin' },
			{ id: 2, name: 'Bob', email: 'bob@example.com', role: 'member' },
			{ id: 3, name: 'Charlie', email: 'charlie@example.com', role: 'member' },
		],
		total: 3,
	},
	null,
	2,
);

// --- Real PNG generator ---
const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
	let c = i;
	for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
	CRC_TABLE[i] = c;
}
function crc32(buf) {
	let crc = 0xffffffff;
	for (let i = 0; i < buf.length; i++)
		crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
	return (crc ^ 0xffffffff) >>> 0;
}
function pngChunk(type, data) {
	const len = Buffer.alloc(4);
	len.writeUInt32BE(data.length);
	const t = Buffer.from(type, 'ascii');
	const body = Buffer.concat([t, data]);
	const crc = Buffer.alloc(4);
	crc.writeUInt32BE(crc32(body));
	return Buffer.concat([len, body, crc]);
}
function createPng(width, height, r, g, b) {
	const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
	const ihdr = Buffer.alloc(13);
	ihdr.writeUInt32BE(width, 0);
	ihdr.writeUInt32BE(height, 4);
	ihdr[8] = 8; // bit depth
	ihdr[9] = 2; // RGB
	const rowSize = 1 + width * 3;
	const raw = Buffer.alloc(rowSize * height);
	for (let y = 0; y < height; y++) {
		const off = y * rowSize;
		raw[off] = 0; // no filter
		for (let x = 0; x < width; x++) {
			raw[off + 1 + x * 3] = r;
			raw[off + 2 + x * 3] = g;
			raw[off + 3 + x * 3] = b;
		}
	}
	return Buffer.concat([
		sig,
		pngChunk('IHDR', ihdr),
		pngChunk('IDAT', zlib.deflateSync(raw)),
		pngChunk('IEND', Buffer.alloc(0)),
	]);
}

// 16×16 solid cyan for /save/image
const DOWNLOAD_IMAGE_BODY = createPng(16, 16, 0, 188, 212);
// 16×16 solid red for /data/binary
const BINARY_BODY = createPng(16, 16, 220, 38, 38);

const routes = {
	'/data/json': (_req, res) => {
		res.writeHead(200, { 'Content-Type': 'application/json' });
		res.end(JSON_BODY);
	},
	'/data/xml': (_req, res) => {
		res.writeHead(200, { 'Content-Type': 'application/xml' });
		res.end(XML_BODY);
	},
	'/data/html': (_req, res) => {
		res.writeHead(200, { 'Content-Type': 'text/html' });
		res.end(HTML_BODY);
	},
	'/data/csv': (_req, res) => {
		res.writeHead(200, { 'Content-Type': 'text/csv' });
		res.end(CSV_BODY);
	},
	'/data/javascript': (_req, res) => {
		res.writeHead(200, { 'Content-Type': 'application/javascript' });
		res.end(JS_BODY);
	},
	'/data/css': (_req, res) => {
		res.writeHead(200, { 'Content-Type': 'text/css' });
		res.end(CSS_BODY);
	},
	'/save/report': (_req, res) => {
		res.writeHead(200, {
			'Content-Type': 'text/plain',
			'Content-Disposition': 'attachment; filename="report.txt"',
		});
		res.end(DOWNLOAD_REPORT_BODY);
	},
	'/save/export': (_req, res) => {
		res.writeHead(200, {
			'Content-Type': 'application/json',
			'Content-Disposition': 'attachment; filename="users-export.json"',
		});
		res.end(DOWNLOAD_JSON_BODY);
	},
	'/save/image': (_req, res) => {
		res.writeHead(200, {
			'Content-Type': 'image/png',
			'Content-Disposition': 'attachment; filename="thumbnail.png"',
		});
		res.end(DOWNLOAD_IMAGE_BODY);
	},
	'/data/binary': (_req, res) => {
		res.writeHead(200, { 'Content-Type': 'application/octet-stream' });
		res.end(BINARY_BODY);
	},
	'/data/multi-format': (req, res) => {
		const url = new URL(req.url, 'http://localhost');
		const format = url.searchParams.get('format') ?? 'json';
		if (format === 'xml') {
			res.writeHead(200, { 'Content-Type': 'application/xml' });
			res.end(XML_BODY);
		} else if (format === 'csv') {
			res.writeHead(200, { 'Content-Type': 'text/csv' });
			res.end(CSV_BODY);
		} else {
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.end(JSON_BODY);
		}
	},
	'/upload/avatar': (_req, res) => {
		res.writeHead(200, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({ url: 'https://cdn.example.com/avatars/1.png' }));
	},
	'/upload/documents': (_req, res) => {
		res.writeHead(201, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({ id: 'doc-42', status: 'uploaded' }));
	},
};

const server = http.createServer((req, res) => {
	const pathname = new URL(req.url, 'http://localhost').pathname;
	const handler = routes[pathname];
	if (handler) {
		handler(req, res);
	} else {
		res.writeHead(404, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({ error: 'Not found', path: pathname }));
	}
});

server.listen(4567, () => {
	console.log('Content-type test server running on http://localhost:4567');
	console.log('');
	console.log('Available endpoints:');
	console.log('  GET  /data/json          → application/json');
	console.log('  GET  /data/xml           → application/xml');
	console.log('  GET  /data/html          → text/html');
	console.log('  GET  /data/csv           → text/csv');
	console.log('  GET  /data/javascript    → application/javascript');
	console.log('  GET  /data/css           → text/css');
	console.log('  GET  /data/binary        → application/octet-stream');
	console.log('  GET  /data/multi-format  → json/xml/csv via ?format=');
	console.log('');
	console.log('  Save / download (press w on response to save):');
	console.log(
		'  GET  /save/report        → text/plain (attachment: report.txt)',
	);
	console.log(
		'  GET  /save/export        → application/json (attachment: users-export.json)',
	);
	console.log(
		'  GET  /save/image         → image/png (attachment: thumbnail.png)',
	);
	console.log('');
	console.log('  POST /upload/avatar      → multipart/form-data (file field)');
	console.log(
		'  POST /upload/documents   → multipart/form-data (2 file fields)',
	);
	console.log('');
	console.log('Press Ctrl+C to stop.');
});
