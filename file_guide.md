# AgriConnect KE — Project Guide

> Full-Stack Final Project | Eldohub AI and Tech Academy
> Solo build | ~5 weeks | HTML · CSS · JS · Node.js · Express · MongoDB

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Folder Structure](#3-folder-structure)
4. [Database Schema](#4-database-schema)
5. [Pages & Routes](#5-pages--routes)
6. [5-Week Roadmap](#6-5-week-roadmap)
7. [MVP Checklist](#7-mvp-checklist)
8. [Presentation Strategy](#8-presentation-strategy)
9. [Startup Differentiation](#9-startup-differentiation)
10. [AI Feature Plan](#10-ai-feature-plan)
11. [Git Workflow](#11-git-workflow)
12. [Environment Setup](#12-environment-setup)
13. [Common Pitfalls](#13-common-pitfalls)

---

## 1. Project Overview

**AgriConnect KE** is a full-stack web platform connecting Kenyan farmers directly with buyers and trusted agricultural service providers.

### The Problem
- Farmers lose money selling through brokers
- Buyers can't find fresh produce sources easily
- Farmers can't locate reliable fundis (mechanics, irrigators, transporters)

### The Solution
One platform where:
- Farmers **post produce** and **request services**
- Buyers **browse and purchase** fresh produce
- Service providers **list availability** and receive bookings

### Tagline
> *"Connecting Kenyan farmers to buyers and essential farm services in one place."*

---

## 2. Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | HTML5, CSS3, Vanilla JS | Your strongest skill |
| Backend | Node.js + Express.js | JavaScript everywhere |
| Database | MongoDB + Mongoose | Flexible schema, fast setup |
| Auth | JWT + bcrypt | Industry standard |
| File uploads | Multer | Profile/produce images |
| Environment | dotenv | Secrets management |
| Dev tool | Nodemon | Auto-restart on changes |

### Install all dependencies
```bash
npm install express mongoose dotenv bcryptjs jsonwebtoken multer cors
npm install --save-dev nodemon
```

---

## 3. Folder Structure

```
agriconnect-ke/
├── frontend/
│   ├── index.html             # Homepage
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html         # Role-aware dashboard
│   ├── marketplace.html       # Produce listings
│   ├── services.html          # Services listings
│   ├── post-produce.html      # Farmer: add produce
│   ├── add-service.html       # Provider: add service
│   ├── profile.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── auth.js
│       ├── marketplace.js
│       ├── services.js
│       └── dashboard.js
├── backend/
│   ├── server.js              # Entry point
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── models/
│   │   ├── User.js
│   │   ├── Produce.js
│   │   ├── Service.js
│   │   └── Request.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── produce.js
│   │   ├── services.js
│   │   └── requests.js
│   └── middleware/
│       └── auth.js            # JWT verification
├── .env                       # NEVER commit this
├── .gitignore
├── package.json
└── GUIDE.md                   # This file
```

---

## 4. Database Schema

### User
```js
{
  name: String,            // required
  email: String,           // required, unique
  password: String,        // hashed with bcrypt
  role: String,            // "farmer" | "buyer" | "provider"
  county: String,          // e.g. "Uasin Gishu"
  phone: String,
  createdAt: Date
}
```

### Produce
```js
{
  farmerId: ObjectId,      // ref: User
  name: String,            // e.g. "Tomatoes"
  quantity: Number,        // in kg
  price: Number,           // KES per kg
  county: String,
  description: String,
  image: String,           // file path
  available: Boolean,
  createdAt: Date
}
```

### Service
```js
{
  providerId: ObjectId,    // ref: User
  category: String,        // "tractor" | "transport" | "irrigation" | "labor"
  county: String,
  price: Number,           // KES
  description: String,
  available: Boolean,
  createdAt: Date
}
```

### Request
```js
{
  requesterId: ObjectId,   // ref: User
  targetId: ObjectId,      // produce or service id
  type: String,            // "produce" | "service"
  status: String,          // "pending" | "accepted" | "declined"
  message: String,
  createdAt: Date
}
```

---

## 5. Pages & Routes

### Frontend Pages

| File | Purpose | Who sees it |
|------|---------|-------------|
| `index.html` | Homepage, hero, featured listings | Everyone |
| `login.html` | Login form | Everyone |
| `register.html` | Register + role selection | New users |
| `dashboard.html` | Role-aware home base | Logged in |
| `marketplace.html` | Browse all produce | Buyers, public |
| `services.html` | Browse all services | Farmers, public |
| `post-produce.html` | Add new produce listing | Farmers only |
| `add-service.html` | Add new service listing | Providers only |
| `profile.html` | View/edit profile | Logged in |

### Backend API Routes

```
POST   /api/auth/register
POST   /api/auth/login

GET    /api/produce             → all listings
POST   /api/produce             → create (farmer)
GET    /api/produce/:id         → single listing
DELETE /api/produce/:id         → delete (farmer, owner)

GET    /api/services            → all services
POST   /api/services            → create (provider)
GET    /api/services/:id        → single service
DELETE /api/services/:id        → delete (provider, owner)

POST   /api/requests            → create request
GET    /api/requests/mine       → my requests
PATCH  /api/requests/:id        → accept/decline
```

---

## 6. 5-Week Roadmap

### Week 1 — Foundation
- [ ] Set up folder structure (done if following this guide)
- [ ] Initialize Node project: `npm init -y`
- [ ] Install dependencies
- [ ] Connect MongoDB (local or Atlas)
- [ ] Create User model + auth routes (register, login)
- [ ] Build homepage HTML/CSS
- [ ] Build register/login pages

**Goal:** Working auth by end of week 1.

---

### Week 2 — Core Features Part 1
- [ ] Create Produce model
- [ ] Build POST/GET produce routes
- [ ] Build marketplace page (fetch + display cards)
- [ ] Build post-produce form (farmer)
- [ ] Add JWT middleware to protect routes
- [ ] Store token in localStorage, send in headers

**Goal:** Farmer can post produce. Buyer can browse.

---

### Week 3 — Core Features Part 2
- [ ] Create Service model
- [ ] Build POST/GET service routes
- [ ] Build services page (fetch + display)
- [ ] Build add-service form (provider)
- [ ] Create Request model + routes
- [ ] Wire up "Buy Produce" and "Request Service" buttons

**Goal:** Full listing + request flow working.

---

### Week 4 — Dashboard & Polish
- [ ] Build role-aware dashboard (shows different content by role)
- [ ] Show farmer's own listings
- [ ] Show buyer's requests
- [ ] Show provider's incoming requests
- [ ] Add county filter on marketplace
- [ ] Add image upload (Multer)
- [ ] Mobile-responsive CSS

**Goal:** Complete app flow, no broken pages.

---

### Week 5 — Demo-Ready
- [ ] Fix all bugs found in testing
- [ ] Add AI chatbot feature (see section 10)
- [ ] Seed realistic data (Kenyan produce names, counties)
- [ ] Write presentation script
- [ ] Record demo video as backup
- [ ] Deploy (optional: Render.com free tier)

**Goal:** Polished, presentable product.

---

## 7. MVP Checklist

These are the minimum features for a passing final project:

- [ ] User registration with role selection
- [ ] Login with JWT auth
- [ ] Farmer can post produce listing
- [ ] Buyer can browse produce listings
- [ ] Provider can add a service listing
- [ ] Farmer can browse and request a service
- [ ] Role-aware dashboard
- [ ] Responsive design (works on mobile)

**Nice to have (stretch goals):**
- [ ] AI assistant chatbot
- [ ] Image uploads for listings
- [ ] County-based filtering
- [ ] Request status tracking
- [ ] Deployed live URL

---

## 8. Presentation Strategy

### Opening (30 seconds)
> "In Kenya, millions of small-scale farmers sell their produce at low prices through brokers, and often can't find reliable agricultural services nearby. AgriConnect KE solves both problems in one platform."

### Live Demo Flow (2–3 minutes)
1. Show homepage → explain the three user roles
2. Register as a **farmer** → go to dashboard
3. Post a produce listing (tomatoes, Uasin Gishu, 90 KES/kg)
4. Log out → register/login as a **buyer**
5. Browse marketplace → find the tomatoes → request to buy
6. Show services page → demonstrate service browsing
7. If AI feature is ready: type a problem → show smart suggestion

### Closing (30 seconds)
> "AgriConnect KE reduces broker dependency, connects farmers directly with buyers, and gives access to trusted agricultural services — all in one platform built specifically for Kenya."

### If asked "does this already exist?"
> "Platforms like Twiga Foods focus on large-scale distribution, and apps like Lynk handle general services. AgriConnect KE combines both, specifically for agriculture and small-scale Kenyan farmers — that combination doesn't exist in one product today."

---

## 9. Startup Differentiation

| Feature | AgriConnect KE | Twiga Foods | Lynk |
|---------|---------------|------------|------|
| Produce marketplace | ✅ | ✅ | ❌ |
| Agricultural services | ✅ | ❌ | Partial |
| Small farmer focus | ✅ | ❌ | ❌ |
| County-based search | ✅ | Limited | ✅ |
| Both in one platform | ✅ | ❌ | ❌ |

**Your unique position:** agriculture-first, small-farmer-accessible, produce + services combined.

---

## 10. AI Feature Plan

Add a lightweight AI assistant to the homepage or dashboard.

### How it works
Use a simple keyword-matching function (no API needed for MVP):

```js
function suggestFromInput(userText) {
  const text = userText.toLowerCase();
  if (text.includes("irrigation") || text.includes("pump")) {
    return "Try searching: Irrigation Technician in your county.";
  }
  if (text.includes("transport") || text.includes("delivery")) {
    return "Try searching: Farm Transport services near you.";
  }
  if (text.includes("sell") || text.includes("price")) {
    return "Post your produce on the Marketplace and set your own price.";
  }
  return "Browse the Marketplace or Services section to get started.";
}
```

### Upgrade path (if time allows)
Integrate Gemini API (free tier) or OpenAI API for real natural language understanding.

---

## 11. Git Workflow

```bash
# Initialize repo
git init
git remote add origin https://github.com/YOUR_USERNAME/agriconnect-ke.git

# Daily workflow
git add .
git commit -m "feat: add produce listing route"
git push origin main

# Good commit message prefixes
feat:     new feature
fix:      bug fix
style:    CSS/UI changes
refactor: code restructure
docs:     documentation
```

### Branching (optional but good practice)
```bash
git checkout -b feature/auth
# work on auth
git checkout main
git merge feature/auth
```

---

## 12. Environment Setup

### `.env` file (NEVER commit this)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/agriconnect
JWT_SECRET=your_super_secret_key_here
```

### `.gitignore`
```
node_modules/
.env
uploads/
*.log
```

### Start script in `package.json`
```json
"scripts": {
  "start": "node backend/server.js",
  "dev": "nodemon backend/server.js"
}
```

### Run locally
```bash
npm run dev
# Visit: http://localhost:5000
```

---

## 13. Common Pitfalls

| Pitfall | How to avoid |
|---------|-------------|
| Forgetting to hash passwords | Always use `bcrypt.hash()` before saving |
| Committing `.env` | Always add it to `.gitignore` before first commit |
| CORS errors | Add `app.use(cors())` in server.js |
| Token not sent in requests | Always set `Authorization: Bearer <token>` header |
| Dashboard shows wrong role content | Check `user.role` from JWT payload |
| MongoDB not connecting | Check MONGO_URI in .env, ensure MongoDB is running |
| Running out of time | Finish MVP first, add AI/images only after core works |

---

## Quick Reference

```
Roles:    farmer | buyer | provider
Counties: Uasin Gishu | Nakuru | Nairobi | Meru | Kisumu | Eldoret
Produce:  Tomatoes | Maize | Potatoes | Onions | Beans | Cabbages
Services: Tractor Repair | Transport | Irrigation | Farm Labor
```

---

*Built with purpose. Built for Kenya.*
*Eldohub AI and Tech Academy — Final Project 2025*
