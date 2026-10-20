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

### 💰 Monetization & Payments (PayHero Integration)
- **Subscription Tiers** — Starter (Free), Pro (KES 500/mo), Business (KES 1,500/mo)
- **PayHero Automated Payments** — STK Push, Lipwa QR, Buy Goods Till, Send Money, Pochi La Biashara, Bank Transfer
- **Listing Boosts** — Featured (KES 500/7 days), Top of Category (KES 350/7 days), Urgent Clearance (KES 200/7 days)
- **Manual Payment Verification** — admin-controlled transaction code verification pipeline
- **Full Entitlement System** — feature gating per tier with automated activation

### 🤖 AI & Communication
- **AI Assistant** — in-page chatbot co-pilot for quick help and advisory
- **WhatsApp-style Messaging** — real-time conversations with attachment support
- **Notifications Bell** — unread badge counter with mark-all-as-read support

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
| Payments    | PayHero API v2 (STK, QR, Till, Bank)                    |
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
     │  PayHero API ◀─┼──────────────────────────▶│  PayHero API │
     └────────────────┘                           └──────────────┘
```

### Component Layers

1. **Presentation Layer** — EJS templates rendered server-side, served via Express static middleware for CSS/Images, Lucide icons + Chart.js via CDN for zero-config client interactivity
2. **Application Layer** — Express.js routing, middleware pipeline (Helmet → CORS → Cookie Parser → CSRF → Rate Limiting → Auth), EJS view engine with partials system
3. **Business Logic Layer** — Controllers orchestrate models + services; Services handle external API integrations (PayHero, Shamba Records)
4. **Data Access Layer** — Sequelize ORM with MySQL 8, model associations registered at boot, SQL migrations tracked in `schema_migrations` table
5. **Payment Gateway Layer** — Pluggable provider architecture (`PaymentGatewayInterface` → `PayHeroProvider` / `ManualMpesaProvider`), managed via `PaymentGatewayManager`

### Request Flow
```
Browser → NGINX → Express.js → CSRF Middleware → Auth Middleware → Router
                → Controller → Model (Sequelize) → MySQL
                → Service (PayHero API) → Payment Record
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
│   ├── monetizationController.js    # Pricing, checkout, payment code submission
│   ├── messageController.js         # Messaging with attachments (graceful fallback)
│   └── [auth, dashboard, orders, ...]
├── routes/
│   ├── monetizationRoutes.js        # /pricing, /monetization/checkout, /monetization/promotions
│   └── [auth, dashboard, business, marketplace, ...]
├── middlewares/
│   ├── pageAuth.js                  # requireAuthPage, redirectIfAuthed
│   ├── csrf.js                      # Signed double-submit CSRF
│   ├── authMiddleware.js            # JWT auth for API routes
│   └── [auth, errorHandler, upload, ...]
├── services/
│   ├── payment/
│   │   ├── PaymentGatewayInterface.js   # Abstract interface
│   │   ├── PayHeroProvider.js           # PayHero API v2 integration
│   │   ├── ManualMpesaProvider.js       # Manual M-Pesa verification
│   │   └── PaymentGatewayManager.js     # Provider registry + orchestration
│   ├── entitlementService.js        # Subscription activation + feature gating
│   └── [expiryCronService, ...]
├── utils/
│   ├── ApiError.js                  # Centralized error class
│   └── [listingQuality, ...]
├── views/
│   ├── index.ejs                    # Landing page with hero carousel
│   ├── login.ejs, register.ejs
│   ├── dashboard.ejs                # Role-aware dashboard + sidebar
│   ├── faqs.ejs                     # Dark-themed accordion FAQs
│   ├── monetization/
│   │   ├── plans.ejs                # Pricing page with PayHero integration
│   │   ├── checkout.ejs             # Multi-channel payment selector
│   │   └── promotions.ejs           # Listing boost packages
│   └── partials/
│       ├── header.ejs, navbar.ejs, footer.ejs
│       ├── sidebar.ejs              # Collapsible sidebar with unread badges
│       ├── chatbot.ejs              # AI Assistant widget
│       └── [alert, csrf, toast, ...]
├── public/
│   ├── css/
│   │   ├── style.css                # Project CSS variables + components
│   │   └── foundation.css           # Shared UI foundation
│   └── images/                      # Local images for hero, marketplace
├── database/
│   ├── 002_marketplace_engine.sql
│   ├── 003_user_county.sql
│   ├── 004_messages_snake_case.sql
│   ├── 005_order_items_updated_at.sql
│   ├── 006_application_overhaul.sql
│   ├── 007_add_indexes.sql
│   ├── 008_add_user_active.sql
│   ├── 009_add_profile_customization.sql
│   ├── 010_add_unit_to_listings.sql
│   ├── 011_core_monetization_subsystem.sql
│   └── 012_add_message_attachments.sql
├── scripts/
│   ├── migrate.js                   # SQL migration runner
│   ├── seed.js                      # Demo data seeder (idempotent)
│   ├── run_migration.js             # Tracked migration with version tracking
│   ├── apply_008.js                 # One-off: adds is_active column
│   └── purge_test_listings.js
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

