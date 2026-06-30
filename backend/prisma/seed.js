const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const hashed = await bcrypt.hash('password123', 12);

  const company = await prisma.company.upsert({
    where: { email: 'demo@chatcrm.com' },
    update: {},
    create: {
      name: 'Demo Company',
      email: 'demo@chatcrm.com',
      phone: '+91 98200 00000',
      users: {
        create: {
          name: 'Demo Owner',
          email: 'owner@chatcrm.com',
          password: hashed,
          role: 'OWNER',
        },
      },
    },
    include: { users: true },
  });

  const user = company.users[0];

  const customer = await prisma.customer.upsert({
    where: { companyId_phone: { companyId: company.id, phone: '+91 98200 12345' } },
    update: {},
    create: {
      companyId: company.id,
      name: 'Rajesh Kumar',
      phone: '+91 98200 12345',
      email: 'rajesh@renterp.com',
      companyName: 'Rajesh Enterprises',
      gstin: '27AABCR1234F1Z5',
      city: 'Mumbai',
      state: 'Maharashtra',
      tags: ['Distributor'],
    },
  });

  await prisma.message.createMany({
    data: [
      { customerId: customer.id, direction: 'IN', content: 'Hi, I wanted to check on the quotation I requested for the steel pipes. Is it ready?' },
      { customerId: customer.id, userId: user.id, direction: 'OUT', content: 'Hello Rajesh bhai! Yes, we have prepared the quotation. Sending it across now.' },
    ],
    skipDuplicates: true,
  });

  await prisma.timeline.createMany({
    data: [
      { customerId: customer.id, type: 'CUSTOMER_CREATED', title: 'Rajesh Kumar was added as a customer' },
      { customerId: customer.id, type: 'MESSAGE_RECEIVED', title: 'Message received from customer' },
      { customerId: customer.id, type: 'MESSAGE_SENT', title: `Message sent by ${user.name}` },
    ],
    skipDuplicates: true,
  });

  console.log('Seed complete!');
  console.log('Login: owner@chatcrm.com / password123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
