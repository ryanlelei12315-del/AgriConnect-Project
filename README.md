# 🌾 AgriConnect KE — Production SaaS Platform

**Farm direct. No brokers.** 🇰🇪

AgriConnect KE is a full-stack, production-grade SaaS platform connecting **Kenyan farmers** directly with **buyers/vend

ors** and **farm service providers**. Farmers list produce and set their own prices, buyers browse a live marketplace and place orders, and farmers can find tractor repair, transport, irrigation, and labour services — all in one place.

> **Author:** Ryan — Eldohub AI & Tech Academy · **License:** [MIT](LICENSE)

---

## ✨ Key Features

### 🧑‍🌾 Core Marketplace
- **Role-based accounts** — Farmer, Buyer, Service Provider (and Admin)
- **Live Marketplace** — search, county filters, category filters, paginated produce listings
- 📣 **Buyer demand board** — buyers publish crop, quantity, county, optional budget, delivery date and quality requirements; farmers filter open demand and contact buyers directly
- **Produce Management** — farmers create, edit, deactivate, delete listings with image uploads
- **Orders** — place orders on listings, view order history, update order status
- **Messaging** — one-to-one WhatsApp-style conversations with unread badges and notifications
- **Notifications** — in-app real-time notifications with read-state tracking
- **Market Prices** — farm-gate price data (seeded locally + optional Shamba Records API)
- **Services** — service providers list offerings; farmers browse and send service requests
- **Reviews** — public farmer profiles with ratings and reviews
- **Dashboard** — role-aware KPI cards, Chart.js analytics, sidebar navigation with unread counts

### 🔐 Security & Infrastructure
- **bcrypt** password hashing · **JWT** session in httpOnly cookies
- **Signed double-submit CSRF** protection with auto-recovery on token expiry
- **Rate-limited** auth endpoints · **Helmet** + **CORS** hardening
- **SQL injection** protection via Sequelize ORM parameterized queries

### 💰 Monetization & Payments — *Planned (not yet implemented)*
> The database schema (migration `011_monetization_system.sql`) defines subscription
> plans, features, payments, and listing promotions. However, **no payment controllers,
> services, routes, or provider integrations exist in the root codebase yet**. Payment
> gateway integration (including PayHero STK Push, Lipwa QR, Buy Goods Till, etc.)
> is gated behind a security audit per the implementation plan and will not be claimed
> as available until it passes review.
- **Subscription Tiers** — Starter (Free), Pro (KES 500/mo), Business (KES 1,500/mo) — *schema defined, UI/flows planned*
- **PayHero Automated Payments** — STK Push, Lipwa QR, Buy Goods Till — *not yet implemented*
- **Listing Boosts** — Featured, Top of Category, Urgent Clearance — *schema defined, flows planned*
- **Manual Payment Verification** — admin-controlled transaction code pipeline — *not yet implemented*
- **Entitlement System** — active-listing limit (10 for free tier) is enforced transactionaly; tier-based feature gating is planned

### 🤖 AI & Communication — *Planned (not yet implemented)*
> No AI assistant, chatbot, or RAG adapter exists in the codebase. These features are
> listed as future enhancements only after provider selection and security review.
- **AI Assistant** — in-page chatbot co-pilot — *not yet implemented*
- **Messaging** — one-to-one conversations with unread badges (no attachment support yet)
- **Notifications Bell** — unread badge counter with mark-all-as-read support — *partially implemented*

---

## 🧰 Tech Stack

| Layer       | Technology                                              |
|-------------|---------------------------------------------------------|
| Runtime     | Node.js 18+ (Express)                                   |
| Language    | JavaScript (CommonJS)                                   |
| Templating  | EJS (server-rendered)                                   |
| Database    | MySQL 8 · Sequelize ORM                                 |
| Auth        | jsonwebtoken (httpOnly cookie) · bcryptjs             |
| Security    | helmet · signed double-submit CSRF · express-rate-limit |
| Charts      | Chart.js (CDN)                                          |
| Icons       | Lucide (CDN)                                            |
| Payments    | Planned — schema in mig 011, no payment controllers/routes |
| Config      | dotenv                                                  |

---

