import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors());

// Correlation ID Middleware
app.use((req: any, res: any, next: any) => {
  const correlationId = req.headers['x-request-id'] || uuidv4();
  req.headers['x-request-id'] = correlationId;
  res.setHeader('x-request-id', correlationId);
  next();
});

// Configure custom Morgan token for correlation ID
morgan.token('id', (req: any) => req.headers['x-request-id']);
app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - Request-ID: :id'));

// Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: { error: 'Too many requests, please try again later.' }
});

const uploadLimiter = rateLimit({
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
app.use('/upload', createProxyMiddleware({
  target: process.env.UPLOAD_SERVICE_URL || 'http://upload-service:3001',
  changeOrigin: true,
  pathRewrite: {
    '^/': '/upload'
  },
  on: {
    proxyReq: (proxyReq: any, req: any) => {
      if (req.headers['x-request-id']) {
        proxyReq.setHeader('X-Request-ID', req.headers['x-request-id']);
      }
    }
  }
}));

app.use('/view', createProxyMiddleware({
  target: process.env.VIEW_SERVICE_URL || 'http://view-service:3004',
  changeOrigin: true,
  pathRewrite: {
    '^/': '/view/'
  },
  on: {
    proxyReq: (proxyReq: any, req: any) => {
      if (req.headers['x-request-id']) {
        proxyReq.setHeader('X-Request-ID', req.headers['x-request-id']);
      }
    }
  }
}));

app.use('/qr', createProxyMiddleware({
  target: process.env.QR_SERVICE_URL || 'http://qr-service:3003',
  changeOrigin: true,
  pathRewrite: {
    '^/': '/generate/png/'
  },
  on: {
    proxyReq: (proxyReq: any, req: any) => {
      if (req.headers['x-request-id']) {
        proxyReq.setHeader('X-Request-ID', req.headers['x-request-id']);
      }
    }
  }
}));

// Route health requests to respective services for debugging
app.use('/services/:serviceName/health', (req: any, res: any, next: any) => {
  const serviceName = req.params.serviceName;
  let target = '';
  switch(serviceName) {
    case 'upload': target = process.env.UPLOAD_SERVICE_URL || 'http://upload-service:3001'; break;
    case 'link': target = process.env.LINK_SERVICE_URL || 'http://link-service:3002'; break;
    case 'qr': target = process.env.QR_SERVICE_URL || 'http://qr-service:3003'; break;
    case 'view': target = process.env.VIEW_SERVICE_URL || 'http://view-service:3004'; break;
    case 'storage': target = process.env.FILE_STORAGE_SERVICE_URL || 'http://file-storage-service:3005'; break;
    default: return res.status(404).json({ error: 'Service health check endpoint not found' });
  }

  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: () => '/health'
  })(req, res, next);
});

app.listen(PORT, () => {
  console.log(`✅ Gateway running on port ${PORT}`);
});
 