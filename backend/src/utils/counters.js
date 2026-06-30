const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function generateQuoteNumber(companyId) {
  const count = await prisma.quote.count({ where: { companyId } });
  const year = new Date().getFullYear();
  return `QT-${year}-${String(count + 1).padStart(4, '0')}`;
}

async function generateOrderNumber(companyId) {
  const count = await prisma.order.count({ where: { companyId } });
  const year = new Date().getFullYear();
  return `ORD-${year}-${String(count + 1).padStart(4, '0')}`;
}

async function generateInvoiceNumber(companyId) {
  const count = await prisma.invoice.count({ where: { companyId } });
  const year = new Date().getFullYear();
  return `INV-${year}-${String(count + 1).padStart(4, '0')}`;
}

module.exports = { generateQuoteNumber, generateOrderNumber, generateInvoiceNumber };
