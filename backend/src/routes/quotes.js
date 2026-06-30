const router = require('express').Router({ mergeParams: true });
const prisma = require('../utils/prisma');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

const generateNumber = (prefix, count) => `${prefix}-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

router.get('/', async (req, res) => {
  try {
    const customer = await prisma.customer.findFirst({ where: { id: req.params.customerId, companyId: req.companyId } });
    if (!customer) return res.status(404).json({ message: 'Not found' });
    const quotes = await prisma.quote.findMany({
      where: { customerId: req.params.customerId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { items, subtotal, taxAmount, total, notes, validTill, status = 'DRAFT' } = req.body;
    const count = await prisma.quote.count({ where: { customer: { companyId: req.companyId } } });
    const quoteNumber = generateNumber('QT', count);
    const quote = await prisma.quote.create({
      data: { customerId: req.params.customerId, quoteNumber, items, subtotal, taxAmount, total, notes, validTill: validTill ? new Date(validTill) : null, status },
    });
    await prisma.timeline.create({
      data: { customerId: req.params.customerId, type: 'QUOTE_CREATED', title: `Quote ${quoteNumber} created — ₹${total}`, meta: { quoteId: quote.id } },
    });
    res.status(201).json(quote);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { status, items, subtotal, taxAmount, total, notes, validTill } = req.body;
    const quote = await prisma.quote.update({
      where: { id: req.params.id },
      data: { status, items, subtotal, taxAmount, total, notes, validTill: validTill ? new Date(validTill) : undefined },
    });
    if (status === 'SENT') {
      await prisma.timeline.create({
        data: { customerId: req.params.customerId, type: 'QUOTE_SENT', title: `Quote ${quote.quoteNumber} sent to customer`, meta: { quoteId: quote.id } },
      });
    }
    res.json(quote);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Convert quote to order
router.post('/:id/convert', async (req, res) => {
  try {
    const quote = await prisma.quote.findUnique({ where: { id: req.params.id } });
    if (!quote) return res.status(404).json({ message: 'Quote not found' });
    const count = await prisma.order.count({ where: { customer: { companyId: req.companyId } } });
    const orderNumber = generateNumber('ORD', count);
    const order = await prisma.order.create({
      data: { customerId: quote.customerId, quoteId: quote.id, orderNumber, items: quote.items, subtotal: quote.subtotal, taxAmount: quote.taxAmount, total: quote.total, status: 'PENDING' },
    });
    await prisma.quote.update({ where: { id: quote.id }, data: { status: 'ACCEPTED' } });
    await prisma.timeline.create({
      data: { customerId: req.params.customerId, type: 'ORDER_CREATED', title: `Order ${orderNumber} created from quote ${quote.quoteNumber}`, meta: { orderId: order.id } },
    });
    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
