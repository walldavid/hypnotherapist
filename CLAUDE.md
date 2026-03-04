# CLAUDE.md — Hypnotherapist E-commerce Platform

Project for **www.hypnotherapist.ie** — a full-stack e-commerce platform selling digital hypnotherapy products (audio files, courses, PDFs, bundles).

## Project Structure

Monorepo with two packages:

```
hypnotherapist/
├── client/          # React 18 frontend (Vite, port 3000 in dev)
├── server/          # Express 5 backend API (port 5001 in dev, 8080 in prod)
├── scripts/         # Deployment scripts (deploy.sh)
├── images/          # Static image assets
├── Dockerfile       # Multi-stage Docker build for Cloud Run
├── .dockerignore
├── ADMIN_SETUP.md
└── README.md
```

## Tech Stack

**Frontend** (`client/`)
- React 18, React Router DOM 6, Vite
- Axios for HTTP, React Toastify for notifications
- Context API for state (CartContext, AdminContext)

**Backend** (`server/`)
- Node.js / Express 5
- **Google Cloud Firestore** (replaced MongoDB/Mongoose)
- JWT authentication (admin only), Bcrypt password hashing
- Stripe + PayPal payment processing
- Google Cloud Storage (GCS) for digital file uploads
- Nodemailer for transactional email
- Helmet, CORS, express-rate-limit for security

**Deployment**: Google Cloud Run (containerised, auto-scaling)

**Testing**: Jest + Supertest (server-side only)

## Development Commands

```bash
# From repo root
npm run dev           # Start client (port 3000) + server (port 5001) concurrently
npm run build         # Build React frontend → client/dist
npm run client        # Frontend only
npm run server        # Backend only (nodemon)
npm run install-all   # Install all dependencies across monorepo
npm run deploy        # Deploy to Cloud Run (requires GCP_PROJECT_ID env var)

# From server/
npm run test          # Run Jest test suite
npm run test:watch    # Jest watch mode
npm run test:coverage # Jest with coverage
npm run create-admin  # Create an admin user in Firestore
npm run seed:hypnosis-page  # Seed CMS page content
```

## Key Architecture Decisions

- **Vite dev proxy**: All `/api/*` requests from the client proxy to `http://localhost:5001`
- **Production**: Express serves the built React app from `client/dist`; single Cloud Run service
- **Database**: Google Cloud Firestore — no Mongoose, no MongoDB
- **Firestore collections**: `products`, `orders`, `admins`, `users`, `pages`, `downloadTokens`
- **Download tokens**: Stored in `downloadTokens` collection (doc ID = token) for O(1) lookup; also embedded in order document for display
- **Admin auth**: JWT-only (shoppers identified by email on order; no shopper accounts)
- **File storage**: Google Cloud Storage (signed URLs for downloads)
- **Rate limiting**: 100 req/15min general, 5 login attempts/15min, 50 downloads/hour
- **Env loading**: `require('dotenv').config({ path: '.env.{NODE_ENV}' })` — separate files for dev/prod

## Environment Setup

| File | Use |
|---|---|
| `server/.env.development` | Local dev — Firestore emulator, test payment keys |
| `server/.env.production` | Reference/docs only — real secrets set in Cloud Run |
| `server/.env.example` | Template to copy from |

Key env vars:
- `FIRESTORE_PROJECT_ID` — GCP project ID
- `FIRESTORE_EMULATOR_HOST` — set to `localhost:8080` for local Firestore emulator (dev only)
- `JWT_SECRET`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_MODE`
- `GCS_PROJECT_ID`, `GCS_BUCKET_NAME`, `GCS_KEY_FILE` (dev only; prod uses ADC)
- Email SMTP config
- `CLIENT_URL` — Vite dev URL in dev; Cloud Run URL in production

In production on Cloud Run, GCS and Firestore use **Application Default Credentials** — no key file needed.

## API Route Groups

| Prefix | Purpose |
|---|---|
| `/api/health` | Health check |
| `/api/products` | Product CRUD + search |
| `/api/admin` | Admin login + management |
| `/api/orders` | Order creation + retrieval |
| `/api/payment` | Stripe/PayPal webhooks |
| `/api/downloads` | Time-limited download links |
| `/api/pages` | CMS page content |

## Firestore Collections

| Collection | Doc ID | Notes |
|---|---|---|
| `products` | Auto-ID | status, category, files[], images[], ratings |
| `orders` | Auto-ID | orderNumber field, customerEmail, items[], downloads[] |
| `admins` | Auto-ID | username/email unique enforced in code, bcrypt password |
| `users` | email (encoded) | Purchase history, totalSpent |
| `pages` | slug | CMS pages — slug is the doc ID for direct lookup |
| `downloadTokens` | token string | Lookup index for download validation |

## Server Directory Layout

```
server/
├── collections/    # Firestore collection helpers (replaces models/)
│   ├── products.js
│   ├── orders.js   # also handles downloadTokens collection
│   ├── admins.js
│   ├── users.js
│   └── pages.js
├── controllers/    # Route handlers
├── middleware/     # auth.js (JWT), upload.js (Multer), sanitize.js, errorHandler.js
├── lib/
│   └── db.js       # Firestore client singleton
├── routes/         # Express route definitions
├── services/       # stripeService, paypalService, emailService, gcsService
├── config/         # App configuration (GCS key file in dev)
├── scripts/        # createAdmin.js, seed scripts
├── tests/          # Jest test suite
└── server.js       # Entry point
```

## Deployment

```bash
# One-time setup
export GCP_PROJECT_ID=your-project-id

# Deploy
npm run deploy   # runs scripts/deploy.sh
```

The deploy script:
1. Builds a multi-stage Docker image (React build → Node production server)
2. Pushes to Google Container Registry via Cloud Build
3. Deploys to Cloud Run (`europe-west1`)
4. Prints the service URL and next steps

Post-deploy: set sensitive env vars in Cloud Run console or via `gcloud run services update`.

## Frontend Page Map

| Route | Component | Notes |
|---|---|---|
| `/` | `Home.jsx` | Hero section with banner image |
| `/products` | `Products.jsx` | Catalog with search/filter |
| `/products/:id` | `ProductDetail.jsx` | Product detail |
| `/cart` | `Cart.jsx` | Sticky summary design |
| `/checkout` | `Checkout.jsx` | Stripe + PayPal flow |
| `/download/:token` | `Download.jsx` | Digital download page |
| `/hypnosis-help` | `HypnosisHelp.jsx` | CMS-editable content page |
| `/admin` | `AdminLogin.jsx` | Admin login |
| `/admin/dashboard` | `Dashboard.jsx` | Stats overview |
| `/admin/products` | `ProductsManager.jsx` | Product CRUD |
| `/admin/orders` | `OrdersManager.jsx` | Order management |

## Coding Conventions

- JavaScript (no TypeScript) across the entire codebase
- React functional components with hooks (no class components)
- CommonJS (`require`/`module.exports`) in the server
- ESM imports in the client
- No CSS framework — custom CSS in `client/src/styles/`
- Collection helpers in `server/collections/` replace Mongoose models; they export plain async functions (no classes)

## Setup Docs

- `ADMIN_SETUP.md` — creating admin users
- `server/GCS_SETUP.md` — Google Cloud Storage
- `server/PAYMENT_SETUP.md` — Stripe and PayPal
- `server/EMAIL_SETUP.md` — email service configuration
- `server/SECURITY.md` — security considerations
- `server/TEST_REPORT.md` — test coverage details
