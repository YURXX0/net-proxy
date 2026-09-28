// language: JavaScript, file: server.js, target: Node.js / Railway
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

app.use('/proxy', (req, res, next) => {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).send('Missing target URL');
    
    let parsedUrl;
    try {
        parsedUrl = new URL(targetUrl);
    } catch (e) {
        return res.status(400).send('Invalid URL format');
    }

    return createProxyMiddleware({
        target: parsedUrl.origin,
        changeOrigin: true,
        router: () => parsedUrl.origin,
        pathRewrite: () => parsedUrl.pathname + parsedUrl.search,
        onProxyRes: (proxyRes) => {
            delete proxyRes.headers['x-frame-options'];
            delete proxyRes.headers['content-security-policy'];
        }
    })(req, res, next);
});

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>Gateway</title></head>
        <body style="background:#111;color:#eee;font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;">
            <form action="/proxy" method="GET" style="display:flex;gap:10px;">
                <input type="text" name="url" placeholder="https://example.com" style="padding:10px;width:300px;background:#222;border:1px solid #444;color:#fff;" required>
                <button type="submit" style="padding:10px 20px;background:#007acc;color:#fff;border:none;cursor:pointer;">Go</button>
            </form>
        </body>
        </html>
    `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy active on port ${PORT}`));
