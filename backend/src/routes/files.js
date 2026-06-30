const express = require('express');
const multer = require('multer');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const { addTimeline } = require('../utils/timeline');
const { v4: uuid } = require('uuid');

const router = express.Router();
const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads');
    require('fs').mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `${uuid()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/:customerId/files', auth, async (req, res) => {
  try {
    const files = await prisma.file.findMany({
      where: { customerId: req.params.customerId, companyId: req.user.companyId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(files);
  } catch {
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

router.post('/:customerId/files', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'File required' });

    const file = await prisma.file.create({
      data: {
        companyId: req.user.companyId,
        customerId: req.params.customerId,
        name: req.file.originalname,
        url: `/uploads/${req.file.filename}`,
        type: req.file.mimetype,
        size: req.file.size,
      },
    });

    await addTimeline(req.params.customerId, 'FILE_UPLOADED', `File uploaded: ${req.file.originalname}`, { fileId: file.id });
    res.status(201).json(file);
  } catch {
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

module.exports = router;
