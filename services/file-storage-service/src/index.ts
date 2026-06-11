import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 3005;
const STORAGE_DIR = '/app/storage';

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

// Set up multer destination
const upload = multer({ dest: STORAGE_DIR });

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'file-storage-service' });
});

// POST /store - upload a file
app.post('/store', upload.single('file'), (req: any, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileId = uuidv4();
    const tempPath = req.file.path;
    const targetPath = path.join(STORAGE_DIR, fileId);
    
    // Rename temp file to fileId
    fs.renameSync(tempPath, targetPath);

    // Save metadata to fileId.json
    const metadata = {
      fileId,
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedAt: new Date().toISOString()
    };

    fs.writeFileSync(`${targetPath}.json`, JSON.stringify(metadata, null, 2));

    res.json(metadata);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /file/:fileId - stream file
app.get('/file/:fileId', (req: any, res: any) => {
  try {
    const { fileId } = req.params;
    const filePath = path.join(STORAGE_DIR, fileId);
    const metaPath = `${filePath}.json`;

    if (!fs.existsSync(filePath) || !fs.existsSync(metaPath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const metadata = JSON.parse(fs.readFileSync(metaPath, 'utf8'));

    res.setHeader('Content-Type', metadata.mimetype);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(metadata.filename)}"`);
    res.setHeader('Content-Length', metadata.size);

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /metadata/:fileId - get file metadata
app.get('/metadata/:fileId', (req: any, res: any) => {
  try {
    const { fileId } = req.params;
    const metaPath = path.join(STORAGE_DIR, `${fileId}.json`);

    if (!fs.existsSync(metaPath)) {
      return res.status(404).json({ error: 'Metadata not found' });
    }

    const metadata = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    res.json(metadata);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /file/:fileId - delete file
app.delete('/file/:fileId', (req: any, res: any) => {
  try {
    const { fileId } = req.params;
    const filePath = path.join(STORAGE_DIR, fileId);
    const metaPath = `${filePath}.json`;

    let deleted = false;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      deleted = true;
    }
    if (fs.existsSync(metaPath)) {
      fs.unlinkSync(metaPath);
      deleted = true;
    }

    if (!deleted) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json({ success: true, message: `File ${fileId} deleted successfully` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ File storage service running on port ${PORT}`);
});
