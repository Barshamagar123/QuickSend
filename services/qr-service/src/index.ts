import express from 'express';
import QRCode from 'qrcode';
import Redis from 'ioredis';

const app = express();
const PORT = process.env.PORT || 3003;
const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';
const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:3000';

const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    console.warn(`Redis connection attempt ${times}`);
    return Math.min(times * 100, 2000);
  }
});

redis.on('error', (err) => {
  console.error('Redis Client Error', err);
});

app.get('/health', async (req, res) => {
  try {
    const redisStatus = redis.status;
    res.json({ status: 'OK', service: 'qr-service', redis: redisStatus });
  } catch (error: any) {
    res.status(500).json({ status: 'ERROR', error: error.message });
  }
});

app.get('/generate/:shortCode', async (req: any, res: any) => {
  try {
    const { shortCode } = req.params;
    const downloadUrl = `${GATEWAY_URL}/view/${shortCode}`;

    // Try to get from cache
    const cacheKey = `qr:${shortCode}`;
    let qrDataUrl: string | null = null;
    
    try {
      qrDataUrl = await redis.get(cacheKey);
    } catch (cacheErr) {
      console.error('Redis cache read failed:', cacheErr);
    }

    if (qrDataUrl) {
      return res.json({ qr: qrDataUrl, shortCode, downloadUrl, cached: true });
    }

    // Generate
    qrDataUrl = await QRCode.toDataURL(downloadUrl);

    // Save to cache (24 hours TTL)
    try {
      await redis.set(cacheKey, qrDataUrl, 'EX', 24 * 60 * 60);
    } catch (cacheErr) {
      console.error('Redis cache write failed:', cacheErr);
    }

    res.json({ qr: qrDataUrl, shortCode, downloadUrl, cached: false });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/generate/png/:shortCode', async (req: any, res: any) => {
  try {
    const { shortCode } = req.params;
    const downloadUrl = `${GATEWAY_URL}/view/${shortCode}`;

    const buffer = await QRCode.toBuffer(downloadUrl);
    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ QR service running on port ${PORT}`);
});
