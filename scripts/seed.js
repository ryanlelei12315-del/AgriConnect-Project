/* eslint-env node */
/**
 * AgriConnect KE — Database Seed Script
 * Idempotent: safe to run multiple times. Creates demo users with REAL
 * bcrypt-hashed passwords (the database.sql placeholders cannot be logged into).
 *
 * Run: npm run db:seed
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');
const { User } = require('../models/User');
const { ProduceListing } = require('../models/ProduceListing');
const { ServiceListing } = require('../models/ServiceListing');

const SALT_ROUNDS = 10;

// Demo password for all seeded accounts
const DEMO_PASSWORD = 'Password123!';

const DEMO_USERS = [
  {
    fullName: 'John Mwangi',
    email: 'john.mwangi@example.com',
    phoneNumber: '0712345678',
    county: 'Kiambu',
    role: 'farmer',
  },
  {
    fullName: 'Grace Njeri',
    email: 'grace.njeri@example.com',
    phoneNumber: '0723456789',
    county: 'Nairobi',
    role: 'buyer',
  },
  {
    fullName: 'Peter Otieno',
    email: 'peter.otieno@example.com',
    phoneNumber: '0734567890',
    county: 'Meru',
    role: 'farmer',
  },
  {
    fullName: 'Mary Wanjiku',
    email: 'mary.wanjiku@example.com',
    phoneNumber: '0745678901',
    county: 'Uasin Gishu',
    role: 'provider',
  },
];

const DEMO_LISTINGS = [
  {
    farmerIndex: 0,
    name: 'Cherry Tomatoes',
    category: 'Vegetables',
    quantityKg: 120,
    pricePerKgKes: 90,
    county: 'Uasin Gishu',
    description: 'Fresh greenhouse cherry tomatoes, harvested this morning.',
  },
  {
    farmerIndex: 0,
    name: 'White Maize',
    category: 'Cereals',
    quantityKg: 500,
    pricePerKgKes: 55,
    county: 'Nakuru',
    description: 'Grade A white maize, dry and ready for milling.',
  },
  {
    farmerIndex: 2,
    name: 'Irish Potatoes',
    category: 'Root Crops',
    quantityKg: 300,
    pricePerKgKes: 70,
    county: 'Meru',
    description: 'Shangi variety, clean and sorted.',
  },
  {
    farmerIndex: 2,
    name: 'Red Onions',
    category: 'Vegetables',
    quantityKg: 200,
    pricePerKgKes: 65,
    county: 'Kajiado',
    description: 'Red creole onions, medium size.',
  },
];

const DEMO_SERVICES = [
  {
    providerIndex: 3,
    category: 'Machinery',
    title: 'Tractor Repair',
    priceKes: 3500,
    county: 'Uasin Gishu',
    description: 'On-farm tractor and implement repair.',
  },
  {
    providerIndex: 3,
    category: 'Transport',
    title: 'Farm Transport',
    priceKes: 2000,
    county: 'Nakuru',
    description: 'Pickup and lorry transport for produce.',
  },
  {
    providerIndex: 3,
    category: 'Infrastructure',
    title: 'Irrigation Setup',
    priceKes: 5000,
    county: 'Meru',
    description: 'Drip and sprinkler irrigation installation.',
  },
  {
    providerIndex: 3,
    category: 'Labour',
    title: 'Harvest Labor',
    priceKes: 800,
    county: 'Kajiado',
    description: 'Daily harvest labor crew.',
  },
];

async function seed() {
  try {
    console.log('🌱 Seeding AgriConnect KE database…');

    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, SALT_ROUNDS);

    // ── Users (reuse if exists, but REPAIR password/county so they
    //    can actually be logged into — database.sql placed placeholder
    //    hashes that never match any real password) ────────────────
    const users = [];
    for (const u of DEMO_USERS) {
      const existing = await User.findOne({
        where: { email: u.email },
      });
      if (existing) {
        // Repair: real bcrypt hash + correct county (idempotent, safe every run)
        existing.password = hashedPassword;
        existing.county = u.county;
        await existing.save();
        console.log(`  ↳ User ${u.email} exists — password hash + county repaired.`);
        users[DEMO_USERS.indexOf(u)] = existing;
      } else {
        const created = await User.create({
          fullName: u.fullName,
          email: u.email,
          phoneNumber: u.phoneNumber,
          county: u.county,
          password: hashedPassword,
          role: u.role,
        });
        console.log(`  ✔ Created ${u.role}: ${u.fullName} (${u.email}) / pw: ********`);
        users[DEMO_USERS.indexOf(u)] = created;
      }
    }

    // ── Listings (idempotent: skip if a listing with same name+farmer exists) ──
    for (const l of DEMO_LISTINGS) {
      const farmerId = users[l.farmerIndex].id;
      const exists = await ProduceListing.findOne({
        where: { farmerId, name: l.name },
        attributes: ['id'],
      });
      if (exists) {
        console.log(`  ↳ Listing "${l.name}" exists, skipping.`);
        continue;
      }
      await ProduceListing.create({
        farmerId,
        name: l.name,
        category: l.category,
        quantityKg: l.quantityKg,
        pricePerKgKes: l.pricePerKgKes,
        county: l.county,
        description: l.description,
        status: 'LISTED',
      });
      console.log(`  ✔ Listed: ${l.name} (${l.county})`);
    }

    // ── Services (idempotent) ──────────────────────────────────────
    for (const s of DEMO_SERVICES) {
      const providerId = users[s.providerIndex].id;
      const exists = await ServiceListing.findOne({
        where: { providerId, title: s.title },
        attributes: ['id'],
      });
      if (exists) {
        console.log(`  ↳ Service "${s.title}" exists, skipping.`);
        continue;
      }
      await ServiceListing.create({
        providerId,
        category: s.category,
        title: s.title,
        priceKes: s.priceKes,
        county: s.county,
        description: s.description,
        availability: 'AVAILABLE',
      });
      console.log(`  ✔ Service: ${s.title}`);
    }

    console.log('\n✅ Seed complete.');
    console.log('   Login with any seeded email + ********');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

seed();
