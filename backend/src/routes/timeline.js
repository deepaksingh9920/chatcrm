const router = require('express').Router({ mergeParams: true });
const prisma = require('../utils/prisma');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const timeline = await prisma.timeline.findMany({
      where: { customerId: req.params.customerId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(timeline);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
