# 🚀 IQZEEN - Premium Smart Restaurant Ecosystem

IQZEEN is a state-of-the-art, real-time contactless dining platform designed to modernize the restaurant experience. From a stunning customer-facing mobile QR menu to an iPad-optimized dark-mode **Kitchen Display System (KDS)** and a comprehensive **Global Admin command center**, IQZEEN provides a complete full-stack solution for modern restaurants.

---

## 🔗 Live Production Links

*   **Frontend Web App (Vercel):** [https://iqzeen.vercel.app](https://iqzeen.vercel.app)
*   **Admin Portal (Vercel):** [https://iqzeen.vercel.app/admin](https://iqzeen.vercel.app/admin)
*   **Backend Server API (Render):** [https://iqzeen.onrender.com](https://iqzeen.onrender.com)
*   **Database (Supabase PostgreSQL):** Active & synced with schema.

---

## ✨ Key Features

### 1. 📱 Customer QR Menu (Mobile-Optimized)
*   **Fast, Slick UI:** Curated restaurant branding, smooth transitions, and a premium card layout.
*   **Instant Cart Management:** Select variants, add customizations, and review items.
*   **QR-code Bound:** Orders are instantly mapped to the specific dining table.

### 2. 🖥️ Owner Dashboard & KDS (Dark Mode)
*   **Interactive Kanban Board:** Real-time order flow with gorgeous neon indicator borders (Red for *New*, Amber for *Cooking*, Green for *Ready*).
*   **Audio Alerts:** Sound notifications trigger instantly in the kitchen when a new order arrives.
*   **QR Studio Pro:** A custom QR designer allowing owners to customize frame color, QR accents, and print custom uppercase table overlays.
*   **Menu Manager:** Turn items "Out of Stock" instantly with a single toggle.

### 3. 🛡️ Global Admin Command Center
*   **COMMAND Dashboard:** Sleek glassmorphic cards tracking metrics, active restaurants, and system usage.
*   **Slide-out Form Overlays:** Register new restaurants, configure slugs, contact details, UPI bank details for payments, WhatsApp, and FSSAI credentials on the fly.

---

## 🛠️ Technology Stack

*   **Frontend:** Next.js, React, Tailwind CSS, Lucide icons.
*   **Backend:** NestJS (TypeScript), Socket.IO (WebSockets for real-time notifications).
*   **Database & ORM:** PostgreSQL (hosted on **Supabase**), Prisma ORM.

---

## 💻 Local Development Setup

### Prerequisites
*   Node.js (v18+)
*   NPM or Yarn
*   A running PostgreSQL instance (or Supabase)

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory:
   ```env
   DATABASE_URL="postgresql://postgres:IqzeenProjectPass123!@db.rhzdjyjpjxgfubbytjwi.supabase.co:5432/postgres"
   PORT=3001
   JWT_SECRET="your-super-secret-key"
   ```
4. Push the database schema:
   ```bash
   npx prisma db push
   ```
5. Start the development server:
   ```bash
   npm run start:dev
   ```

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend/` directory:
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:3001/api"
   NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
   NEXT_PUBLIC_FRONTEND_URL="http://localhost:3000"
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser and go to `http://localhost:3000/admin` to set up your local restaurant.

---

## 🚀 Production Deployment Reference

### Backend Configuration (Render / Railway)
*   **Root Directory:** `backend`
*   **Build Command:** `npm install && npx prisma generate && npm run build`
*   **Start Command:** `npm run start:prod`
*   **Env Variables:** `DATABASE_URL`

### Frontend Configuration (Vercel)
*   **Root Directory:** `frontend`
*   **Build Command:** `npm run build`
*   **Output Directory:** `.next`
*   **Env Variables:**
    *   `NEXT_PUBLIC_API_URL` ➡️ `https://iqzeen.onrender.com/api`
    *   `NEXT_PUBLIC_SOCKET_URL` ➡️ `https://iqzeen.onrender.com`
    *   `NEXT_PUBLIC_FRONTEND_URL` ➡️ `https://iqzeen.vercel.app`
