import express from 'express';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import amqp from 'amqplib';

const app = express();
const PORT = process.env.PORT || 3001;

const FILE_STORAGE_SERVICE_URL = process.env.FILE_STORAGE_SERVICE_URL || 'http://file-storage-service:3005';
const LINK_SERVICE_URL = process.env.LINK_SERVICE_URL || 'http://link-service:3002';
const QR_SERVICE_URL = process.env.QR_SERVICE_URL || 'http://qr-service:3003';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';
const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:3000';

const upload = multer({ dest: '/tmp/uploads/' });

app.use(express.json());

// RabbitMQ connection setup
let channel: amqp.Channel | null = null;
async function initRabbitMQ() {
  const retries = 5;
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Connecting to RabbitMQ at ${RABBITMQ_URL} (attempt ${i + 1}/${retries})...`);
      const connection = await amqp.connect(RABBITMQ_URL);
      channel = await connection.createChannel();
      await channel.assertQueue('file.uploaded', { durable: true });
      console.log('✅ Connected to RabbitMQ');
      return;
    } catch (error) {
      console.error('RabbitMQ connection failed, retrying in 5 seconds...', error);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}
initRabbitMQ();

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'upload-service',
    rabbitmq: channel ? 'connected' : 'disconnected'
  });
});

app.post('/upload', upload.single('file'), async (req: any, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { expiresInHours } = req.body;

    // 1. Send file to file-storage-service
    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path), {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const storageRes = await axios.post(`${FILE_STORAGE_SERVICE_URL}/store`, formData, {
      headers: formData.getHeaders(),
    });
    const { fileId } = storageRes.data;

    // Clean up local temp file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    // 2. Create link using link-service
    const linkRes = await axios.post(`${LINK_SERVICE_URL}/create`, {
      fileId,
      expiresInHours: expiresInHours ? parseInt(expiresInHours, 10) : 24
    });
    const { shortCode, expiresAt } = linkRes.data;

    // 3. Generate QR code using qr-service
    // We request qr-service to encode the shortCode, which it will resolve to the full link
    const qrRes = await axios.get(`${QR_SERVICE_URL}/generate/${shortCode}`);
    const { qr } = qrRes.data;

    const downloadUrl = `${GATEWAY_URL}/view/${shortCode}`;

    // 4. Publish message to RabbitMQ queue
    if (channel) {
      const message = JSON.stringify({ fileId, shortCode, expiresAt });
      channel.sendToQueue('file.uploaded', Buffer.from(message), { persistent: true });
      console.log(`[Queue] Published upload event for shortCode: ${shortCode}`);
    } else {
      console.warn('[Queue] RabbitMQ channel not ready. Message not published.');
    }

    res.json({
      fileId,
      shortCode,
      downloadUrl,
      qr,
      expiresAt
    });
  } catch (error: any) {
    console.error('Error during upload orchestrate:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Upload service running on port ${PORT}`);
});