## 📐 System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Load Balancer                              │
│                          (NGINX / AWS ALB)                          │
└────────────┬─────────────────────────────────────────────┬──────────┘
             │                                             │
     ┌───────▼────────┐                           ┌──────▼───────┐
     │   Web Pod      │                           │  Web Pod     │
     │   (replica 1)  │                           │  (replica 2) │
     ├────────────────┤                           ├──────────────┤
     │  Express.js    │                           │  Express.js  │
     │  (Node 18+)    │                           │  (Node 18+)  │
     │                │                           │              │
     │  ┌─────────┐   │        ┌────────────┐     │  ┌─────────┐ │
     │  │ EJS     │   │        │            │     │  │ EJS     │ │
     │  │ Views   │   │───────▶│  MySQL DB  │◀────│  │ Views   │ │
     │  └─────────┘   │        │  (Primary) │     │  └─────────┘ │
     │                │        │            │     │              │
     │  ┌─────────┐   │        │  ┌────────┐│     │  ┌─────────┐ │
     │  │Static   │   │        │  │Redis   ││     │  │Static   │ │
     │  │Assets   │   │        │  │(Cache) ││     │  │Assets   │ │
     │  └─────────┘   │        │  └────────┘│     │  └─────────┘ │
     │                │        └────────────┘     │              │
     └────────────────┘                           └──────────────┘
```

### Component Layers

1. **Presentation Layer** — EJS templates rendered server-side, served via Express static middleware for CSS/Images, Lucide icons + Chart.js via CDN for zero-config client interactivity
2. **Application Layer** — Express.js routing, middleware pipeline (Helmet → CORS → Cookie Parser → CSRF → Rate Limiting → Auth), EJS view engine with partials system
3. **Business Logic Layer** — Controllers orchestrate models + services; Services handle external API integrations (Shamba Records, KAMIS price feed)
4. **Data Access Layer** — Sequelize ORM with MySQL 8, model associations registered at boot, SQL migrations tracked in `schema_migrations` table
5. **Payment Gateway Layer** — *Planned*: pluggable provider architecture (PayHero API v2) will be added after security audit

### Request Flow
```
Browser → NGINX → Express.js → CSRF Middleware → Auth Middleware → Router
                → Controller → Model (Sequelize) → MySQL (transactional)
                → EJS Render → HTTP Response → Browser
