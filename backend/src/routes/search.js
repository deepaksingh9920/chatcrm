const router = require('express').Router();
const prisma = require('../utils/prisma');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ customers: [], quotes: [], orders: [], invoices: [] });
    const companyId = req.companyId;

    const [customers, quotes, orders, invoices] = await Promise.all([
      prisma.customer.findMany({
        where: { companyId, status: { not: 'ARCHIVED' }, OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q } },
          { email: { contains: q, mode: 'insensitive' } },
          { companyName: { contains: q, mode: 'insensitive' } },
          { gstin: { contains: q, mode: 'insensitive' } },
        ]},
        take: 5, select: { id: true, name: true, phone: true, companyName: true },
      }),
      prisma.quote.findMany({
        where: { customer: { companyId }, quoteNumber: { contains: q, mode: 'insensitive' } },
        take: 3, select: { id: true, quoteNumber: true, total: true, status: true, customerId: true, customer: { select: { name: true } } },
      }),
      prisma.order.findMany({
        where: { customer: { companyId }, orderNumber: { contains: q, mode: 'insensitive' } },
        take: 3, select: { id: true, orderNumber: true, total: true, status: true, customerId: true, customer: { select: { name: true } } },
      }),
      prisma.invoice.findMany({
        where: { customer: { companyId }, invoiceNumber: { contains: q, mode: 'insensitive' } },
        take: 3, select: { id: true, invoiceNumber: true, total: true, status: true, customerId: true, customer: { select: { name: true } } },
      }),
    ]);

    res.json({ customers, quotes, orders, invoices });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
