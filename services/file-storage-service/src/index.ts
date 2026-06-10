import express from 'express';

const app = express();
const PORT = process.env.PORT || 3005;

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'file-storage-service' });
});

app.listen(PORT, () => {
  console.log(`✅ File storage service running on port ${PORT}`);
});