```

---

## 📁 Project Structure

```
.
├── server.js                        # Express app entry point (middleware + route mounting)
├── config/
│   └── database.js                  # Sequelize connection + testConnection()
├── models/
│   ├── *.js                         # Sequelize models (User, ProduceListing, Order, ...)
│   └── associations.js            # Registers all model associations (loaded at boot)
├── controllers/
│   ├── authController.js            # bcrypt + JWT login/register/logout
│   ├── dashboardController.js       # Role-aware KPI + Chart.js analytics
│   ├── listingController.js         # API listings (paginated, sort allowlist)
│   ├── marketplaceController.js     # Server-rendered marketplace browse
│   ├── produceController.js         # Farmer produce CRUD + entitlement checks
│   ├── buyerDemandController.js     # Buyer demand board (create/filter/status)
│   ├── orderController.js           # Orders CRUD + order-item joins
│   ├── messageController.js         # One-to-one messaging
│   ├── marketPriceController.js     # Market price API (Shamba Records + local)
│   ├── serviceController.js         # Provider service listings + requests
│   ├── reviewController.js          # Reviews / ratings
│   ├── profileController.js         # Profile + password management
│   ├── notificationController.js    # In-app notification CRUD
│   ├── adminController.js           # Admin panel data
│   └── advisoryController.js        # Crop advisory stubs
├── routes/
│   ├── authRoutes.js                # /api/auth/register, /login, /logout, /me, /csrf
│   ├── listingRoutes.js             # /api/listings (GET list w/ pagination)
│   ├── marketplace.js               # GET /marketplace (server-rendered browse)
│   ├── produceRoutes.js             # /produce (farmer produce management)
│   ├── buyerDemandRoutes.js         # /demand-board (buyer demand board)
│   ├── orderRoutes.js               # /orders
│   ├── messageRoutes.js             # /api/messages
│   ├── marketPriceRoutes.js         # /market-prices
│   ├── serviceRoutes.js             # /services
│   ├── reviewRoutes.js              # /reviews
│   ├── farmerRoutes.js              # /farmers (public profiles)
│   ├── profileRoutes.js             # /profile
│   ├── notificationRoutes.js        # /notifications
│   ├── dashboardRoutes.js           # /dashboard
│   ├── adminRoutes.js               # /admin (admin only)
│   └── mobileRoutes.js              # /api/m/* (mobile JSON API)
├── middlewares/
│   ├── authMiddleware.js            # JWT auth for API routes
│   ├── pageAuth.js                  # requireAuthPage, redirectIfAuthed
│   ├── csrf.js                      # Signed double-submit CSRF
│   ├── errorHandler.js              # Centralized error handler
│   ├── upload.js                    # Multer image upload
│   ├── requireAdmin.js              # Admin role guard
│   └── sidebarData.js               # Sidebar context injector
├── services/
│   ├── entitlementService.js        # Active-listing limit (free tier = 10)
│   ├── marketplaceService.js        # WHERE builder, pagination, sort allowlist
│   ├── orderService.js              # Order creation + inventory
│   ├── kamisService.js              # KAMIS price feed adapter
│   └── shabaRecordsService.js       # Shamba Records API adapter
├── utils/
│   ├── validation.js                # Server-side validators (ok/err pattern)
│   ├── sanitize.js                  # HTML sanitizer (sanitize-html)
│   └── ApiError.js                  # Centralized error class
├── views/
│   ├── index.ejs                    # Landing page
│   ├── login.ejs, register.ejs
│   ├── dashboard.ejs                # Role-aware dashboard + Chart.js
│   ├── marketplace.ejs              # Marketplace browse (paginated)
│   ├── demand-board.ejs             # Buyer demand board
│   ├── messages.ejs                 # Messaging page
│   ├── market-prices.ejs            # Market prices
│   ├── profile.ejs                  # User profile
│   ├── produce.ejs                  # Farmer produce management
│   ├── services.ejs                 # Service provider listings
│   ├── orders.ejs                   # Order history
│   ├── notifications.ejs            # Notification center
│   ├── faqs.ejs                     # FAQ page
│   ├── why-us.ejs                   # How it works
│   └── partials/
│       ├── header.ejs, navbar.ejs, footer.ejs
│       ├── sidebar.ejs              # Collapsible sidebar
│       └── [alert, csrf, toast, topbar, scripts, state]
├── public/
│   ├── css/
│   │   ├── style.css                # Project CSS variables + components
│   │   └── foundation.css           # Shared UI foundation
│   └── images/                      # Local images for hero, marketplace
├── database/                        # SQL migrations (002 through 012)
│   ├── 002_marketplace_engine.sql
│   ├── 003_user_county.sql
│   ├── 004_messages_snake_case.sql
│   ├── 005_order_items_updated_at.sql
│   ├── 006_application_overhaul.sql
│   ├── 007_add_indexes.sql
│   ├── 008_add_user_active.sql
│   ├── 009_add_profile_customization.sql
│   ├── 009_buyer_demand_board.sql  # Buyer demand board schema
│   ├── 010_add_unit_to_listings.sql
│   ├── 011_monetization_system.sql # Plans/subscriptions/payments schema (not yet wired)
│   └── 012_set_free_listing_limit.sql
├── scripts/
│   ├── migrate.js                   # SQL migration runner (tracked, idempotent)
│   ├── seed.js                      # Demo data seeder (idempotent)
│   ├── run_migration.js             # Legacy: only runs mig 006 — avoid for new installs
│   ├── apply_008.js                 # One-off: adds is_active column
│   └── apply_009.js, apply_010.js   # One-off migration helpers
├── docker-compose.yml               # Production deployment
├── .env.example                     # Environment variable template
└── README.md
```

---

## ✅ Prerequisites

- **Node.js** 18.11+ (the `dev` script uses `node --watch`). Node 20/22 LTS recommended.
- **MySQL** 8.0+
- **Docker** + **Docker Compose** (for containerized deployment)
- **kubectl** (optional, for Kubernetes orchestration)
- **npm**

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd AgriConnect-Project
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and set your MySQL credentials and a strong `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 3. Create the Database & Apply Migrations

```bash
# Create database (one-time)
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS Smart_Kilimo;"

# Apply all tracked migrations (002 through 012) — safe to re-run
npm run db:migrate
```

