# Limited Edition Sneaker Drop - Real-Time Inventory System

A real-time inventory management system for limited edition sneaker drops. Users can browse live drops, reserve items (60-second hold), and complete purchases - all with instant stock sync across every connected browser.

**Live Demo:** [Frontend (Vercel)](https://traffic-inventory-system.vercel.app) | [Backend (Render)](https://traffic-inventory-system-1bxi.onrender.com)

**Video Demo:**

---

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Redux Toolkit (RTK Query), Socket.io-client
- **Backend:** Node.js, Express, TypeScript, Sequelize ORM, Socket.io
- **Database:** PostgreSQL (Neon for production)
- **Auth:** JWT + bcrypt

---

## How to Run the App

### Prerequisites

- Node.js
- PostgreSQL 16

### 1. Database Setup

```bash
psql -U postgres
CREATE DATABASE traffic_inventory_system;
\q
```

Sequelize auto-syncs all tables on server start (`sync({ alter: true })`), so no manual SQL schema is needed.

The tables created are:

- **users** — id, username, email, password, role
- **drops** — id, name, description, price, imageUrl, totalStock, availableStock, reservedStock, dropStartsAt, isActive
- **reservations** — id, userId, dropId, status (active/expired/completed), expiresAt
- **purchases** — id, userId, dropId, reservationId (unique)

### 2. Backend

```bash
cd traffic_inventory_system_backend
npm install
cp .env.example .env
# Edit .env - set your DATABASE_URL and JWT_ACCESS_SECRET
npm run start:dev
```

Runs on `http://localhost:5000`.

### 3. Frontend

```bash
cd traffic_inventory_system_frontend
npm install
cp .env.example .env
# Edit .env - set VITE_API_URL=http://localhost:5000
npm run dev
```

Runs on `http://localhost:5173`.

---

## Architecture Choice: 60-Second Reservation Expiration

When a user clicks "Reserve," the backend creates a reservation record with `expiresAt = now + 60 seconds` and immediately decrements `availableStock` by 1 (moves it to `reservedStock`).

**Expiry mechanism:** A server-side scheduler runs every 10 seconds, queries all reservations where `status = 'active' AND expiresAt < now()`, and for each:

1. Conditionally updates the reservation to `expired` (using `UPDATE ... WHERE status = 'active'` to avoid overriding a just-completed purchase)
2. Restores the stock: `availableStock + 1`, `reservedStock - 1`
3. Broadcasts `stock:update` and `reservation:expired` via WebSocket to all connected clients

This means every browser tab sees the stock return instantly - no page reload needed.

On the frontend, each reservation card shows a live countdown timer. If the user clicks "Complete Purchase" before time runs out, it succeeds. If the timer hits zero, the card shows "Expired" and the stock is already being returned by the backend scheduler.

---

## Concurrency: Preventing Overselling

The core problem: if 100 users click "Reserve" at the same millisecond for the last 1 item, only 1 should succeed.

**Solution - Atomic SQL update with a WHERE guard:**

```sql
UPDATE drops
SET available_stock = available_stock - 1,
    reserved_stock = reserved_stock + 1
WHERE id = :dropId
  AND available_stock > 0
  AND is_active = true
  AND drop_starts_at <= NOW();
```

This runs inside a PostgreSQL transaction. The `WHERE available_stock > 0` clause means only one concurrent request can decrement the last unit - all others get `affectedRows = 0` and receive a "sold out" response. PostgreSQL's row-level locking ensures this is safe even under heavy concurrency.

Additionally, the Drop row is locked with `SELECT ... FOR UPDATE` before checking for duplicate reservations from the same user, which prevents a race condition where one user could accidentally create two reservations for the same drop.

---

## WebSocket Events

All stock changes are broadcast in real-time via Socket.io to every connected browser:

- `stock:update` - sent whenever stock changes (reserve, expire, or purchase)
- `reservation:expired` - sent when the scheduler expires a reservation
- `purchase:completed` - sent when a user completes a purchase
- `drop:created` - sent when a new drop is added

Every connected browser receives these events instantly, so the dashboard updates live without polling or page reload.
