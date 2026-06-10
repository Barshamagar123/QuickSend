import express from 'express';
import QRCode from 'qrcode';

const app = express();
const PORT = process.env.PORT || 3003;

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'qr-service' });
});

app.get('/generate/:data', async (req, res) => {
  try {
    const { data } = req.params;
    const qr = await QRCode.toDataURL(data);
    res.json({ qr, data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ QR service running on port ${PORT}`);
});