### 4. Seed Demo Data (Optional but Recommended)

```bash
npm run db:seed
```

### 5. Run the Application

```bash
# Development (auto-restarts on file changes)
npm run dev

# Production
npm start
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🔐 Environment Variables Schema

> Full template in `.env.example`. Required (no default) variables will cause the app to exit at boot if unset.

### Core Application

| Variable            | Required | Default             | Description                                              |
|---------------------|----------|---------------------|----------------------------------------------------------|
| `PORT`              | No       | `3000`              | HTTP server port                                         |
| `NODE_ENV`          | No       | `development`       | `production` enables HTTPS cookies + sanitized errors    |
| `JWT_SECRET`        | **Yes**  | —                   | Secret signing JWTs + CSRF tokens (≥ 32 chars)           |
| `CORS_ORIGIN`       | No       | `*`                 | Allowed CORS origin(s), comma-separated in production    |
| `DB_HOST`           | No       | `localhost`         | MySQL host                                               |
| `DB_USER`           | No       | `root`              | MySQL user                                               |
| `DB_PASSWORD`       | **Yes**  | —                   | MySQL password                                           |
| `DB_NAME`           | No       | `Smart_Kilimo`      | MySQL database name                                      |
| `DB_DIALECT`        | No       | `mysql`             | Sequelize dialect                                        |

### PayHero Payment Gateway — *Planned (not yet implemented)*

> No payment provider integration exists in the codebase. These variables will be
> required once the payment connector is implemented after security review.

### Shamba Records Market Prices (Optional)

| Variable            | Required | Default                                            | Description                       |
|---------------------|----------|----------------------------------------------------|-----------------------------------|
| `SHAMBA_PUBLIC_KEY` | No       | —                                                  | Shamba Records API public key     |
| `SHAMBA_SECRET_KEY` | No       | —                                                  | Shamba Records API secret key     |
| `SHAMBA_API_BASE_URL` | No    | `https://api-data.shambarecords.com/api/v1`        | Shamba API base URL               |

### SMS & Cloud Storage (Optional Placeholders)

| Variable            | Required | Default | Description                        |
|---------------------|----------|---------|------------------------------------|
| `AT_SMS_API_KEY`    | No       | —       | Africa's Talking SMS API key       |
| `AT_SMS_USERNAME`   | No       | —       | Africa's Talking username          |
| `CLOUDINARY_URL`    | No       | —       | Cloudinary upload URL              |

---

## 💰 Monetization & Entitlement Matrix

### Subscription Tiers — *Schema defined, UI/flows planned*

> The monetization schema (`011_monetization_system.sql`) and limit alignment
> (`012_set_free_listing_limit.sql`) define the tiers below. **No subscription
> UI, checkout flow, or payment processing is implemented yet.**

| Tier     | Price         | Listings | Images/Listing | Search Ranking | Verified Badge | Featured Slots | Lead Mgmt |
|----------|---------------|----------|----------------|----------------|----------------|----------------|-----------|
| Starter  | **Free**      | 10       | 5              | Basic          | —             | 0              | —        |
| Pro      | KES 500/mo    | 20       | 10             | Priority       | ✅             | 2              | ✅        |
| Business | KES 1,500/mo  | 100      | 20             | Top Priority   | ✅ (Business)  | 5              | ✅ + API  |

### Listing Boosts

| Boost Type          | Price    | Duration | Effect                          |
|---------------------|----------|----------|---------------------------------|
| Featured Boost      | KES 500  | 7 days   | Highest search ranking + Gold badge |
| Top of Category     | KES 350  | 7 days   | Pins to top of category results |
| Urgent Clearance    | KES 200  | 7 days   | Red "Urgent" tag for liquidation|

### Payment Channels — *Planned*

> No payment processing is implemented. Only manual M-Pesa verification is planned as a fallback.

| Channel               | Automated | Manual Verification |
|-----------------------|-----------|---------------------|
| PayHero STK Push / QR | *Planned* | —                   |
| PayHero Buy Goods Till| *Planned* | —                   |
| PayHero Send Money    | *Planned* | —                   |
| PayHero Pochi La Biashara | *Planned* | —                  |
| PayHero Bank Transfer | *Planned* | —                   |
| Manual M-Pesa         | —         | *Planned: admin verifies*  |

