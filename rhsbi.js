// api/proxy.js
import crypto from 'crypto';

export default async function handler(req, res) {
    // Basic CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Extract parameters from Body (POST) or Query (GET)
    const targetUrl = req.body?.target_url || req.query?.target_url;
    const method = req.body?.method || req.query?.method || 'GET';
    const payloadRaw = req.body?.payload || '';

    if (!targetUrl) {
        return res.status(400).json({ success: false, error: "No target URL provided" });
    }

    // 🔥 DYNAMIC UUID GENERATOR - Fixes Ghosting & Bans
    const dynamicRandomId = crypto.randomUUID();
    
    // Extract Token or use Default
    const authHeader = req.headers['authorization'] || 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE3ODA4MjA1MTkuNTEsImRhdGEiOnsiX2lkIjoiNjllMTg1ZTExYzdjYmVkYzI2NThkM2FmIiwidXNlcm5hbWUiOiI5NDU4NDM1NTY1IiwiZmlyc3ROYW1lIjoiS2FpemVuIiwib3JnYW5pemF0aW9uIjp7Il9pZCI6IjVlYjM5M2VlOTVmYWI3NDY4YTc5ZDE4OSIsIndlYnNpdGUiOiJwaHlzaWNzd2FsbGFoLmNvbSIsIm5hbWUiOiJQaHlzaWNzd2FsbGFoIn0sInJvbGVzIjpbIjViMjdiZDk2NTg0MmY5NTBhNzc4YzZlZiJdLCJjb3VudHJ5R3JvdXAiOiJJTiIsInR5cGUiOiJVU0VSIn0sImp0aSI6IjNnU19WS0xEUnpxd0o4QXgzTTJJZkFfNjllMTg1ZTExYzdjYmVkYzI2NThkM2FmIiwiaWF0IjoxNzgwMjE1NzE5fQ.noEb5vUXuEAePKTZbzf3F-TWagRtAVEJSzIdH19SkmM';

    // 🚨 EXACT PW HEADERS
    const pwHeaders = {
        'Authorization': authHeader,
        'client-id': '5eb393ee95fab7468a79d189',
        'client-type': 'WEB',
        'version': '0.0.1',
        'X-SDK-Version': '0.0.20',
        'client-version': '200',
        'content-type': 'application/json',
        'randomid': dynamicRandomId // Assigned uniquely per request
    };

    try {
        const fetchOptions = {
            method: method.toUpperCase(),
            headers: pwHeaders,
        };

        if ((fetchOptions.method === 'POST' || fetchOptions.method === 'PUT') && payloadRaw) {
            fetchOptions.body = payloadRaw;
        }

        const response = await fetch(targetUrl, fetchOptions);
        const data = await response.text();

        return res.status(200).send(data);
    } catch (error) {
        console.error("Proxy Error:", error);
        return res.status(500).json({ success: false, error: "Vercel Proxy Error", details: error.message });
    }
}
