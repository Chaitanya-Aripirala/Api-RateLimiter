# Distributed API Rate Limiter System (Pro Backend)

A high-performance, production-ready backend infrastructure demonstrating advanced API rate limiting, audit logging, and security management.

## 🚀 Key Features

### 1. Multi-Algorithm Rate Limiting
- **Fixed Window**: Strict bucketed limiting.
- **Sliding Window**: Precision rolling window via Redis Sorted Sets.
- **Token Bucket**: Burst-capable steady refill system.
- **Leaky Bucket**: Constant-rate metering for perfectly steady throughput.

### 2. Distributed Architecture
- Powered by **Redis** to ensure rate limit consistency across multiple server instances.
- **MongoDB** integration for persistent request logging and audit trails.

### 3. Integrated Business Logic
- Full **User CRUD** (Signup, Signin, Profile Mgmt).
- Full **Product CRUD** (Inventory Management).
- Different rate limiters applied strategically to different routes (e.g., Strict Fixed Window for Auth, Leaky Bucket for DB writes).

### 4. Advanced Analytics & Admin Tools
- **Real-time Stats**: `/api/stats` endpoint for Allowed vs. Blocked aggregation.
- **Audit Logs**: `/api/logs` with pagination and filtering support.
- **IP Blacklisting**: Global middleware to block/unblock malicious IPs in real-time via Redis.

---

## 🛠️ Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **State Store**: Redis (ioredis)
- **Database**: MongoDB (Mongoose)
- **Logging**: Morgan & Custom Winston-style Logger

## 📥 Installation

1. **Clone & Install**:
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration**:
   Update `.env` with your credentials:
   ```env
   PORT=4000
   MONGO_URL=your_mongo_url
   REDIS_URL=your_redis_url
   RATE_LIMIT=100
   WINDOW_SIZE=60000
   ```

3. **Start Development**:
   ```bash
   npm run dev
   ```

## 🧪 Testing with `req.http`
A comprehensive REST testing file is included at the root. You can:
1. Test each algorithm individually.
2. Verify User/Product CRUD with active rate limiting.
3. Manage the **IP Blacklist** manually.
4. Fetch **Analytics Stats** and **Audit Logs**.

## 🏗️ Architecture
```text
backend/
├── config/             # DB & Redis Connections
├── controllers/        # Business Logic (User, Product, API)
├── middlewares/        # Rate Limiting & Security (Blacklist)
├── models/             # MongoDB Schemas (User, Product, Log)
├── routes/             # Route Definitions
├── utils/              # Logger & Helpers
└── req.http            # Full Integration Test Suite
```

## 🔒 Security Note
This system uses **Identity-Based (User ID) limiting**. This ensures that rate limits are strictly tied to a user's account, preventing "noisy neighbor" issues and making it much harder for attackers to bypass limits by rotating IP addresses. Admin features like the **Global Blacklist** still support IP-based blocking for infrastructure protection.