# Apply all tracked migrations (002 through 012)
node scripts/run_migration.js
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

### PayHero Payment Gateway

| Variable                   | Required | Default | Description                                              |
|----------------------------|----------|---------|----------------------------------------------------------|
| `PAYHERO_API_USERNAME`     | **Yes**  | —       | PayHero API username (KYC-approved business account)    |
| `PAYHERO_API_PASSWORD`     | **Yes**  | —       | PayHero API password                                     |
| `PAYHERO_ACCOUNT_ID`       | **Yes**  | —       | PayHero merchant account ID (numeric)                     |
| `PAYHERO_BASIC_AUTH_TOKEN` | **Yes**  | —       | PayHero Basic Auth token (base64 encoded credentials)    |
| `PAYHERO_API_URL`          | No       | `https://backend.payhero.co.ke/api/v2/payments` | PayHero API v2 base URL |

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

### Subscription Tiers

| Tier     | Price         | Listings | Images/Listing | Search Ranking | Verified Badge | Featured Slots | Lead Mgmt |
|----------|---------------|----------|----------------|----------------|----------------|----------------|-----------|
| Starter  | **Free**      | 3        | 5              | Basic          | ❌             | 0              | ❌        |
| Pro      | KES 500/mo    | 20       | 10             | Priority       | ✅             | 2              | ✅        |
| Business | KES 1,500/mo  | 100      | 20             | Top Priority   | ✅ (Business)  | 5              | ✅ + API  |

### Listing Boosts

| Boost Type          | Price    | Duration | Effect                          |
|---------------------|----------|----------|---------------------------------|
| Featured Boost      | KES 500  | 7 days   | Highest search ranking + Gold badge |
| Top of Category     | KES 350  | 7 days   | Pins to top of category results |
| Urgent Clearance    | KES 200  | 7 days   | Red "Urgent" tag for liquidation|

### Payment Channels

| Channel               | Automated | Manual Verification |
|-----------------------|-----------|---------------------|
| PayHero STK Push / QR | ✅        | —                   |
| PayHero Buy Goods Till| ✅        | —                   |
| PayHero Send Money    | ✅        | —                   |
| PayHero Pochi La Biashara | ✅    | —                   |
| PayHero Bank Transfer | ✅        | —                   |
| Manual M-Pesa         | ❌        | ✅ Admin verifies    |

### Entitlement Enforcement

- **Plan limits** are enforced at the model layer via `EntitlementService`
- **Listing creation/edit** checks `userPlan.plan.maxListings` before allowing writes
- **Image count** is validated against `plan.maxImagesPerListing`
- **Featured slots** are allocated per-plan and expire automatically via `ExpiryCronService` (runs every 15 minutes)
- **Payment verification** flows through `PaymentGatewayManager.adminVerifyPayment()` → `EntitlementService.activateSubscriptionOrPromotion()`

