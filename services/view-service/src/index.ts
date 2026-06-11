import express from 'express';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 3004;

const LINK_SERVICE_URL = process.env.LINK_SERVICE_URL || 'http://link-service:3002';
const FILE_STORAGE_SERVICE_URL = process.env.FILE_STORAGE_SERVICE_URL || 'http://file-storage-service:3005';

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'view-service' });
});

// GET /view/:shortCode - Download the file
app.get('/view/:shortCode', async (req: any, res: any) => {
  try {
    const { shortCode } = req.params;

    // 1. Resolve shortCode to fileId
    let fileId: string;
    try {
      const linkRes = await axios.get(`${LINK_SERVICE_URL}/resolve/${shortCode}`);
      fileId = linkRes.data.fileId;
    } catch (err: any) {
      if (err.response && err.response.status === 410) {
        return res.status(410).json({ error: 'Link has expired' });
      }
      if (err.response && err.response.status === 404) {
        return res.status(404).json({ error: 'Link not found' });
      }
      throw err;
    }

    // 2. Fetch/stream file from file-storage-service and pipe to client
    const fileUrl = `${FILE_STORAGE_SERVICE_URL}/file/${fileId}`;
    const fileStreamRes = await axios({
      method: 'get',
      url: fileUrl,
      responseType: 'stream'
    });

    // Pass headers
    res.setHeader('Content-Type', fileStreamRes.headers['content-type'] || 'application/octet-stream');
    res.setHeader('Content-Disposition', fileStreamRes.headers['content-disposition'] || 'attachment');
    if (fileStreamRes.headers['content-length']) {
      res.setHeader('Content-Length', fileStreamRes.headers['content-length']);
    }

    fileStreamRes.data.pipe(res);
  } catch (error: any) {
    console.error('Error serving file:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET /preview/:shortCode - Preview metadata
app.get('/preview/:shortCode', async (req: any, res: any) => {
  try {
    const { shortCode } = req.params;

    // 1. Resolve shortCode
    let fileId: string;
    try {
      const linkRes = await axios.get(`${LINK_SERVICE_URL}/resolve/${shortCode}`);
      fileId = linkRes.data.fileId;
    } catch (err: any) {
      if (err.response && err.response.status === 410) {
        return res.status(410).json({ error: 'Link has expired' });
      }
      if (err.response && err.response.status === 404) {
        return res.status(404).json({ error: 'Link not found' });
      }
      throw err;
    }

    // 2. Get metadata
    const metaRes = await axios.get(`${FILE_STORAGE_SERVICE_URL}/metadata/${fileId}`);
    res.json(metaRes.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ View service running on port ${PORT}`);
});
