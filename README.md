# 🌾 AgriConnect KE

**Farm direct. No brokers.**

AgriConnect KE is a full-stack web platform connecting **Kenyan farmers** directly with **buyers/vendors** and **farm service providers**. Farmers list produce and set their own prices, buyers browse a live marketplace and place orders, and farmers can find tractor repair, transport, irrigation and labour services — all in one place.

> Author: Ryan — Eldohub AI & Tech Academy · License: [MIT](LICENSE)

---

## ✨ Features

- 🧑‍🌾 **Role-based accounts** — Farmer, Buyer, Service Provider (and Admin).
- 🥬 **Marketplace** — search, county filters, category filters, and paginated produce listings.
- 📦 **Produce management** — farmers create, edit, deactivate and delete their listings with image uploads.
- 🛒 **Orders** — place orders on listings, view order history, update order status.
- 💬 **Messaging** — one-to-one conversations between users with unread badges.
- 🔔 **Notifications** — in-app notifications for the logged-in user.
- 📊 **Market Prices** — farm-gate price data (seeded locally + optional [Shamba Records](https://www.shambarecords.com) API integration).
- 🚜 **Services** — service providers list offerings; farmers browse and send service requests.
- ⭐ **Reviews** — public farmer profiles with ratings and reviews.
- 📈 **Dashboard** — KPI cards, Chart.js analytics (sales overview, order status, produce by category), with side-panel widgets for transactions, messages and recommended services.
- 🔐 **Security** — bcrypt password hashing, JWT session in httpOnly cookies, signed double-submit **CSRF** protection, rate-limited auth endpoints, Helmet + CORS.
- 🤖 **Farm AI Assistant** — a lightweight in-page chatbot for quick help.

---

## 🧰 Tech Stack

| Layer      | Technology |
|------------|------------|
| Runtime    | Node.js (Express) |
| Language   | JavaScript (CommonJS) |
| Templating | EJS (server-rendered) |
| Database   | MySQL 8 · Sequelize ORM |
| Auth       | jsonwebtoken (httpOnly cookie) · bcryptjs |
| Security   | helmet · custom signed double-submit CSRF · express-rate-limit · cors · cookie-parser |
| Charts     | Chart.js (CDN) |
| Icons      | Lucide (CDN) |
| Config     | dotenv |

---

## 📁 Project Structure

```
.
├── server.js                  # Express app entry point (middleware + route mounting)
├── config/
│   └── database.js            # Sequelize connection + testConnection()
├── models/                    # Sequelize models (User, ProduceListing, Order, ...)
│   └── associations.js        # Registers all model associations (loaded at boot)
├── controllers/               # Route handlers (auth, dashboard, orders, messages, ...)
├── routes/                    # Route definitions
├── middlewares/               # auth, pageAuth, csrf, errorHandler, upload, ...
├── services/                  # External integrations (e.g. Shamba Records)
├── utils/                     # Shared helpers (ApiError, ...)
├── views/                     # EJS templates
│   └── partials/              # header, navbar, sidebar (+ sidebarPanels), footer, chatbot
├── public/                    # Static assets (CSS, images)
├── database/                  # SQL migrations (002_… 008_…)
├── scripts/                   # migrate.js, seed.js, apply_008.js, run_migration.js
├── database.sql               # Base schema
├── schema.sql
└── .env.example               # Environment variable template
```

---

## ✅ Prerequisites

- **Node.js** 18.11+ (the `dev` script uses `node --watch`). Node 20/22 LTS recommended.
- **MySQL** 8.0+
- **npm**

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Then edit `.env` and set your **MySQL credentials** and a **strong `JWT_SECRET`**:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 3. Create the database and apply migrations

```bash
# (one time) create the database if it doesn't exist
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS Smart_Kilimo;"

# MySQL pattern from package.json (migrations 002–005)
npm run db:migrate
```

Or use the tracked migration runner for all of them:

```bash
node scripts/migrate.js
```

> ⚠️ **Important:** the current `User` model requires a `users.is_active` column (added by migration `007`). If you imported the DB from `database.sql` that column is missing and registration fails with **500**. Apply `database/008_add_user_active.sql` (idempotent, safe to re-run):
>
> ```bash
> node scripts/apply_008.js
> ```
>
> See [Database & migrations notes](#-database--migrations-notes).

### 4. Seed demo data (optional but recommended)

```bash
npm run db:seed
```

### 5. Run the app

```bash
# Development (auto-restarts on file changes)
npm run dev

# Or production
npm start
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 👤 Demo Accounts

After seeding, log in with any of these (password for all is `Password123!`):

| Name            | Email                    | Role             | County      |
|-----------------|--------------------------|------------------|-------------|
| John Mwangi     | john.mwangi@example.com  | Farmer           | Kiambu      |
| Grace Njeri     | grace.njeri@example.com  | Buyer            | Nairobi     |
| Peter Otieno    | peter.otieno@example.com | Farmer           | Meru        |
| Mary Wanjiku    | mary.wanjiku@example.com | Service Provider | Uasin Gishu |

---

## 🔐 Environment Variables

| Variable              | Default                 | Description                                             |
|-----------------------|-------------------------|---------------------------------------------------------|
| `PORT`                | `3000`                  | HTTP server port                                        |
| `NODE_ENV`            | `development`           | `production` enables HTTPS cookies + sanitized errors   |
| `DB_HOST`             | `localhost`             | MySQL host                                              |
| `DB_USER`             | `root`                  | MySQL user                                              |
| `DB_PASSWORD`         | —                       | MySQL password                                          |
| `DB_NAME`             | `Smart_Kilimo`          | MySQL database name                                     |
| `DB_DIALECT`          | `mysql`                 | Sequelize dialect                                       |
| `JWT_SECRET`          | —                       | Secret signing JWTs **and** CSRF tokens (keep secret, make long) |
| `CORS_ORIGIN`         | `*`                     | Allowed CORS origin(s)                                  |
| `SHAMBA_PUBLIC_KEY`   | —                       | Shamba Records Market Prices API key (optional)         |
| `SHAMBA_SECRET_KEY`   | —                       | Shamba Records Market Prices API secret (optional)      |
| `SHAMBA_API_BASE_URL` | `https://api-data.shambarecords.com/api/v1` | Shamba API base URL                     |

Optional integrations (currently placeholders in `.env.example`): **M-Pesa Daraja**, **Africa's Talking SMS**, **Cloudinary**.

---

## 📜 NPM Scripts

| Script            | Command                                   | Description                              |
|-------------------|-------------------------------------------|------------------------------------------|
| `npm start`       | `node -r dotenv/config server.js`         | Start the server                         |
| `npm run dev`     | `node -r dotenv/config --watch server.js` | Start with auto-reload on file changes   |
| `npm run db:migrate` | `mysql ... < 002…005.sql`              | Apply SQL migrations 002 → 005           |
| `npm run db:seed` | `node scripts/seed.js`                    | Seed demo users/listings/services        |

---

## 🔐 Authentication Flow

- `POST /api/auth/register` — validates input, rejects duplicates, hashes the password with bcrypt, creates the user, signs a JWT and sets it as an **httpOnly** cookie (`agri_token`).
- `POST /api/auth/login` — finds the user by **email or phone number**, verifies the password, then sets the same JWT cookie.
- `POST /api/auth/logout` — clears the cookie.
- `GET /api/auth/me` — (auth required) returns the current user.
- **Server-rendered page guards:** `requireAuthPage` redirects unauthenticated visitors to `/login`; `redirectIfAuthed` sends already-logged-in users to `/dashboard`.
- **CSRF:** every response carries a signed double-submit token in the `_csrf` cookie plus a `csrf-token` meta tag. State-changing requests must echo it via a hidden field or the `X-CSRF-Token` header. If a page token goes stale (e.g. the 1-hour cookie expires mid-session), the login/register forms **self-heal** by fetching a fresh token from `GET /api/auth/csrf` and retrying — so users are never stuck on the "session expired" banner.

---

## 🧭 Routes & Pages

| Path                        | Purpose                                      |
|-----------------------------|----------------------------------------------|
| `/`                         | Public landing page                          |
| `/login`, `/register`       | Authentication pages                         |
| `/dashboard`                | Role-aware dashboard with analytics          |
| `/marketplace`              | Browse produce listings                      |
| `/produce`                  | Farmer produce CRUD (`/new`, `/:id`, `/:id/edit`) |
| `/services`                 | Browse service listings (`/:id`, `/:id/request`) |
| `/orders`                   | Orders list / create / detail / status update |
| `/messages`                 | One-to-one messaging                         |
| `/market-prices`            | Farm-gate market prices                      |
| `/profile`                  | Profile + password management                |
| `/notifications`            | User notifications                           |
| `/farmers/:id`, `/reviews`  | Public farmer profiles and reviews           |
| `/admin`                    | Admin panel                                  |
| API                         | `/api/auth/register · /login · /logout`, `/api/auth/me`, `/api/auth/csrf`, `/api/listings`, `/api/messages`, `/api/dashboard/stats`, … |

---

## 🗃️ Database & Migrations Notes

- The base schema lives in **`database.sql`** (creates `users`, orders, produce listings, services, etc.).
- Iterative **SQL migrations** live in **`database/`** (`002_marketplace_engine` … `008_add_user_active`).
- `scripts/migrate.js` is a tracked runner that records applied migrations in a `schema_migrations` table. The `npm run db:migrate` script applies migrations 002–005 via the MySQL CLI.
- **Known gotcha:** a database imported from `database.sql` may be missing `users.is_active` (required by `models/User.js`), which makes `POST /api/auth/register` fail with **500**. Run `node scripts/apply_008.js` to add it safely (idempotent).
- `scripts/seed.js` is idempotent and reprovisions real bcrypt hashes for the demo users so they can actually be logged into.

---

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feat/your-feature`).
3. Commit your changes.
4. Open a pull request.

---

## 📄 License

This project is licensed under the **MIT License** — see the [`LICENSE`](LICENSE) file for details.

---

*Built for Kenyan farmers. No middlemen, no hidden cuts — just direct trade.*