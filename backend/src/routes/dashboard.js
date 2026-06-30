const router = require('express').Router();
const prisma = require('../utils/prisma');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const companyId = req.companyId;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalCustomers, activeConversations, pendingTasks, pendingQuotes,
      activeOrders, outstandingInvoices, monthRevenue, recentTimeline,
    ] = await Promise.all([
      prisma.customer.count({ where: { companyId, status: 'ACTIVE' } }),
      prisma.customer.count({ where: { companyId, messages: { some: {} } } }),
      prisma.task.count({ where: { customer: { companyId }, status: 'PENDING' } }),
      prisma.quote.count({ where: { customer: { companyId }, status: { in: ['DRAFT', 'SENT'] } } }),
      prisma.order.count({ where: { customer: { companyId }, status: { notIn: ['DELIVERED', 'CANCELLED'] } } }),
      prisma.invoice.aggregate({ where: { customer: { companyId }, status: { in: ['SENT', 'PARTIAL', 'OVERDUE'] } }, _sum: { total: true } }),
      prisma.invoice.aggregate({ where: { customer: { companyId }, status: 'PAID', updatedAt: { gte: startOfMonth } }, _sum: { total: true } }),
      prisma.timeline.findMany({ where: { customer: { companyId } }, orderBy: { createdAt: 'desc' }, take: 10, include: { customer: { select: { id: true, name: true } } } }),
    ]);

    res.json({
      totalCustomers,
      activeConversations,
      pendingTasks,
      pendingQuotes,
      activeOrders,
      outstandingPayments: outstandingInvoices._sum.total || 0,
      monthRevenue: monthRevenue._sum.total || 0,
      recentActivities: recentTimeline,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
