# IQZeen System: End-to-End User Manual

Welcome to the comprehensive guide for operating the IQZeen Restaurant Management System. This document contains all necessary links, credentials, and step-by-step instructions for demonstrating the platform.

## Master Link Directory

**Deployed Infrastructure**
*   **Frontend (Next.js):** https://iqzeen.vercel.app
*   **Backend API (NestJS):** https://iqzeen.onrender.com/api

**Restaurant Dashboards**
*   **Login Portal:** https://iqzeen.vercel.app/dashboard/login

**S&A Cafe - Customer QR Links**
*(Open these on your phone or in new browser tabs to simulate customers scanning QR codes)*
*   **Table 1:** https://iqzeen.vercel.app/menu/sanda-table-1
*   **Table 2:** https://iqzeen.vercel.app/menu/sanda-table-2
*   **Table 3:** https://iqzeen.vercel.app/menu/sanda-table-3
*   **Table 4:** https://iqzeen.vercel.app/menu/sanda-table-4

---

## Master Credentials

To access the Owner Terminal for S&A Cafe, use the following credentials:
*   **Email:** owner@sanda.com
*   **Password:** Sanda123!

---

## End-to-End Demonstration Workflow

Follow these steps to demonstrate the full power of the IQZeen platform during your presentation:

### Step 1: Open the Owner Terminal (KDS)
1. Go to the Login Portal.
2. Log in using the S&A Cafe credentials.
3. You are now looking at the **Kitchen Display System (KDS)**. Leave this tab open and visible on the screen.

### Step 2: Simulate a Customer Scan
1. Pull out your smartphone (or open a new browser window) and navigate to Table 1's link.
2. *Showcase feature:* Explain that the system recognizes this is Table 1. If multiple people scan the same QR code, their carts synchronize in real-time via WebSockets!

### Step 3: Place an Order
1. On the customer device, browse the Desi-themed menu.
2. Add a few items to the cart (e.g., Samosa Chaat, Mango Lassi).
3. Proceed to checkout and confirm the order.

### Step 4: Watch the Real-Time Sync
1. Immediately look back at the **Owner Terminal** tab.
2. You will hear an audible notification chime (ding!), and the new order will instantly appear in the **New Orders** column without refreshing the page!

### Step 5: Process the Order in the Kitchen
1. On the Owner Terminal, click **START COOKING**. The order moves to the orange column.
2. Click **MARK READY**. The order moves to the green column.
3. Click **MARK SERVED**. The order is removed from the KDS and logged in the database.

### Step 6: View Analytics
1. Navigate to the **Analytics** tab on the left sidebar.
2. Show how the Total Revenue, Total Orders, and Top Selling Items have automatically updated based on the order you just processed!
3. Navigate to the **Order History** tab to show the permanent ledger of the transaction.
