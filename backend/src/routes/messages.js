const router = require('express').Router({ mergeParams: true });
const prisma = require('../utils/prisma');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const customer = await prisma.customer.findFirst({ where: { id: req.params.customerId, companyId: req.companyId } });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    const messages = await prisma.message.findMany({
      where: { customerId: req.params.customerId },
      orderBy: { createdAt: 'asc' },
      skip: (page - 1) * limit, take: +limit,
      include: { user: { select: { id: true, name: true } } },
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { content, direction = 'OUT' } = req.body;
    if (!content) return res.status(400).json({ message: 'Content required' });
    const customer = await prisma.customer.findFirst({ where: { id: req.params.customerId, companyId: req.companyId } });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    const message = await prisma.message.create({
      data: { customerId: req.params.customerId, userId: direction === 'OUT' ? req.user.id : null, content, direction },
      include: { user: { select: { id: true, name: true } } },
    });
    await prisma.timeline.create({
      data: {
        customerId: req.params.customerId,
        type: direction === 'OUT' ? 'MESSAGE_SENT' : 'MESSAGE_RECEIVED',
        title: direction === 'OUT' ? `Message sent by ${req.user.name}` : 'Message received from customer',
      },
    });
    await prisma.customer.update({ where: { id: req.params.customerId }, data: { updatedAt: new Date() } });
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
