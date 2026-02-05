# 🚀 Express Backend Toolkit
![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat-square&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=flat-square&logo=stripe&logoColor=white)

A **production-ready backend boilerplate** built with **Express 5 + TypeScript**, following a **modular & scalable architecture**.  
Designed for learning, rapid development, and real-world backend systems.

This project focuses on **clean architecture**, **separation of concerns**, and **enterprise-like structure**.

---

## ✨ Key Features

### 🔐 Authentication & Authorization
- **JWT Authentication**: Access Token & Refresh Token
- **OAuth 2.0**: Login with **Google** & **LinkedIn**
- **Security**: Password hashing, Helmet, CORS, Rate Limiting
- **Verification**: Email verification & Secure Password Reset flow
- **RBAC**: Role-based access control (User/Admin/Moderator)

### 💳 Payment System
- **Unified Payment Interface**: Strategy Pattern to switch between providers easily
- **Stripe**: Checkout Sessions & Webhook handling
- **VNPay**: Integrated domestic payment gateway (Vietnam)
- **Transaction Tracking**: Full audit log of payment statuses
- **Idempotency**: Prevents duplicate processing of webhooks

### 📦 Order Management
- **Order System**: Create, track, and update orders linked with payments
- **User System**: Profile management, avatar upload, secure phone number updates

### 🛡 Advanced Security (New)
- **HTTP Headers**: Secured with **Helmet** (Hiding `X-Powered-By`, HSTS, XSS Filter, NoSniff)
- **Parameter Pollution**: Protected against HPP attacks (ex: `?id=1&id=2`)
- **Advanced CORS**: Dynamic whitelist origin checking & Credentials support
- **Rate Limiting**: Built-in protection against brute-force and DDoS
- **Request Tracing**: **Correlation ID (Trace ID)** attached to every request and log for better debugging

### 🚀 Infrastructure & Performance
- **Caching**: Redis integration for high-performance data retrieval (@Cacheable decorator)
- **Health Checks**: `/health` endpoint monitoring DB, Redis, and 3rd-party services
- **Notifications**: Database-stored notifications system
- **File Storage**: Cloudinary integration with Multer middleware
- **Mail Service**: SMTP with reusable templates
- **Logging**: Centralized logging system

---

## 🧱 Module-Based Architecture

```bash
src
├── core                # Shared infrastructure
│   ├── cache           # Redis wrapper & decorators
│   ├── config          # Zod-validated environment & Security configs
│   ├── constants       # System constants & Enums
│   ├── database        # Mongoose connection & BaseRepository
│   ├── errors          # Custom Error classes & Handler
│   ├── http            # Standard Response & Pagination tools
│   ├── logger          # Logger setup
│   ├── mail            # SMTP Service
│   ├── middlewares     # AsyncHandler, Auth, Upload, Validate, RateLimit, RequestID
│   ├── security        # JWT, Hash, Passport strategies
│   ├── storage         # Cloudinary storage engine
│   └── utils           # Helpers (Nanoid, Slug, Sleep)
│
├── modules             # Business Logic Domains
│   ├── auth            # Login, Register, OAuth, Reset Pass
│   ├── user            # User CRUD, Profile
│   ├── order           # Order management
│   ├── payment         # Stripe/VNPay logic, Webhooks, Transaction Log
│   ├── notification    # Notification system
│   └── health          # Health check endpoints
│
├── app.route.ts        # Main Router Hub
└── server.ts           # Entry point
```

## 🛠 Tech Stack
|Category|Technologies|
|:-:|:-:|
| Core | Node.js, Express 5, TypeScript |
| Database | MongoDB, Redis |
| Auth | JWT, Passport, Bcrypt |
| Validation | Zod (Schema & Env Validation) |
| Security | Helmet, HPP, Cors, Express-Rate-Limit |
| Payments | Stripe SDK, VNPay Integration |
| Uploads | Multer, Cloudinary |
| DevOps | Docker, Docker Compose |

---

## 📌 Design Patterns Used
- **Repository Pattern**: Abstracting DB operations (BaseRepository) to keep business logic clean
- **Factory Pattern**: PaymentManager selects the correct payment provider (Stripe/VNPay) at runtime
- **Strategy Pattern**: IPaymentGateway ensures all payment providers implement the same methods
- **Decorator Pattern**: @Cacheable for transparent Redis caching
- **Singleton**: Database connections and Service instances

## 🧪 Future Improvements
- Unit tests (Jest)
- Integration tests
- Role-based access control
- Refresh token flow
- Message queue (RabbitMQ / Kafka)
- API documentation (Swagger)


## ⚙️ Environment Variables

Create a `.env` file:

```env
# --- App Config ---
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
SERVER_URL=http://localhost:5000

# --- Database ---
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/your-db
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_PREFIX=express-toolkit:

# --- Security ---
API_KEY=your_internal_api_key
ACCESS_TOKEN_SECRET=your_super_secret_access_key
REFRESH_TOKEN_SECRET=your_super_secret_refresh_key
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# --- Cloudinary ---
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# --- OAuth ---
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=/api/v1/auth/google/callback

LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_CALLBACK_URL=/api/v1/auth/linkedin/callback

# --- Email ---
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# --- Payments ---
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_API_VERSION=2024-04-10

# VNPay (Sandbox)
VNP_TMN_CODE=your_tmn_code
VNP_HASH_SECRET=your_hash_secret
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://localhost:5000/api/v1/payments/vnpay-return
```

## ▶️ How To Run
```bash
npm install
npm run dev
npm run build
npm run start
```

## 🐳 Run with Docker
```bash
# Build and start services
docker-compose up --build

# Stop services
docker-compose down
```

## 📬 Contact
- Email: hodtduy.work@gmail.com
- Linked In: [hodangthaiduy](https://www.linkedin.com/in/duy-ho-dang-thai-a33159383/)  

---
### Thank you for checking this project!
Happy coding 💻
