const router = require('express').Router({ mergeParams: true });
const prisma = require('../utils/prisma');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { customerId: req.params.customerId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { status, paidAmount } = req.body;
    const invoice = await prisma.invoice.update({
      where: { id: req.params.id },
      data: { status, paidAmount },
    });
    if (status === 'PAID') {
      await prisma.timeline.create({
        data: { customerId: req.params.customerId, type: 'INVOICE_PAID', title: `Invoice ${invoice.invoiceNumber} marked as paid — ₹${invoice.total}`, meta: { invoiceId: invoice.id } },
      });
    }
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
