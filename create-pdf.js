const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument();
doc.pipe(fs.createWriteStream('IQZeen_User_Manual.pdf'));

doc.fontSize(24).text('IQZeen System: End-to-End User Manual', { align: 'center' });
doc.moveDown();

doc.fontSize(12).text('Welcome to the comprehensive guide for operating the IQZeen Restaurant Management System. This document contains all necessary links, credentials, and step-by-step instructions for demonstrating the platform.');
doc.moveDown();

doc.fontSize(18).text('Master Link Directory');
doc.moveDown();
doc.fontSize(14).text('Deployed Infrastructure');
doc.fontSize(12).text('- Frontend (Next.js): https://iqzeen.vercel.app');
doc.text('- Backend API (NestJS): https://iqzeen.onrender.com/api');
doc.moveDown();

doc.fontSize(14).text('Restaurant Dashboards');
doc.fontSize(12).text('- Login Portal: https://iqzeen.vercel.app/dashboard/login');
doc.moveDown();

doc.fontSize(14).text('S&A Cafe - Customer QR Links');
doc.fontSize(12).text('- Table 1: https://iqzeen.vercel.app/menu/sanda-table-1');
doc.text('- Table 2: https://iqzeen.vercel.app/menu/sanda-table-2');
doc.text('- Table 3: https://iqzeen.vercel.app/menu/sanda-table-3');
doc.text('- Table 4: https://iqzeen.vercel.app/menu/sanda-table-4');
doc.moveDown();

doc.fontSize(18).text('Master Credentials');
doc.fontSize(12).text('To access the Owner Terminal for S&A Cafe, use the following credentials:');
doc.text('- Email: owner@sanda.com');
doc.text('- Password: Sanda123!');
doc.moveDown();

doc.fontSize(18).text('End-to-End Demonstration Workflow');
doc.moveDown();

doc.fontSize(14).text('Step 1: Open the Owner Terminal (KDS)');
doc.fontSize(12).text('1. Go to the Login Portal.\n2. Log in using the S&A Cafe credentials.\n3. You are now looking at the Kitchen Display System (KDS). Leave this tab open.');
doc.moveDown();

doc.fontSize(14).text('Step 2: Simulate a Customer Scan');
doc.fontSize(12).text('1. Pull out your smartphone and navigate to Table 1\'s link.\n2. Explain that if multiple people scan the same QR code, their carts synchronize in real-time via WebSockets!');
doc.moveDown();

doc.fontSize(14).text('Step 3: Place an Order');
doc.fontSize(12).text('1. Browse the menu and add items to the cart.\n2. Proceed to checkout and confirm the order.');
doc.moveDown();

doc.fontSize(14).text('Step 4: Watch the Real-Time Sync');
doc.fontSize(12).text('1. Look back at the Owner Terminal tab.\n2. You will hear an audible ding, and the new order will instantly appear!');
doc.moveDown();

doc.fontSize(14).text('Step 5: Process the Order in the Kitchen');
doc.fontSize(12).text('1. Click START COOKING.\n2. Click MARK READY.\n3. Click MARK SERVED to log the transaction.');
doc.moveDown();

doc.fontSize(14).text('Step 6: View Analytics');
doc.fontSize(12).text('1. Navigate to the Analytics tab to show real-time revenue updates.\n2. Go to the Order History tab to show the permanent ledger.');

doc.end();
console.log('PDF generated successfully!');
