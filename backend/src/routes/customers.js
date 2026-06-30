const router = require('express').Router();
const prisma = require('../utils/prisma');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// List customers
router.get('/', async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const where = { companyId: req.companyId };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { gstin: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where, skip: (page - 1) * limit, take: +limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          _count: { select: { messages: true, tasks: { where: { status: 'PENDING' } } } },
          messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      }),
      prisma.customer.count({ where }),
    ]);
    res.json({ customers, total, page: +page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single customer
router.get('/:id', async (req, res) => {
  try {
    const customer = await prisma.customer.findFirst({
      where: { id: req.params.id, companyId: req.companyId },
      include: { _count: { select: { quotes: true, orders: true, invoices: true, tasks: true } } },
    });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create customer
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, companyName, gstin, address, city, state, pincode, tags } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    const customer = await prisma.customer.create({
      data: { companyId: req.companyId, name, email, phone, companyName, gstin, address, city, state, pincode, tags: tags || [] },
    });
    await prisma.timeline.create({
      data: { customerId: customer.id, type: 'CUSTOMER_CREATED', title: `${name} was added as a customer` },
    });
    res.status(201).json(customer);
  } catch (err) {
    console.error(err);
    if (err.code === 'P2002') return res.status(400).json({ message: 'Phone number already exists' });
    res.status(500).json({ message: 'Server error' });
  }
});

// Update customer
router.put('/:id', async (req, res) => {
  try {
    const customer = await prisma.customer.findFirst({ where: { id: req.params.id, companyId: req.companyId } });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    const updated = await prisma.customer.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete/archive customer
router.delete('/:id', async (req, res) => {
  try {
    await prisma.customer.update({
      where: { id: req.params.id },
      data: { status: 'ARCHIVED' },
    });
    res.json({ message: 'Customer archived' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