### Entitlement Enforcement

- **Active listing limit** is enforced transactionally in `services/entitlementService.js` — free tier allows 10 active `LISTED` produce listings; paid plans (if subscribed) get their plan's `max_listings`; falls back to 10 if subscription tables are missing (graceful degradation)
- **Listing creation** calls `createPublishedListing()` which uses a row-level lock (`LOCK.UPDATE`) + count check within a single Sequelize transaction to prevent concurrent bypass
- **Status transitions** validate ownership (`listing.farmerId !== req.user.id`) before any mutation
- **Image uploads** are validated for file type and ownership (owner-only) — plan-based image count limits are *planned*

---

## 🎮 NPM Scripts

| Script         | Command                                       | Description                                    |
|----------------|-----------------------------------------------|------------------------------------------------|
| `npm start`    | `node -r dotenv/config server.js`             | Start the server (production)                  |
| `npm run dev`  | `node -r dotenv/config --watch server.js`     | Start with auto-reload on file changes         |
| `npm test`     | `node --test test/**/*.test.js`              | Run test suite                                 |
| `npm run db:migrate` | `node scripts/migrate.js`                    | Run all SQL migrations 002–012                |
| `npm run db:seed` | `node scripts/seed.js`                     | Seed demo users, listings, services            |

---

## 🔐 Authentication & Session Flow

1. **`POST /api/auth/register`** — validates input, rejects duplicates, hashes password with bcrypt, creates user, signs JWT, sets `agri_token` httpOnly cookie
2. **`POST /api/auth/login`** — finds user by email or phone, verifies password, sets JWT cookie
3. **`POST /api/auth/logout`** — clears the cookie
4. **`GET /api/auth/me`** — (auth required) returns current user details (no password hash)
5. **`GET /api/auth/csrf`** — (public) issues a fresh CSRF token for self-healing forms

### Security Pipeline (Server Startup)
```
Helmet → CORS → express.json → express.urlencoded → cookieParser → initCsrf → csrfProtect → rateLimit
```

### CSRF Protection (Signed Double-Submit)
- Every response sets a signed `_csrf` cookie containing a server-side session-bound token
- All `<form>` elements include a hidden `_csrf` input via the `partials/csrf.ejs` template
- State-changing AJAX requests must include `X-CSRF-Token` header
- If a token expires mid-session (1-hour cookie TTL), forms auto-fetch a fresh token from `GET /api/auth/me` and retry — no "session expired" dead-ends

---

## 🗺️ Routes & Pages

### Public (No Auth)
| Path                   | Purpose                          |
|------------------------|----------------------------------|
| `/`                    | Landing page (hero carousel)     |
| `/login`, `/register`  | Auth pages                       |
| `/faqs`                | FAQ page                         |
| `/marketplace`         | Browse produce listings          |
| `/services`            | Browse service providers         |
| `/market-prices`       | Farm-gate price data             |
| `/why-us`              | Platform value proposition       |

> Note: `/pricing`, `/privacy`, and `/docs` pages are planned but not yet implemented.

### Authenticated
| Path                               | Purpose                              |
|------------------------------------|--------------------------------------|
| `/dashboard`                       | Role-aware analytics dashboard       |
| `/produce`                         | Farmer produce CRUD                  |
| `/orders`                          | Orders list / create / detail         |
| `/messages`                        | One-to-one messaging                 |
| `/messages/:userId`                | Specific conversation thread          |
| `/notifications`                   | User notifications                    |
| `/profile`                         | Profile + password management         |

### API Endpoints
| Path                              | Method | Purpose                          |
|-----------------------------------|--------|----------------------------------|
| `/api/auth/register`              | POST   | Register new account             |
| `/api/auth/login`                 | POST   | Login + set JWT cookie           |
| `/api/auth/logout`                | POST   | Clear session                    |
| `/api/auth/me`                    | GET    | Get current user                 |
| `/api/auth/csrf`                  | GET    | Fresh CSRF token (self-heal)     |
| `/api/listings`                   | GET/POST | Listings with pagination, search, sort allowlist      |
| `/api/messages`                   | POST   | Send message                     |
| `/api/dashboard/stats`            | GET    | Dashboard KPIs                   |

---

## 🗃️ Database & Migrations

