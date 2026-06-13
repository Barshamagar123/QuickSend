"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = require("express-rate-limit");
const http_proxy_middleware_1 = require("http-proxy-middleware");
const uuid_1 = require("uuid");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false
}));
app.use((0, cors_1.default)());
// Correlation ID Middleware
app.use((req, res, next) => {
    const correlationId = req.headers['x-request-id'] || (0, uuid_1.v4)();
    req.headers['x-request-id'] = correlationId;
    res.setHeader('x-request-id', correlationId);
    next();
});
// Configure custom Morgan token for correlation ID
morgan_1.default.token('id', (req) => req.headers['x-request-id']);
app.use((0, morgan_1.default)(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - Request-ID: :id'));
// Rate Limiting
const generalLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    message: { error: 'Too many requests, please try again later.' }
});
const uploadLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: { error: 'Too many uploads, please try again later.' }
});
app.use('/health', generalLimiter);
app.use('/view', generalLimiter);
app.use('/qr', generalLimiter);
app.use('/upload', uploadLimiter);
app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'gateway', timestamp: new Date() });
});
// Proxy routes
app.use('/upload', (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: process.env.UPLOAD_SERVICE_URL || 'http://upload-service:3001',
    changeOrigin: true,
    pathRewrite: {
        '^/': '/upload'
    },
    on: {
        proxyReq: (proxyReq, req) => {
            if (req.headers['x-request-id']) {
                proxyReq.setHeader('X-Request-ID', req.headers['x-request-id']);
            }
        }
    }
}));
app.use('/view', (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: process.env.VIEW_SERVICE_URL || 'http://view-service:3004',
    changeOrigin: true,
    pathRewrite: {
        '^/': '/view/'
    },
    on: {
        proxyReq: (proxyReq, req) => {
            if (req.headers['x-request-id']) {
                proxyReq.setHeader('X-Request-ID', req.headers['x-request-id']);
            }
        }
    }
}));
app.use('/qr', (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: process.env.QR_SERVICE_URL || 'http://qr-service:3003',
    changeOrigin: true,
    pathRewrite: {
        '^/': '/generate/png/'
    },
    on: {
        proxyReq: (proxyReq, req) => {
            if (req.headers['x-request-id']) {
                proxyReq.setHeader('X-Request-ID', req.headers['x-request-id']);
            }
        }
    }
}));
// Route health requests to respective services for debugging
app.use('/services/:serviceName/health', (req, res, next) => {
    const serviceName = req.params.serviceName;
    let target = '';
    switch (serviceName) {
        case 'upload':
            target = process.env.UPLOAD_SERVICE_URL || 'http://upload-service:3001';
            break;
        case 'link':
            target = process.env.LINK_SERVICE_URL || 'http://link-service:3002';
            break;
        case 'qr':
            target = process.env.QR_SERVICE_URL || 'http://qr-service:3003';
            break;
        case 'view':
            target = process.env.VIEW_SERVICE_URL || 'http://view-service:3004';
            break;
        case 'storage':
            target = process.env.FILE_STORAGE_SERVICE_URL || 'http://file-storage-service:3005';
            break;
        default: return res.status(404).json({ error: 'Service health check endpoint not found' });
    }
    (0, http_proxy_middleware_1.createProxyMiddleware)({
        target,
        changeOrigin: true,
        pathRewrite: () => '/health'
    })(req, res, next);
});
app.listen(PORT, () => {
    console.log(`✅ Gateway running on port ${PORT}`);
});
