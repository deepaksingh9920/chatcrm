const router = require('express').Router({ mergeParams: true });
const prisma = require('../utils/prisma');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { customerId: req.params.customerId },
      orderBy: { createdAt: 'desc' },
      include: { quote: { select: { quoteNumber: true } } },
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await prisma.order.update({ where: { id: req.params.id }, data: { status } });
    await prisma.timeline.create({
      data: { customerId: req.params.customerId, type: 'ORDER_STATUS_CHANGED', title: `Order ${order.orderNumber} status changed to ${status}`, meta: { orderId: order.id, status } },
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate invoice from order
router.post('/:id/invoice', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const count = await prisma.invoice.count({ where: { customer: { companyId: req.companyId } } });
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    const invoice = await prisma.invoice.create({
      data: { customerId: order.customerId, orderId: order.id, invoiceNumber, items: order.items, subtotal: order.subtotal, taxAmount: order.taxAmount, total: order.total, status: 'DRAFT' },
    });
    await prisma.timeline.create({
      data: { customerId: req.params.customerId, type: 'INVOICE_CREATED', title: `Invoice ${invoiceNumber} generated`, meta: { invoiceId: invoice.id } },
    });
    res.status(201).json(invoice);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