- **Base schema** lives in `database.sql`
- **Incremental SQL migrations** live in `database/` (`002` through `012`)
- Migration `009_buyer_demand_board.sql` adds the buyer demand board schema (demand posts with crop, quantity, county, budget, delivery date, quality); apply it with `node scripts/migrate.js`
- `scripts/migrate.js` is the tracked runner that records applied migrations in the `schema_migrations` table (safe to re-run)
- `scripts/run_migration.js` is a **legacy** runner that only applies migration 006 — avoid it for new installs
- **Known gotcha:** databases imported from `database.sql` may be missing `users.is_active` (required by `models/User.js`). Run `node scripts/apply_008.js` to add it safely (idempotent)
- Migration `011_monetization_system.sql` defines plans, subscriptions, payments, and listing promotion tables (DB schema only — no payment/subscription controllers or services are implemented yet)
- Migration `012_set_free_listing_limit.sql` aligns the free-tier (Starter) plan's `max_listings` to 10, matching the enforced `FREE_ACTIVE_LISTING_LIMIT` in `services/entitlementService.js`
- `scripts/seed.js` is idempotent and re-provisions bcrypt hashes for demo users

### Running Migrations

```bash
# Create the database (one-time)
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS Smart_Kilimo;"

# Apply all migrations
npm run db:migrate

# Seed demo data
npm run db:seed
```

---

## 🐳 Docker Deployment

### docker-compose.yml (Production)

```yaml
version: '3.8'

services:
  db:
    image: mysql:8.0
    command: --default-authentication-plugin=mysql_native_password
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME:-Smart_Kilimo}
      MYSQL_USER: ${DB_USER:-root}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database:/docker-entrypoint-initdb.d
    networks:
      - agriconnect-net

  app:
    build: .
    restart: unless-stopped
    ports:
      - "${PORT:-3000}:3000"
    env_file: .env
    depends_on:
      - db
    volumes:
      - ./public:/app/public
      - ./views:/app/views
    networks:
      - agriconnect-net

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/certs:/etc/nginx/certs:ro
      - static_files:/app/public
    depends_on:
      - app
    networks:
      - agriconnect-net

volumes:
  mysql_data:
  static_files:

networks:
  agriconnect-net:
    driver: bridge
```

### Deploy Commands

```bash
# 1. Ensure .env is configured with production values
cp .env.example .env
# Edit .env: set NODE_ENV=production, CORS_ORIGIN

# 2. Build and deploy
docker-compose up -d --build

# 3. Run migrations inside the container
docker-compose exec app npm run db:migrate

# 4. Seed data (optional)
docker-compose exec app npm run db:seed
```

## ☸️ Kubernetes Orchestration

### k8s-manifests/deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: agriconnect-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: agriconnect
  template:
    metadata:
      labels:
        app: agriconnect
    spec:
      containers:
        - name: agriconnect
          image: ghcr.io/your-org/agriconnect-ke:latest
          ports:
            - containerPort: 3000
          envFrom:
            - configMapRef:
                name: agriconnect-config
            - secretRef:
                name: agriconnect-secrets
          livenessProbe:
            httpGet:
              path: /login
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 15
          readinessProbe:
            httpGet:
              path: /marketplace
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 10
```

### k8s-manifests/ingress.yaml

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: agriconnect-ingress
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
    - hosts:
        - agriconnect.co.ke
      secretName: agriconnect-tls
  rules:
    - host: agriconnect.co.ke
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: agriconnect-service
                port:
                  number: 80
```

### Deploy Commands

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s-manifests/

# Verify deployment
kubectl get pods,svc,ingress -n agriconnect-production

# Port forward for local testing
kubectl port-forward svc/agriconnect-service 3000:80 -n agriconnect-production
```

---

## 🧪 Testing

```bash
# Run the full test suite
npm test

# Run a specific test file
npm test -- test/entitlementService.test.js

# Syntax-check a file or group of files
npm run check
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/your-feature`)
3. Make your changes with tests
4. Commit and push
5. Open a pull request

---

## 📄 License

This project is licensed under the **MIT License** — see the [`LICENSE`](LICENSE) file for details.

---

## 💬 Support

For platform support, security issues, or feature requests, contact: **dev@agriconnect.co.ke**
