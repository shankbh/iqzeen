require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasourceUrl: 'postgresql://postgres.rhzdjyjpjxgfubbytjwi:IqzeenProjectPass123!@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true'
});

async function main() {
  console.log('Generating fake orders...');

  const restaurantId = 'cmpo6c93700002efpijz7o013';

  // Fetch tables and menu items for this restaurant
  const tables = await prisma.table.findMany({ where: { restaurantId } });
  const menuItems = await prisma.menuItem.findMany({ where: { restaurantId } });

  if (tables.length === 0 || menuItems.length === 0) {
    console.error('No tables or menu items found!');
    process.exit(1);
  }

  // Generate 25 orders over the last 14 days
  const names = ['Rahul', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Neha', 'Rohan', 'Karan', 'Aditi', 'Siddharth'];

  for (let i = 0; i < 25; i++) {
    // Random date within last 14 days
    const daysAgo = Math.floor(Math.random() * 14);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(12 + Math.floor(Math.random() * 10)); // Between 12 PM and 10 PM
    date.setMinutes(Math.floor(Math.random() * 60));

    // Random table
    const table = tables[Math.floor(Math.random() * tables.length)];

    // Random items (1 to 4 distinct items)
    const orderItemsCount = 1 + Math.floor(Math.random() * 4);
    const orderItems = [];
    let totalAmount = 0;

    const shuffledMenu = [...menuItems].sort(() => 0.5 - Math.random());
    for (let j = 0; j < orderItemsCount; j++) {
      const item = shuffledMenu[j];
      const quantity = 1 + Math.floor(Math.random() * 3);
      orderItems.push({
        menuItemId: item.id,
        quantity,
        priceAtOrder: Number(item.price)
      });
      totalAmount += Number(item.price) * quantity;
    }

    await prisma.order.create({
      data: {
        tableId: table.id,
        restaurantId: restaurantId,
        customerName: names[Math.floor(Math.random() * names.length)],
        status: 'SERVED',
        totalAmount,
        createdAt: date,
        items: {
          create: orderItems
        }
      }
    });
  }

  console.log('Fake orders created successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
