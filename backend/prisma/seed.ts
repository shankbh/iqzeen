import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const restaurant = await prisma.restaurant.upsert({
    where: { slug: 'grander-cafe' },
    update: {
      upiId: '8618240810@ybl',
      whatsappNumber: '918618240810',
    },
    create: {
      name: 'The Grander Cafe',
      email: 'contact@grandercafe.com',
      phone: '+91 9876543210',
      address: '123 MG Road, Indiranagar, Bangalore',
      slug: 'grander-cafe',
      upiId: '8618240810@ybl',
      whatsappNumber: '918618240810',
    },
  });

  const categories = [
    { name: 'Appetizers', order: 1 },
    { name: 'Main Course', order: 2 },
    { name: 'Beverages', order: 3 },
  ];

  for (const cat of categories) {
    await prisma.category.create({
      data: {
        ...cat,
        restaurantId: restaurant.id,
      },
    });
  }

  const restaurantCategories = await prisma.category.findMany({
    where: { restaurantId: restaurant.id },
  });

  const menuItems = [
    {
      name: 'Spring Rolls',
      description: 'Crispy vegetable rolls with sweet chili sauce',
      price: 250,
      categoryId: restaurantCategories[0].id,
      restaurantId: restaurant.id,
      order: 1,
    },
    {
      name: 'Garlic Bread',
      description: 'Toasted baguette with garlic butter and herbs',
      price: 180,
      categoryId: restaurantCategories[0].id,
      restaurantId: restaurant.id,
      order: 2,
    },
    {
      name: 'Butter Chicken',
      description: 'Classic creamy tomato curry with tender chicken',
      price: 450,
      categoryId: restaurantCategories[1].id,
      restaurantId: restaurant.id,
      order: 1,
    },
    {
      name: 'Paneer Tikka Masala',
      description: 'Grilled paneer in a spicy masala gravy',
      price: 380,
      categoryId: restaurantCategories[1].id,
      restaurantId: restaurant.id,
      order: 2,
    },
    {
      name: 'Mango Lassi',
      description: 'Traditional Indian yogurt drink with mango',
      price: 120,
      categoryId: restaurantCategories[2].id,
      restaurantId: restaurant.id,
      order: 1,
    },
    {
      name: 'Iced Tea',
      description: 'Refreshing lemon iced tea',
      price: 90,
      categoryId: restaurantCategories[2].id,
      restaurantId: restaurant.id,
      order: 2,
    },
  ];

  for (const item of menuItems) {
    await prisma.menuItem.create({ data: item });
  }

  await prisma.table.createMany({
    data: [
      { tableNumber: '1', qrCodeId: 'qr-table-1', restaurantId: restaurant.id },
      { tableNumber: '2', qrCodeId: 'qr-table-2', restaurantId: restaurant.id },
      { tableNumber: '3', qrCodeId: 'qr-table-3', restaurantId: restaurant.id },
      { tableNumber: '4', qrCodeId: 'qr-table-4', restaurantId: restaurant.id },
      { tableNumber: '5', qrCodeId: 'qr-table-5', restaurantId: restaurant.id },
    ],
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
