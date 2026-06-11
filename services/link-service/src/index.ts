import express from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3002;

app.use(express.json());

// Generate random 6-character code without nanoid
function generateShortCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Health check - tests database connection
app.get('/health', async (req, res) => {
  try {
    await prisma.$connect();
    res.json({ 
      status: 'OK', 
      service: 'link-service', 
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ 
      status: 'ERROR', 
      service: 'link-service', 
      database: 'disconnected',
      error: error.message 
    });
  }
});

// Create a short link - SAVES TO DATABASE
app.post('/create', async (req, res) => {
  try {
    const { fileId, expiresInHours } = req.body;
    
    if (!fileId) {
      return res.status(400).json({ error: 'fileId is required' });
    }
    
    const shortCode = generateShortCode();
    
    let expiresAt: Date | null = null;
    if (expiresInHours !== null && expiresInHours !== undefined) {
      const hours = parseInt(expiresInHours, 10);
      if (!isNaN(hours)) {
        expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + hours);
      }
    }

    // SAVE TO DATABASE
    const link = await prisma.link.create({ 
      data: { 
        shortCode, 
        fileId,
        expiresAt
      } 
    });
    
    res.json({ 
      success: true,
      shortCode: link.shortCode, 
      fileId: link.fileId, 
      expiresAt: link.expiresAt,
      url: `http://localhost:3002/resolve/${link.shortCode}`
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Resolve short link - READS FROM DATABASE
app.get('/resolve/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    
    // READ FROM DATABASE
    const link = await prisma.link.findUnique({ 
      where: { shortCode } 
    });
    
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    // Check expiry
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return res.status(410).json({ 
        error: 'Link expired', 
        fileId: link.fileId,
        expiredAt: link.expiresAt
      });
    }

    res.json({ 
      success: true,
      fileId: link.fileId, 
      expiresAt: link.expiresAt,
      createdAt: link.createdAt
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all links - SHOWS ALL DATABASE RECORDS
app.get('/links', async (req, res) => {
  try {
    const links = await prisma.link.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ 
      success: true, 
      count: links.length, 
      links 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a link - REMOVES FROM DATABASE
app.delete('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    
    const link = await prisma.link.findUnique({ 
      where: { shortCode } 
    });
    
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    await prisma.link.delete({ 
      where: { shortCode } 
    });
    
    res.json({ 
      success: true, 
      message: `Link ${shortCode} deleted successfully` 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Link service running on port ${PORT}`);
  console.log(`   Database: connected`);
  console.log(`   POST   /create        - Create short link`);
  console.log(`   GET    /resolve/:code - Resolve link`);
  console.log(`   GET    /links         - List all links`);
  console.log(`   DELETE /:shortCode    - Delete link`);
});