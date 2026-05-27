require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

process.env.DATABASE_URL = 'postgresql://postgres.rhzdjyjpjxgfubbytjwi:IqzeenProjectPass123!@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres?pgbouncer=true';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding S&A Cafe...');

  // 1. Create Restaurant
  const slug = 's-and-a-cafe';
  let restaurant = await prisma.restaurant.findUnique({ where: { slug } });

  if (!restaurant) {
    restaurant = await prisma.restaurant.create({
      data: {
        name: 'S&A Cafe (Desi Theme)',
        email: 'owner@sanda.com',
        slug,
        ownerName: 'Shankar & A',
        phone: '+91 8618240810',
        whatsappNumber: '+91 8618240810',
        upiId: '8618240810@ybl',
        bankAccountDetails: 'S&A Cafe Bank',
        isActive: true
      }
    });
  }

  // 2. Create Owner User
  let owner = await prisma.user.findUnique({ where: { email: 'owner@sanda.com' } });
  if (!owner) {
    const hashedPassword = await bcrypt.hash('Sanda123!', 10);
    owner = await prisma.user.create({
      data: {
        email: 'owner@sanda.com',
        password: hashedPassword,
        name: 'S&A Owner',
        role: 'OWNER',
        restaurantId: restaurant.id
      }
    });
  }

  // 3. Create Tables
  const tables = [];
  for (let i = 1; i <= 4; i++) {
    const tableNo = `T${i}`;
    let table = await prisma.table.findFirst({
      where: { restaurantId: restaurant.id, tableNumber: tableNo }
    });
    if (!table) {
      table = await prisma.table.create({
        data: {
          tableNumber: tableNo,
          qrCodeId: `sanda-table-${i}`,
          restaurantId: restaurant.id
        }
      });
    }
    tables.push(table);
  }

  // 4. Create Categories
  const cats = [
    { name: 'Desi Street Bites', order: 1 },
    { name: 'Rich Curries', order: 2 },
    { name: 'Tandoori Breads', order: 3 },
    { name: 'Thick Lassis & Chai', order: 4 },
  ];

  const dbCats = [];
  for (const c of cats) {
    let cat = await prisma.category.findFirst({
      where: { restaurantId: restaurant.id, name: c.name }
    });
    if (!cat) {
      cat = await prisma.category.create({
        data: {
          name: c.name,
          order: c.order,
          restaurantId: restaurant.id
        }
      });
    }
    dbCats.push(cat);
  }

  // 5. Create Menu Items
  const items = [
    {
      name: 'Bombay Vada Pav',
      description: 'Spicy potato fritter stuffed in a soft bun with garlic chutney.',
      price: 80,
      image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=600&auto=format&fit=crop',
      catId: dbCats[0].id
    },
    {
      name: 'Delhi Samosa Chaat',
      description: 'Crushed samosas topped with yogurt, mint, and tamarind chutney.',
      price: 120,
      image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=600&auto=format&fit=crop',
      catId: dbCats[0].id
    },
    {
      name: 'Butter Chicken Masala',
      description: 'Tender chicken simmered in a rich, creamy tomato gravy.',
      price: 350,
      image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?q=80&w=600&auto=format&fit=crop',
      catId: dbCats[1].id
    },
    {
      name: 'Paneer Tikka Masala',
      description: 'Charcoal grilled cottage cheese in a spicy, aromatic gravy.',
      price: 290,
      image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=600&auto=format&fit=crop',
      catId: dbCats[1].id
    },
    {
      name: 'Garlic Naan',
      description: 'Soft tandoori flatbread brushed with butter and minced garlic.',
      price: 60,
      image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?q=80&w=600&auto=format&fit=crop',
      catId: dbCats[2].id
    },
    {
      name: 'Mango Lassi',
      description: 'Thick, creamy yogurt drink blended with fresh Alphonso mangoes.',
      price: 150,
      image: 'https://images.unsplash.com/photo-1546171753-97d7676e4602?q=80&w=600&auto=format&fit=crop',
      catId: dbCats[3].id
    },
    {
      name: 'Masala Chai',
      description: 'Strong Assam tea brewed with milk, cardamom, and ginger.',
      price: 50,
      image: 'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?q=80&w=600&auto=format&fit=crop',
      catId: dbCats[3].id
    }
  ];

  for (const item of items) {
    let dbItem = await prisma.menuItem.findFirst({
      where: { categoryId: item.catId, name: item.name }
    });
    if (!dbItem) {
      await prisma.menuItem.create({
        data: {
          name: item.name,
          description: item.description,
          price: item.price,
          imageUrl: item.image,
          isAvailable: true,
          categoryId: item.catId,
          restaurantId: restaurant.id
        }
      });
    }
  }

  console.log('Seeding Complete!');
  console.log('--- LOGIN DETAILS ---');
  console.log('Login URL: https://iqzeen.vercel.app/dashboard/login');
  console.log('Email: owner@sanda.com');
  console.log('Password: Sanda123!');
  console.log('');
  console.log('--- TABLE QR URLs ---');
  for (const t of tables) {
    console.log(`Table ${t.tableNumber}: https://iqzeen.vercel.app/menu/${t.qrCodeId}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
