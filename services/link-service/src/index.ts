import express from 'express';
import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3002;

app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    await prisma.$connect();
    res.json({ status: 'OK', service: 'link-service', db: 'connected' });
  } catch (error) {
    // Fix: Type assertion for error
    const err = error as Error;
    res.status(500).json({ status: 'ERROR', error: err.message });
  }
});

app.post('/create', async (req, res) => {
  try {
    const { fileId } = req.body;
    const shortCode = nanoid(6);
    
    const link = await prisma.link.create({
      data: { shortCode, fileId }
    });
    
    res.json({ shortCode: link.shortCode, fileId: link.fileId });
  } catch (error) {
    // Fix: Type assertion for error
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
});

app.get('/resolve/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    const link = await prisma.link.findUnique({ where: { shortCode } });
    
    if (!link) return res.status(404).json({ error: 'Not found' });
    res.json({ fileId: link.fileId });
  } catch (error) {
    // Fix: Type assertion for error
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Link service running on port ${PORT}`);
});
