const API_BASE = 'https://iqzeen.onrender.com/api';

async function main() {
  console.log('Seeding via API...');

  // 1. Create Restaurant
  const resData = {
    name: 'S&A Cafe (Desi Theme)',
    email: 'owner@sanda.com',
    password: 'Sanda123!',
    slug: 's-and-a-cafe',
    ownerName: 'Shankar & A',
    phone: '+91 8618240810',
    whatsappNumber: '+91 8618240810',
    upiId: '8618240810@ybl',
    bankDetails: 'S&A Cafe Bank'
  };

  const resResponse = await fetch(`${API_BASE}/restaurant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(resData)
  });
  
  const restaurant = await resResponse.json();
  console.log('Restaurant created:', restaurant.id);

  // 2. Login to get token
  const loginResponse = await fetch(`${API_BASE}/auth/restaurant/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: resData.email, password: resData.password })
  });
  const { access_token } = await loginResponse.json();

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${access_token}`
  };

  // 3. Create Tables
  for (let i = 1; i <= 4; i++) {
    await fetch(`${API_BASE}/table`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        tableNumber: `T${i}`,
        restaurantId: restaurant.id
      })
    });
  }
  console.log('Tables created');

  // 4. Create Categories
  const cats = [
    { name: 'Desi Street Bites', order: 1 },
    { name: 'Rich Curries', order: 2 },
    { name: 'Tandoori Breads', order: 3 },
    { name: 'Thick Lassis & Chai', order: 4 },
  ];

  const dbCats = [];
  for (const c of cats) {
    const catRes = await fetch(`${API_BASE}/menu/category`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ...c, restaurantId: restaurant.id })
    });
    const cat = await catRes.json();
    dbCats.push(cat);
  }
  console.log('Categories created');

  // 5. Create Menu Items
  const items = [
    {
      name: 'Bombay Vada Pav',
      description: 'Spicy potato fritter stuffed in a soft bun with garlic chutney.',
      price: 80,
      imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=600&auto=format&fit=crop',
      categoryId: dbCats[0].id
    },
    {
      name: 'Delhi Samosa Chaat',
      description: 'Crushed samosas topped with yogurt, mint, and tamarind chutney.',
      price: 120,
      imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=600&auto=format&fit=crop',
      categoryId: dbCats[0].id
    },
    {
      name: 'Butter Chicken Masala',
      description: 'Tender chicken simmered in a rich, creamy tomato gravy.',
      price: 350,
      imageUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?q=80&w=600&auto=format&fit=crop',
      categoryId: dbCats[1].id
    },
    {
      name: 'Paneer Tikka Masala',
      description: 'Charcoal grilled cottage cheese in a spicy, aromatic gravy.',
      price: 290,
      imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=600&auto=format&fit=crop',
      categoryId: dbCats[1].id
    },
    {
      name: 'Garlic Naan',
      description: 'Soft tandoori flatbread brushed with butter and minced garlic.',
      price: 60,
      imageUrl: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?q=80&w=600&auto=format&fit=crop',
      categoryId: dbCats[2].id
    },
    {
      name: 'Mango Lassi',
      description: 'Thick, creamy yogurt drink blended with fresh Alphonso mangoes.',
      price: 150,
      imageUrl: 'https://images.unsplash.com/photo-1546171753-97d7676e4602?q=80&w=600&auto=format&fit=crop',
      categoryId: dbCats[3].id
    },
    {
      name: 'Masala Chai',
      description: 'Strong Assam tea brewed with milk, cardamom, and ginger.',
      price: 50,
      imageUrl: 'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?q=80&w=600&auto=format&fit=crop',
      categoryId: dbCats[3].id
    }
  ];

  for (const item of items) {
    await fetch(`${API_BASE}/menu/item`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ...item, restaurantId: restaurant.id })
    });
  }
  console.log('Menu Items created');
  
  // Fetch tables to get QR Code IDs
  const tRes = await fetch(`${API_BASE}/table/restaurant/${restaurant.id}`, { headers });
  const fetchedTables = await tRes.json();

  console.log('\n--- LOGIN DETAILS ---');
  console.log('Login URL: https://iqzeen.vercel.app/dashboard/login');
  console.log('Email: owner@sanda.com');
  console.log('Password: Sanda123!');
  console.log('\n--- TABLE QR URLs ---');
  for (const t of fetchedTables) {
    console.log(`Table ${t.tableNumber}: https://iqzeen.vercel.app/menu/${t.qrCodeId}`);
  }
}

main().catch(console.error);
