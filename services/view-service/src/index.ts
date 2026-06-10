import express from 'express';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 3004;

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'view-service' });
});

app.get('/view/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    const linkRes = await axios.get(`http://link-service:3002/resolve/${shortCode}`);
    res.json({ shortCode, fileId: linkRes.data.fileId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ View service running on port ${PORT}`);
});
