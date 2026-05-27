const pptxgen = require('pptxgenjs');

async function createPresentation() {
  let pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';

  const themeColors = {
    bg: '0A0A0A',
    textPrimary: 'FFFFFF',
    textSecondary: 'A0AEC0',
    accent1: 'F59E0B', // Amber
    accent2: 'EA580C', // Orange
    boxBg: '151515',
    boxBorder: '333333'
  };

  pptx.defineSlideMaster({
    title: 'MASTER_DARK',
    background: { color: themeColors.bg },
    objects: [
      { rect: { x: 0, y: 0, w: '100%', h: '0.2', fill: { color: themeColors.accent1 } } },
      { text: { text: 'IQZeen Systems', options: { x: 0.5, y: 6.9, w: 3, h: 0.5, fontSize: 10, color: themeColors.textSecondary, fontFace: 'Segoe UI' } } },
      { text: { text: 'Presented by Iqra Zeenat', options: { x: 9.0, y: 6.9, w: 4, h: 0.5, fontSize: 10, color: themeColors.textSecondary, align: 'right', fontFace: 'Segoe UI' } } }
    ]
  });

  // Slide 1: Title
  let slide1 = pptx.addSlide({ masterName: 'MASTER_DARK' });
  slide1.addShape(pptx.ShapeType.rect, { x: 0, y: 3, w: '100%', h: 2, fill: { color: '111111' } });
  slide1.addText('IQZeen', { x: 0, y: 3.2, w: '100%', h: 1, align: 'center', fontSize: 64, fontFace: 'Segoe UI Black', color: themeColors.accent1 });
  slide1.addText('Next-Generation Restaurant Management System', { x: 0, y: 4.2, w: '100%', h: 0.5, align: 'center', fontSize: 24, fontFace: 'Segoe UI', color: themeColors.textPrimary });
  slide1.addText('Developed & Presented by:\nIqra Zeenat', { x: 0, y: 5.5, w: '100%', h: 1, align: 'center', fontSize: 18, fontFace: 'Segoe UI', color: themeColors.textSecondary });

  // Slide 2: The Problem
  let slide2 = pptx.addSlide({ masterName: 'MASTER_DARK' });
  slide2.addText('The Problem in Modern Dining', { x: 0.5, y: 0.5, w: 10, h: 1, fontSize: 36, fontFace: 'Segoe UI Bold', color: themeColors.textPrimary });
  slide2.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.5, w: 1.5, h: 0.05, fill: { color: themeColors.accent2 } });
  
  slide2.addText([
    { text: 'Traditional restaurants suffer from massive inefficiencies:\n\n', options: { fontSize: 20, color: themeColors.textPrimary } },
    { text: '• Slow Ordering: Waiting for waiters causes delays and frustration.\n', options: { fontSize: 18, color: themeColors.textSecondary } },
    { text: '• Disconnected Kitchens: Paper tickets get lost, causing order errors.\n', options: { fontSize: 18, color: themeColors.textSecondary } },
    { text: '• Poor Analytics: Owners lack real-time data to make smart business decisions.\n', options: { fontSize: 18, color: themeColors.textSecondary } },
    { text: '• Messy Group Dining: Friends struggle to combine orders into one table bill.', options: { fontSize: 18, color: themeColors.textSecondary } }
  ], { x: 0.5, y: 2.0, w: 11, h: 4, fontFace: 'Segoe UI' });

  // Slide 3: The Solution (IQZeen)
  let slide3 = pptx.addSlide({ masterName: 'MASTER_DARK' });
  slide3.addText('Our Solution: IQZeen', { x: 0.5, y: 0.5, w: 10, h: 1, fontSize: 36, fontFace: 'Segoe UI Bold', color: themeColors.textPrimary });
  slide3.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.5, w: 1.5, h: 0.05, fill: { color: themeColors.accent1 } });
  
  slide3.addShape(pptx.ShapeType.rect, { x: 0.5, y: 2, w: 3.5, h: 4, fill: { color: themeColors.boxBg }, line: { color: themeColors.boxBorder } });
  slide3.addText('Scan & Order', { x: 0.5, y: 2.5, w: 3.5, h: 0.5, align: 'center', fontSize: 22, fontFace: 'Segoe UI Bold', color: themeColors.accent1 });
  slide3.addText('QR-based digital menus for zero-wait ordering.', { x: 0.8, y: 3.2, w: 2.9, h: 2, align: 'center', fontSize: 16, fontFace: 'Segoe UI', color: themeColors.textSecondary });

  slide3.addShape(pptx.ShapeType.rect, { x: 4.5, y: 2, w: 3.5, h: 4, fill: { color: themeColors.boxBg }, line: { color: themeColors.boxBorder } });
  slide3.addText('Group Sync', { x: 4.5, y: 2.5, w: 3.5, h: 0.5, align: 'center', fontSize: 22, fontFace: 'Segoe UI Bold', color: themeColors.accent1 });
  slide3.addText('WebSockets sync all phones at the same table in real-time.', { x: 4.8, y: 3.2, w: 2.9, h: 2, align: 'center', fontSize: 16, fontFace: 'Segoe UI', color: themeColors.textSecondary });

  slide3.addShape(pptx.ShapeType.rect, { x: 8.5, y: 2, w: 3.5, h: 4, fill: { color: themeColors.boxBg }, line: { color: themeColors.boxBorder } });
  slide3.addText('Live KDS', { x: 8.5, y: 2.5, w: 3.5, h: 0.5, align: 'center', fontSize: 22, fontFace: 'Segoe UI Bold', color: themeColors.accent1 });
  slide3.addText('Orders instantly appear on the Kitchen Display System without refreshing.', { x: 8.8, y: 3.2, w: 2.9, h: 2, align: 'center', fontSize: 16, fontFace: 'Segoe UI', color: themeColors.textSecondary });

  // Slide 4: Tech Stack
  let slide4 = pptx.addSlide({ masterName: 'MASTER_DARK' });
  slide4.addText('Technology Stack', { x: 0.5, y: 0.5, w: 10, h: 1, fontSize: 36, fontFace: 'Segoe UI Bold', color: themeColors.textPrimary });
  slide4.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.5, w: 1.5, h: 0.05, fill: { color: themeColors.accent2 } });
  
  // Left side list
  slide4.addText([
    { text: 'Frontend:\n', options: { fontSize: 22, fontFace: 'Segoe UI Bold', color: themeColors.accent1 } },
    { text: 'Next.js 15, React 19, Tailwind CSS, Lucide Icons\n\n', options: { fontSize: 18, color: themeColors.textSecondary } },
    { text: 'Backend:\n', options: { fontSize: 22, fontFace: 'Segoe UI Bold', color: themeColors.accent1 } },
    { text: 'NestJS (Node.js framework), Socket.io\n\n', options: { fontSize: 18, color: themeColors.textSecondary } },
    { text: 'Database & ORM:\n', options: { fontSize: 22, fontFace: 'Segoe UI Bold', color: themeColors.accent1 } },
    { text: 'PostgreSQL (hosted on Supabase), Prisma ORM\n\n', options: { fontSize: 18, color: themeColors.textSecondary } },
    { text: 'Deployment:\n', options: { fontSize: 22, fontFace: 'Segoe UI Bold', color: themeColors.accent1 } },
    { text: 'Vercel (Frontend) & Render (Backend API)', options: { fontSize: 18, color: themeColors.textSecondary } }
  ], { x: 0.5, y: 2.0, w: 7, h: 4, fontFace: 'Segoe UI' });

  // Right side architecture box
  slide4.addShape(pptx.ShapeType.rect, { x: 8, y: 2.5, w: 4, h: 3, fill: { color: themeColors.boxBg }, line: { color: themeColors.accent1, dashType: 'dash' } });
  slide4.addText('Microservice Architecture\n\nClient <--> Next.js\nNext.js <--> NestJS API\nNestJS <--> PostgreSQL\nWebSockets for Real-time events', { x: 8, y: 2.5, w: 4, h: 3, align: 'center', fontSize: 16, fontFace: 'Segoe UI', color: themeColors.textPrimary });

  // Slide 5: Customer Menu Experience
  let slide5 = pptx.addSlide({ masterName: 'MASTER_DARK' });
  slide5.addText('Customer View: Digital Menu', { x: 0.5, y: 0.5, w: 10, h: 1, fontSize: 36, fontFace: 'Segoe UI Bold', color: themeColors.textPrimary });
  slide5.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.5, w: 1.5, h: 0.05, fill: { color: themeColors.accent1 } });
  slide5.addText('Features: High-quality imagery, glassmorphic UI, real-time shared cart.', { x: 0.5, y: 1.8, w: 10, h: 0.5, fontSize: 16, fontFace: 'Segoe UI', color: themeColors.textSecondary });
  
  slide5.addShape(pptx.ShapeType.rect, { x: 2, y: 2.5, w: 8, h: 4, fill: { color: '333333' }, line: { color: themeColors.accent1, width: 2, dashType: 'dash' } });
  slide5.addText('📸 DRAG & DROP MENU SCREENSHOT HERE', { x: 2, y: 2.5, w: 8, h: 4, align: 'center', fontSize: 24, fontFace: 'Segoe UI Bold', color: '888888' });

  // Slide 6: Owner Dashboard (KDS)
  let slide6 = pptx.addSlide({ masterName: 'MASTER_DARK' });
  slide6.addText('Owner Terminal: Kitchen Display System', { x: 0.5, y: 0.5, w: 10, h: 1, fontSize: 36, fontFace: 'Segoe UI Bold', color: themeColors.textPrimary });
  slide6.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.5, w: 1.5, h: 0.05, fill: { color: themeColors.accent2 } });
  slide6.addText('Features: Live order synchronization, Kanban-style status tracking.', { x: 0.5, y: 1.8, w: 10, h: 0.5, fontSize: 16, fontFace: 'Segoe UI', color: themeColors.textSecondary });
  
  slide6.addShape(pptx.ShapeType.rect, { x: 2, y: 2.5, w: 8, h: 4, fill: { color: '333333' }, line: { color: themeColors.accent2, width: 2, dashType: 'dash' } });
  slide6.addText('📸 DRAG & DROP KDS SCREENSHOT HERE', { x: 2, y: 2.5, w: 8, h: 4, align: 'center', fontSize: 24, fontFace: 'Segoe UI Bold', color: '888888' });

  // Slide 7: Business Analytics
  let slide7 = pptx.addSlide({ masterName: 'MASTER_DARK' });
  slide7.addText('Business Analytics & Reporting', { x: 0.5, y: 0.5, w: 10, h: 1, fontSize: 36, fontFace: 'Segoe UI Bold', color: themeColors.textPrimary });
  slide7.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.5, w: 1.5, h: 0.05, fill: { color: themeColors.accent1 } });
  slide7.addText('Features: Revenue tracking, order history ledger, top selling items visualizer.', { x: 0.5, y: 1.8, w: 10, h: 0.5, fontSize: 16, fontFace: 'Segoe UI', color: themeColors.textSecondary });
  
  slide7.addShape(pptx.ShapeType.rect, { x: 2, y: 2.5, w: 8, h: 4, fill: { color: '333333' }, line: { color: themeColors.accent1, width: 2, dashType: 'dash' } });
  slide7.addText('📸 DRAG & DROP ANALYTICS SCREENSHOT HERE', { x: 2, y: 2.5, w: 8, h: 4, align: 'center', fontSize: 24, fontFace: 'Segoe UI Bold', color: '888888' });

  // Slide 8: Future Enhancements
  let slide8 = pptx.addSlide({ masterName: 'MASTER_DARK' });
  slide8.addText('Future Enhancements', { x: 0.5, y: 0.5, w: 10, h: 1, fontSize: 36, fontFace: 'Segoe UI Bold', color: themeColors.textPrimary });
  slide8.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.5, w: 1.5, h: 0.05, fill: { color: themeColors.accent2 } });
  
  slide8.addText([
    { text: '• AI-Powered Recommendations: Suggesting sides and drinks based on ML models.\n', options: { fontSize: 20, color: themeColors.textPrimary } },
    { text: '• Integrated Payment Gateways: Direct checkout via Stripe/Razorpay on phone.\n', options: { fontSize: 20, color: themeColors.textPrimary } },
    { text: '• Inventory Management: Auto-deducting stock when dishes are ordered.\n', options: { fontSize: 20, color: themeColors.textPrimary } },
    { text: '• Waiter Call Button: Notifying staff via smartwatches instantly.', options: { fontSize: 20, color: themeColors.textPrimary } }
  ], { x: 0.5, y: 2.5, w: 11, h: 4, fontFace: 'Segoe UI' });

  // Slide 9: Thank You
  let slide9 = pptx.addSlide({ masterName: 'MASTER_DARK' });
  slide9.addText('Thank You!', { x: 0, y: 2.5, w: '100%', h: 1, align: 'center', fontSize: 64, fontFace: 'Segoe UI Bold', color: themeColors.textPrimary });
  slide9.addText('Live Demo: iqzeen.vercel.app', { x: 0, y: 4, w: '100%', h: 1, align: 'center', fontSize: 24, fontFace: 'Segoe UI', color: themeColors.accent1 });

  await pptx.writeFile({ fileName: 'IQZeen_Presentation.pptx' });
  console.log('Presentation generated successfully: IQZeen_Presentation.pptx');
}

createPresentation().catch(err => {
  console.error('Failed to generate presentation', err);
});
