
import { createProxyMiddleware } from 'http-proxy-middleware';

const proxy = createProxyMiddleware({
    target: 'http://localhost:8501',
    ws: true,
});

console.log('Type of proxy:', typeof proxy);
console.log('proxy.upgrade exists:', typeof proxy.upgrade);
