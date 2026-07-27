const bcrypt = require('bcryptjs');
const { User } = require('../models/User');
const { Produce } = require('../models/Produce');
const { Service } = require('../models/Service');

exports.seedData = async () => {
  try {
    // Check if we already have users seeded
    const userCount = await User.count();
    if (userCount > 0) {
      console.log('🌱 Database already has data. Skipping seeding.');
      return;
    }

    console.log('🌱 Database is empty. Seeding realistic Kenyan data...');

    // 1. Seed Users (farmers, buyers, providers)
    // We will hash their password 'password123'
    const passwordHash = await bcrypt.hash('password123', 10);

    const users = await User.bulkCreate([
      {
        id: 1,
        full_name: 'David Kamau',
        email: 'kamau@agri.co.ke',
        phone_number: '0712345678',
        password: passwordHash,
        role: 'farmer',
        county: 'Uasin Gishu'
      },
      {
        id: 2,
        full_name: 'Grace Njeri',
        email: 'njeri@vendor.co.ke',
        phone_number: '0723456789',
        password: passwordHash,
        role: 'buyer',
        county: 'Nairobi'
      },
      {
        id: 3,
        full_name: 'Peter Otieno',
        email: 'otieno@fundi.co.ke',
        phone_number: '0734567890',
        password: passwordHash,
        role: 'provider',
        county: 'Meru'
      },
      {
        id: 4,
        full_name: 'Mary Wanjiku',
        email: 'mary@transporter.co.ke',
        phone_number: '0745678901',
        password: passwordHash,
        role: 'provider',
        county: 'Nakuru'
      },
      {
        id: 5,
        full_name: 'Admin Kiprotich',
        email: 'admin@agriconnect.co.ke',
        phone_number: '0756789012',
        password: passwordHash,
        role: 'admin',
        county: 'Uasin Gishu'
      }
    ]);

    console.log('✅ Users seeded successfully.');

    // 2. Seed Produce listings
    await Produce.bulkCreate([
      {
        userId: 1, // David Kamau (farmer)
        name: 'Cherry Tomatoes',
        quantity: 120,
        price: 90,
        county: 'Uasin Gishu',
        description: 'Super sweet, premium organic cherry tomatoes. Freshly hand-picked from our Kiambu Greenhouse.',
        image: '/images/designarena_image_ni9bxflg.png',
        available: true
      },
      {
        userId: 1, // David Kamau (farmer)
        name: 'White Maize',
        quantity: 500,
        price: 55,
        county: 'Nakuru',
        description: 'Dry grade-1 white maize grain. Packaged in brand-new 90kg bags. Perfect for milling.',
        image: '/images/designarena_image_17f603s0.png',
        available: true
      },
      {
        userId: 1, // David Kamau (farmer)
        name: 'Irish Potatoes',
        quantity: 300,
        price: 70,
        county: 'Meru',
        description: 'Local Shangi potato variety, excellent for chips and mashing. Harvested this week.',
        image: '/images/designarena_image_fgwrwznp.png',
        available: true
      },
      {
        userId: 1, // David Kamau (farmer)
        name: 'Red Onions',
        quantity: 200,
        price: 65,
        county: 'Kajiado',
        description: 'High-quality cured red onions. Well-dried, long shelf life. Maasai organic farm-gate price.',
        image: '/images/designarena_image_llkqsdn3.png',
        available: true
      },
      {
        userId: 1, // David Kamau (farmer)
        name: 'Dry Beans',
        quantity: 250,
        price: 120,
        county: 'Trans Nzoia',
        description: 'Rosecoco beans, sorting complete, free of debris. Perfect nutrition-rich harvest.',
        image: '/images/designarena_image_bg0xwpdn.png',
        available: true
      }
    ]);

    console.log('✅ Produce listings seeded successfully.');

    // 3. Seed Agricultural Services listings
    await Service.bulkCreate([
      {
        providerId: 3, // Peter Otieno (provider)
        category: 'machinery',
        name: 'Tractor Repair & Parts',
        county: 'Uasin Gishu',
        price: 3500,
        description: 'Professional Massey Ferguson & John Deere diagnostics, tractor repair, and hydraulic maintenance.',
        available: true
      },
      {
        providerId: 4, // Mary Wanjiku (provider)
        category: 'transport',
        name: 'Farm Produce Transport',
        county: 'Nakuru',
        price: 2000,
        description: 'Fuso and Canter lorries available for transporting maize, potatoes, and general harvest to market safely.',
        available: true
      },
      {
        providerId: 3, // Peter Otieno (provider)
        category: 'irrigation',
        name: 'Drip Irrigation Setup',
        county: 'Meru',
        price: 5000,
        description: 'Complete designing and piping for drip irrigation setups, greenhouse systems, and solar pump integration.',
        available: true
      },
      {
        providerId: 4, // Mary Wanjiku (provider)
        category: 'labor',
        name: 'Harvesting Manual Labor',
        county: 'Kajiado',
        price: 800,
        description: 'Experienced agricultural farm hands available for tomato pickings, potato harvest, and maize bagging.',
        available: true
      }
    ]);

    console.log('✅ Service listings seeded successfully.');
    console.log('✨ Seeding complete! AgriConnect KE is ready for use.');
  } catch (err) {
    console.error('❌ Error during seeding:', err.message);
  }
};
