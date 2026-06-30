const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addTimeline(customerId, type, title, opts = {}) {
  return prisma.timeline.create({
    data: { customerId, type, title, ...opts },
  });
}

module.exports = { addTimeline };
