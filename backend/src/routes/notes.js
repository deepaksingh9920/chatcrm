const router = require('express').Router({ mergeParams: true });
const prisma = require('../utils/prisma');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const notes = await prisma.note.findMany({
      where: { customerId: req.params.customerId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true } } },
    });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Content required' });
    const note = await prisma.note.create({
      data: { customerId: req.params.customerId, userId: req.user.id, content },
      include: { user: { select: { id: true, name: true } } },
    });
    await prisma.timeline.create({
      data: { customerId: req.params.customerId, type: 'NOTE_ADDED', title: `Note added by ${req.user.name}` },
    });
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.note.delete({ where: { id: req.params.id } });
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
