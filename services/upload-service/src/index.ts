import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 3001;
const upload = multer({ dest: '/tmp/uploads/' });

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'upload-service' });
});

app.post('/upload', upload.single('file'), (req, res) => {
  const fileId = uuidv4();
  res.json({ fileId, filename: req.file?.originalname, status: 'received' });
});

app.listen(PORT, () => {
  console.log(`✅ Upload service running on port ${PORT}`);
});