---

## 🎮 NPM Scripts

| Script         | Command                                       | Description                                    |
|----------------|-----------------------------------------------|------------------------------------------------|
| `npm start`    | `node -r dotenv/config server.js`             | Start the server (production)                  |
| `npm run dev`  | `node -r dotenv/config --watch server.js`     | Start with auto-reload on file changes         |
| `npm test`     | _(if configured)_                             | Run test suite                                 |
| `npm run db:migrate` | `node scripts/run_migration.js`            | Run all SQL migrations 002–012                |
| `npm run db:seed` | `node scripts/seed.js`                     | Seed demo users, listings, services            |

---

## 🔐 Authentication & Session Flow

1. **`POST /api/auth/register`** — validates input, rejects duplicates, hashes password with bcrypt, creates user, signs JWT, sets `agri_token` httpOnly cookie
2. **`POST /api/auth/login`** — finds user by email or phone, verifies password, sets JWT cookie
3. **`POST /api/auth/logout`** — clears the cookie
4. **`GET /api/auth/me`** — (auth required) returns current user + active subscription/plan
5. **`GET /api/auth/csrf`** — (auth required) issues a fresh CSRF token for self-healing forms

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
| `/faqs`                | Dark-themed FAQ accordion        |
| `/pricing`             | Public pricing with PayHero UI   |
| `/marketplace`         | Browse produce listings          |
| `/services`            | Browse service providers         |
| `/market-prices`       | Farm-gate price data             |
| `/why-us`              | Platform value proposition       |
| `/privacy`             | Privacy policy                   |
| `/docs`                | Developer/user documentation     |

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
| `/monetization/checkout?planId=`   | Plan subscription checkout            |
| `/monetization/promotions`         | Listing boost selection               |

### API Endpoints
| Path                              | Method | Purpose                          |
|-----------------------------------|--------|----------------------------------|
| `/api/auth/register`              | POST   | Register new account             |
| `/api/auth/login`                 | POST   | Login + set JWT cookie           |
| `/api/auth/logout`                | POST   | Clear session                    |
| `/api/auth/me`                    | GET    | Get current user                 |
| `/api/auth/csrf`                  | GET    | Fresh CSRF token (self-heal)     |
| `/api/listings`                   | GET/POST | Listings CRUD                   |
| `/api/messages`                   | POST   | Send message                     |
| `/api/dashboard/stats`            | GET    | Dashboard KPIs                   |

---

## 🗃️ Database & Migrations

- **Base schema** lives in `database.sql`
- **Incremental SQL migrations** live in `database/` (`002` through `012`)
- `scripts/run_migration.js` is a tracked runner that records applied migrations in the `schema_migrations` table
- **Known gotcha:** databases imported from `database.sql` may be missing `users.is_active` (required by `models/User.js`). Run `node scripts/apply_008.js` to add it safely (idempotent)
- Migration `012` (`012_add_message_attachments.sql`) adds the `attachments` JSON column to the `messages` table for the messaging system
- `scripts/seed.js` is idempotent and re-provisions bcrypt hashes for demo users

### Running Migrations

```bash
# Create the database (one-time)
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS Smart_Kilimo;"

# Apply all migrations
node scripts/run_migration.js

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
# Edit .env: set NODE_ENV=production, CORS_ORIGIN, PayPal/PayHero creds

# 2. Build and deploy
docker-compose up -d --build

# 3. Run migrations inside the container
docker-compose exec app node scripts/run_migration.js

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

# Run specific test file
npm test -- tests/unit/auth.test.js

# Run integration tests
npm run test:integration
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

For PayHero integration issues, API key questions, or monetization workflow support, contact: **dev@agriconnect.co.ke**
