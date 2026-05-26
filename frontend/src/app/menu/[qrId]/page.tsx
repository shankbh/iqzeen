'use client';

import { use, useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  ShoppingCart, Plus, Minus, X, ChevronRight, CheckCircle,
  MessageCircle, CreditCard, Loader2, Utensils, Sparkles,
  Leaf, Users, Gift, Clock, RefreshCw, Cloud,
} from 'lucide-react';
import { MoodWizard } from '@/components/MoodWizard';
import {
  fetchWeather, getRecommendations, applyDietFilter, saveLastOrder, getLastOrder,
  WeatherData, MoodProfile, DietFilter, MenuItem as MenuItemType,
} from '@/lib/recommendations';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Category { id: string; name: string; order: number; }
interface CartItem { item: MenuItemType; quantity: number; addedBy: string; addedByName: string; }
interface Restaurant { id: string; name: string; phone: string | null; address: string | null; upiId: string | null; whatsappNumber: string | null; }
interface Table { id: string; tableNumber: string; restaurantId: string; }
interface PlacedOrder { id: string; totalAmount: number; status: string; }
interface PaymentDetails {
  orderId: string; amount: number; upiLink: string | null; whatsappLink: string | null;
  billSummary: { items: { name: string; qty: number; price: number; subtotal: number }[]; total: number; };
}
interface GiftNotif { fromTable: string; itemName: string; message: string; }

// ─── Constants ──────────────────────────────────────────────────────────────────
const API = 'http://localhost:3001/api';
const SOCKET_URL = 'http://localhost:3001';

const FOOD_IMAGES: Record<string, string> = {
  'spring rolls':        'https://images.unsplash.com/photo-1606755456206-b25206cde27e?w=500&q=80&auto=format&fit=crop',
  'garlic bread':        'https://images.unsplash.com/photo-1619535860434-cf9b902f6c3f?w=500&q=80&auto=format&fit=crop',
  'butter chicken':      'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&q=80&auto=format&fit=crop',
  'paneer tikka masala': 'https://images.unsplash.com/photo-1631452180519-a6e18c88ac47?w=500&q=80&auto=format&fit=crop',
  'mango lassi':         'https://images.unsplash.com/photo-1620421680010-0766ff230392?w=500&q=80&auto=format&fit=crop',
  'iced tea':            'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&q=80&auto=format&fit=crop',
};
const FALLBACK = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80&auto=format&fit=crop';
const CAT_ICONS: Record<string, string> = {
  'appetizers': '🥗', 'starters': '🥗', 'soups': '🍲',
  'main course': '🍛', 'mains': '🍛', 'biryani': '🍚',
  'beverages': '🥤', 'drinks': '🥤', 'desserts': '🍮', 'breads': '🫓',
};
const NON_VEG_WORDS = ['chicken', 'fish', 'prawn', 'mutton', 'beef', 'pork', 'egg', 'meat', 'lamb'];

// ─── Helpers ────────────────────────────────────────────────────────────────────
const inr = (n: number) => '₹' + n.toLocaleString('en-IN');
const isVeg = (name: string) => !NON_VEG_WORDS.some(w => name.toLowerCase().includes(w));
const catIcon = (name: string) => CAT_ICONS[name.toLowerCase()] ?? '🍽️';
const imgFor = (item: MenuItemType) => item.imageUrl ?? FOOD_IMAGES[item.name.toLowerCase()] ?? FALLBACK;
const getUserId = () => {
  if (typeof window === 'undefined') return 'server';
  let id = localStorage.getItem('zeen-uid');
  if (!id) { id = `Guest ${Math.floor(Math.random() * 90) + 10}`; localStorage.setItem('zeen-uid', id); }
  return id;
};
const DIET_LABELS: { key: DietFilter; label: string; emoji: string }[] = [
  { key: 'veg', label: 'Veg Only', emoji: '🌱' },
  { key: 'jain', label: 'Jain', emoji: '🙏' },
  { key: 'gluten-free', label: 'Gluten-Free', emoji: '🌾' },
  { key: 'dairy-free', label: 'Dairy-Free', emoji: '🥛' },
];

// ─── Sub-components ─────────────────────────────────────────────────────────────
function VegIcon({ veg }: { veg: boolean }) {
  return <div className={`veg-icon ${veg ? 'veg' : 'nonveg'}`}><div className="veg-dot" /></div>;
}

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-logo-ring">S&amp;A</div>
      <div className="loading-brand">SHAAN RESTAURANT</div>
      <div className="loading-sub">Bangalore · Authentic Indian</div>
      <div className="loading-dots"><span /><span /><span /></div>
    </div>
  );
}

function ErrorScreen({ msg }: { msg: string }) {
  return (
    <div className="error-screen">
      <div className="error-emoji">😕</div>
      <h2 className="error-title">Oops!</h2>
      <p className="error-msg">{msg}</p>
      <button className="retry-btn" onClick={() => window.location.reload()}>Try Again</button>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────
export default function MenuPage({ params }: { params: Promise<{ qrId: string }> }) {
  const { qrId } = use(params);

  // Core data
  const [table, setTable] = useState<Table | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // AI/Personalisation
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [moodProfile, setMoodProfile] = useState<MoodProfile | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [recommendations, setRecommendations] = useState<MenuItemType[]>([]);
  const [recoReason, setRecoReason] = useState('');
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Diet filter
  const [dietFilters, setDietFilters] = useState<Set<DietFilter>>(new Set());

  // Navigation
  const [activeCategory, setActiveCategory] = useState('all');

  // Group Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [groupUsers, setGroupUsers] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);
  
  // Customer details
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isEntered, setIsEntered] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');

  // Ordering
  const [ordering, setOrdering] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [screen, setScreen] = useState<'menu' | 'payment'>('menu');

  // Order status
  const [orderStatus, setOrderStatus] = useState<string>('');

  // Gift notification
  const [giftNotif, setGiftNotif] = useState<GiftNotif | null>(null);

  // Repeat last order
  const [lastOrder, setLastOrder] = useState<{ id: string; name: string; price: number; quantity: number }[] | null>(null);

  // Image errors
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());

  // ── Load Data ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const tableRes = await fetch(`${API}/table/qr/${qrId}`);
        const tableData = await tableRes.json();
        if (!tableData?.id) throw new Error('Table not found');
        setTable(tableData);

        const [restRes, menuRes, catRes] = await Promise.all([
          fetch(`${API}/restaurant/${tableData.restaurantId}`),
          fetch(`${API}/menu/restaurant/${tableData.restaurantId}`),
          fetch(`${API}/menu/categories/${tableData.restaurantId}`),
        ]);
        const restData = await restRes.json();
        const menuData = await menuRes.json();
        const catData = await catRes.json();
        setRestaurant(restData);
        setMenuItems(menuData);
        setCategories(catData);

        // Check if customer already entered details previously
        const savedName = localStorage.getItem('zeen-customer-name');
        const savedPhone = localStorage.getItem('zeen-customer-phone');
        if (savedName) {
          setCustomerName(savedName);
          setCustomerPhone(savedPhone || '');
          setIsEntered(true);
        }

        // Check repeat order
        const last = getLastOrder(tableData.restaurantId);
        if (last && last.length > 0) setLastOrder(last);

        // Show mood wizard on first visit
        const hasMood = localStorage.getItem('zeen-mood');
        if (!hasMood && savedName) setTimeout(() => setShowWizard(true), 800);
        else if (hasMood) {
          const saved = JSON.parse(hasMood) as MoodProfile;
          setMoodProfile(saved);
        }
      } catch {
        setError('Could not load the menu. Please scan the QR code again.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [qrId]);

  function handleEnterMenu() {
    if (!nameInput.trim()) return alert('Please enter your name');
    setCustomerName(nameInput.trim());
    setCustomerPhone(phoneInput.trim());
    localStorage.setItem('zeen-customer-name', nameInput.trim());
    localStorage.setItem('zeen-customer-phone', phoneInput.trim());
    setIsEntered(true);
    
    // Trigger mood wizard if not done
    if (!localStorage.getItem('zeen-mood')) {
      setTimeout(() => setShowWizard(true), 500);
    }
  }

  // ── Weather ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!menuItems.length) return;
    setWeatherLoading(true);
    fetchWeather().then(w => {
      setWeather(w);
      setWeatherLoading(false);
      const profile = moodProfile ?? { mood: 'relaxed', craving: 'hearty', hunger: 'normal' } as MoodProfile;
      const { items, reason } = getRecommendations(menuItems, profile, w);
      setRecommendations(items);
      setRecoReason(reason);
    });
  }, [menuItems]);

  // Recompute recommendations when mood changes
  useEffect(() => {
    if (!moodProfile || !weather || !menuItems.length) return;
    const { items, reason } = getRecommendations(menuItems, moodProfile, weather);
    setRecommendations(items);
    setRecoReason(reason);
  }, [moodProfile, weather, menuItems]);

  // ── Socket.IO Group Cart ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!table) return;

    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.emit('table:join', { tableId: table.id, userId: customerName || getUserId(), userName: customerName || getUserId() });

    socket.on('table:user-joined', ({ userName }: { userName: string }) => {
      setGroupUsers(prev => [...new Set([...prev, userName])]);
    });
    socket.on('table:user-left', ({ userId }: { userId: string }) => {
      setGroupUsers(prev => prev.filter(u => u !== userId));
    });

    // Others adding/removing items
    socket.on('cart:item-added', ({ item, userId, userName }: { item: MenuItemType; userId: string; userName: string }) => {
      setCart(prev => {
        const ex = prev.find(c => c.item.id === item.id && c.addedBy === userId);
        if (ex) return prev.map(c => c.item.id === item.id && c.addedBy === userId ? { ...c, quantity: c.quantity + 1 } : c);
        return [...prev, { item, quantity: 1, addedBy: userId, addedByName: userName }];
      });
    });
    socket.on('cart:item-removed', ({ itemId, userId }: { itemId: string; userId: string }) => {
      setCart(prev => {
        const ex = prev.find(c => c.item.id === itemId && c.addedBy === userId);
        if (!ex) return prev;
        if (ex.quantity <= 1) return prev.filter(c => !(c.item.id === itemId && c.addedBy === userId));
        return prev.map(c => c.item.id === itemId && c.addedBy === userId ? { ...c, quantity: c.quantity - 1 } : c);
      });
    });
    socket.on('cart:cleared', () => setCart([]));

    // Order status from kitchen
    socket.on('order:status-changed', ({ status }: { status: string }) => setOrderStatus(status));

    // Gift received
    socket.on('gift:received', (notif: GiftNotif) => {
      setGiftNotif(notif);
      setTimeout(() => setGiftNotif(null), 6000);
    });

    return () => { socket.disconnect(); };
  }, [table]);

  // ── Cart Helpers ───────────────────────────────────────────────────────────────
  const addToCart = useCallback((item: MenuItemType) => {
    const me = customerName || 'Guest';
    setCart(prev => {
      const ex = prev.find(c => c.item.id === item.id && c.addedBy === me);
      if (ex) return prev.map(c => c.item.id === item.id && c.addedBy === me ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { item, quantity: 1, addedBy: me, addedByName: me }];
    });
    socketRef.current?.emit('cart:add', { tableId: table?.id, item, userId: me, userName: me });
  }, [table, customerName]);

  const removeFromCart = useCallback((itemId: string) => {
    const me = customerName || 'Guest';
    setCart(prev => {
      const ex = prev.find(c => c.item.id === itemId && c.addedBy === me);
      if (!ex) return prev;
      if (ex.quantity <= 1) return prev.filter(c => !(c.item.id === itemId && c.addedBy === me));
      return prev.map(c => c.item.id === itemId && c.addedBy === me ? { ...c, quantity: c.quantity - 1 } : c);
    });
    socketRef.current?.emit('cart:remove', { tableId: table?.id, itemId, userId: me });
  }, [table, customerName]);

  const getQty = (id: string) => cart.filter(c => c.item.id === id).reduce((s, c) => s + c.quantity, 0);
  const totalItems = cart.reduce((s, c) => s + c.quantity, 0);
  const totalAmount = cart.reduce((s, c) => s + Number(c.item.price) * c.quantity, 0);

  // ── Mood Wizard Complete ───────────────────────────────────────────────────────
  function onMoodComplete(profile: MoodProfile) {
    setMoodProfile(profile);
    setShowWizard(false);
    localStorage.setItem('zeen-mood', JSON.stringify(profile));
  }

  // ── Repeat Last Order ──────────────────────────────────────────────────────────
  function repeatLastOrder() {
    if (!lastOrder || !menuItems.length) return;
    lastOrder.forEach(lo => {
      const found = menuItems.find(m => m.id === lo.id);
      if (found) for (let i = 0; i < lo.quantity; i++) addToCart(found);
    });
    setLastOrder(null);
    setCartOpen(true);
  }

  // ── Diet Filter ────────────────────────────────────────────────────────────────
  function toggleDiet(filter: DietFilter) {
    setDietFilters(prev => {
      const next = new Set(prev);
      if (next.has(filter)) next.delete(filter); else next.add(filter);
      return next;
    });
  }

  // ── Filtered Menu ──────────────────────────────────────────────────────────────
  const dietFiltered = applyDietFilter(menuItems, dietFilters);
  const visibleItems = activeCategory === 'all'
    ? dietFiltered
    : dietFiltered.filter(m => m.category.id === activeCategory);

  // ── Place Order ────────────────────────────────────────────────────────────────
  async function placeOrder() {
    if (!table || cart.length === 0) return;
    setOrdering(true);
    try {
      const res = await fetch(`${API}/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId: table.id,
          restaurantId: table.restaurantId,
          customerName,
          customerPhone,
          items: cart.map(c => ({ menuItemId: c.item.id, quantity: c.quantity, priceAtOrder: Number(c.item.price) })),
        }),
      });
      const orderData = await res.json();
      setPlacedOrder(orderData);
      saveLastOrder(table.restaurantId, cart.map(c => ({ id: c.item.id, name: c.item.name, price: Number(c.item.price), quantity: c.quantity })));

      const payRes = await fetch(`${API}/payment/details/${orderData.id}`);
      setPaymentDetails(await payRes.json());

      socketRef.current?.emit('cart:clear', { tableId: table.id });
      setCart([]);
      setCartOpen(false);
      setScreen('payment');
    } catch {
      alert('Failed to place order. Please try again.');
    } finally {
      setOrdering(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────────
  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen msg={error} />;

  // Welcome / Entry Screen
  if (!isEntered) {
    return (
      <div className="entry-screen">
        <div className="entry-hero">
          <div className="landing-logo">
            <img src="/logo.png" alt="Logo" onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }} />
          </div>
          <h1 className="landing-name">{restaurant?.name}</h1>
          <p className="landing-tagline">Welcome to Table {table?.tableNumber}</p>
        </div>
        <div className="entry-form">
          <h2 className="entry-title">Who's joining us today?</h2>
          <p className="entry-sub">Enter your details to access the menu and join the table's group order.</p>
          
          <div className="input-group">
            <label>Your Name</label>
            <input 
              type="text" 
              placeholder="e.g. Rahul" 
              value={nameInput} 
              onChange={e => setNameInput(e.target.value)} 
              className="entry-input"
              autoFocus
            />
          </div>
          <div className="input-group">
            <label>WhatsApp Number (Optional)</label>
            <input 
              type="tel" 
              placeholder="e.g. 9876543210" 
              value={phoneInput} 
              onChange={e => setPhoneInput(e.target.value)} 
              className="entry-input"
            />
            <span className="entry-hint">For sending your bill later.</span>
          </div>

          <button className="entry-btn" onClick={handleEnterMenu}>
            Browse Menu ✨
          </button>
        </div>
      </div>
    );
  }

  // Payment Screen
  if (screen === 'payment' && paymentDetails && placedOrder) {
    const myItems = cart; // already cleared, use paymentDetails
    return (
      <div className="pay-screen">
        <div className="pay-header">
          <div className="success-ring"><CheckCircle size={34} color="white" /></div>
          <div className="pay-title">Order Placed! 🎉</div>
          <div className="pay-subtitle">Your food is being prepared with love</div>
          <div className="order-id-tag">Order #{placedOrder.id.slice(-6).toUpperCase()}</div>
          {orderStatus && (
            <div className="order-live-status">
              🔴 {orderStatus === 'RECEIVED' ? 'Order Received' : orderStatus === 'COOKING' ? '👨‍🍳 Cooking Now...' : orderStatus === 'READY' ? '✅ Ready to Serve!' : orderStatus}
            </div>
          )}
        </div>

        <div className="pay-body">
          {/* Bill */}
          <div className="bill-card">
            <div className="bill-card-title">🧾 Bill Summary</div>
            {paymentDetails.billSummary.items.map((row, i) => (
              <div key={i} className="bill-row">
                <span className="bill-row-name">{row.name} <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>×{row.qty}</span></span>
                <span className="bill-row-price">{inr(row.subtotal)}</span>
              </div>
            ))}
            <hr className="bill-divider" />
            <div className="bill-total-row">
              <span className="bill-total-label">Total Amount</span>
              <span className="bill-total-amt">{inr(paymentDetails.billSummary.total)}</span>
            </div>
          </div>

          {/* Payment */}
          <div className="pay-options-title">Pay Now</div>
          {paymentDetails.upiLink && (
            <a href={paymentDetails.upiLink} className="pay-btn upi-pay-btn">
              <CreditCard size={20} /> Pay via UPI · {inr(paymentDetails.amount)}
            </a>
          )}
          {paymentDetails.whatsappLink && (
            <a href={paymentDetails.whatsappLink} target="_blank" rel="noreferrer" className="pay-btn wa-pay-btn">
              <MessageCircle size={20} /> Send Bill via WhatsApp
            </a>
          )}
          <button className="new-order-btn" onClick={() => { setScreen('menu'); setPlacedOrder(null); setPaymentDetails(null); }}>
            + Order More Items
          </button>
        </div>
      </div>
    );
  }

  // ── Menu Screen ────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Mood Wizard */}
      {showWizard && <MoodWizard onComplete={onMoodComplete} onSkip={() => { setShowWizard(false); localStorage.setItem('zeen-mood', JSON.stringify({ mood: 'relaxed', craving: 'hearty', hunger: 'normal' })); }} />}

      {/* Gift Notification Toast */}
      {giftNotif && (
        <div className="gift-toast">
          <span className="gift-toast-emoji">🎁</span>
          <div>
            <div className="gift-toast-title">A gift from Table {giftNotif.fromTable}!</div>
            <div className="gift-toast-msg">{giftNotif.itemName} — "{giftNotif.message}"</div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="restaurant-header">
        <div className="header-inner">
          <div className="header-row">
            <div className="logo-group">
              <div className="sa-logo">
                <img src="/logo.png" alt="S&A" onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                  (e.currentTarget.parentElement as HTMLElement).innerHTML = '<span class="sa-logo-text">S&amp;A</span>';
                }} />
              </div>
              <div>
                <h1 className="brand-name">{restaurant?.name ?? 'Shaan Restaurant'}</h1>
                <p className="brand-tagline">✦ Authentic Indian Flavours ✦</p>
              </div>
            </div>
            <button className="cart-btn" onClick={() => setCartOpen(true)}>
              <ShoppingCart size={20} />
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </button>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="table-chip"><Utensils size={12} /> Table {table?.tableNumber}</div>
            {groupUsers.length > 0 && (
              <div className="table-chip" style={{ background: 'rgba(201,162,39,0.2)' }}>
                <Users size={12} /> {groupUsers.length + 1} ordering together
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Weather Banner */}
      {weather && (
        <div className="weather-banner">
          <div className="weather-left">
            <span className="weather-emoji">{weather.emoji}</span>
            <span className="weather-desc">{weather.description}</span>
          </div>
          <button className="reco-btn" onClick={() => setShowWizard(true)}>
            <Sparkles size={13} /> Redo Quiz
          </button>
        </div>
      )}

      {/* Repeat Last Order banner */}
      {lastOrder && lastOrder.length > 0 && (
        <div className="repeat-banner">
          <div className="repeat-left">
            <RefreshCw size={15} />
            <span>Welcome back! Repeat your last order?</span>
          </div>
          <button className="repeat-btn" onClick={repeatLastOrder}>
            Yes, Add All
          </button>
          <button className="repeat-dismiss" onClick={() => setLastOrder(null)}>✕</button>
        </div>
      )}

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <div className="reco-section">
          <div className="reco-header">
            <div className="reco-icon"><Sparkles size={14} /></div>
            <div>
              <div className="reco-title">Just For You</div>
              <div className="reco-reason">{recoReason}</div>
            </div>
            <button className="reco-retake" onClick={() => setShowWizard(true)}>
              <Clock size={13} /> Retake
            </button>
          </div>
          <div className="reco-scroll">
            {recommendations.map(item => {
              const qty = getQty(item.id);
              return (
                <div key={item.id} className="reco-card">
                  <div className="reco-img-wrap">
                    <img src={imgErrors.has(item.id) ? FALLBACK : imgFor(item)} alt={item.name}
                      className="reco-img"
                      onError={() => setImgErrors(prev => new Set([...prev, item.id]))}
                    />
                    <div className="reco-img-overlay" />
                    <div className="reco-price-tag">{inr(Number(item.price))}</div>
                  </div>
                  <div className="reco-info">
                    <div className="reco-name-row">
                      <VegIcon veg={isVeg(item.name)} />
                      <span className="reco-name">{item.name}</span>
                    </div>
                    {qty === 0 ? (
                      <button className="reco-add-btn" onClick={() => addToCart(item)}>
                        <Plus size={13} /> Add
                      </button>
                    ) : (
                      <div className="qty-ctrl reco-qty">
                        <button onClick={() => removeFromCart(item.id)}><Minus size={11} /></button>
                        <span>{qty}</span>
                        <button onClick={() => addToCart(item)}><Plus size={11} /></button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Diet Filter */}
      <div className="diet-filter-bar">
        {DIET_LABELS.map(d => (
          <button
            key={d.key}
            className={`diet-pill ${dietFilters.has(d.key) ? 'active' : ''}`}
            onClick={() => toggleDiet(d.key)}
          >
            {d.emoji} {d.label}
          </button>
        ))}
      </div>

      {/* Category Tabs */}
      <div className="cat-tabs-wrap">
        <div className="cat-tabs">
          <button className={`cat-tab ${activeCategory === 'all' ? 'active' : ''}`} onClick={() => setActiveCategory('all')}>
            <span className="cat-emoji">🍽️</span> All
          </button>
          {categories.map(cat => (
            <button key={cat.id} className={`cat-tab ${activeCategory === cat.id ? 'active' : ''}`} onClick={() => setActiveCategory(cat.id)}>
              <span className="cat-emoji">{catIcon(cat.name)}</span> {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      <div className="menu-container">
        {dietFilters.size > 0 && (
          <div className="filter-notice">
            <Leaf size={13} /> Showing {visibleItems.length} item{visibleItems.length !== 1 ? 's' : ''} matching your diet preference
          </div>
        )}
        {categories
          .filter(cat => activeCategory === 'all' || cat.id === activeCategory)
          .map(cat => {
            const items = visibleItems.filter(m => m.category.id === cat.id);
            if (items.length === 0) return null;
            return (
              <div key={cat.id}>
                <div className="section-title">{catIcon(cat.name)} {cat.name}</div>
                <div className="menu-grid">
                  {items.map(item => {
                    const qty = getQty(item.id);
                    const veg = isVeg(item.name);
                    return (
                      <div key={item.id} className="menu-card">
                        <div className="card-img-wrap">
                          <img
                            src={imgErrors.has(item.id) ? FALLBACK : imgFor(item)}
                            alt={item.name} className="card-img"
                            onError={() => setImgErrors(prev => new Set([...prev, item.id]))}
                          />
                          <div className="card-img-overlay" />
                        </div>
                        <div className="card-body">
                          <div className="card-top-row">
                            <VegIcon veg={veg} />
                            <span className="item-price">{inr(Number(item.price))}</span>
                          </div>
                          <h3 className="item-name">{item.name}</h3>
                          {item.description && <p className="item-desc">{item.description}</p>}
                          {qty === 0 ? (
                            <button className="add-btn" onClick={() => addToCart(item)}>
                              <Plus size={14} /> Add
                            </button>
                          ) : (
                            <div className="qty-ctrl">
                              <button onClick={() => removeFromCart(item.id)}><Minus size={13} /></button>
                              <span>{qty}</span>
                              <button onClick={() => addToCart(item)}><Plus size={13} /></button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        {visibleItems.length === 0 && (
          <div className="empty-state">
            <div className="emoji">🥗</div>
            <p>No items match your current filters.</p>
          </div>
        )}
      </div>

      {/* Floating Cart */}
      {totalItems > 0 && (
        <div className="floating-cart" onClick={() => setCartOpen(true)}>
          <div className="float-left">
            <span className="float-items-badge">{totalItems}</span>
            <span className="float-label">item{totalItems > 1 ? 's' : ''}</span>
          </div>
          <span className="float-total">{inr(totalAmount)}</span>
          <div className="float-right">View Order <ChevronRight size={15} /></div>
        </div>
      )}

      {/* Cart Sheet */}
      {cartOpen && (
        <div className="cart-overlay" onClick={() => setCartOpen(false)}>
          <div className="cart-sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-drag" />
            <div className="sheet-head">
              <h2>
                Your Order
                {groupUsers.length > 0 && (
                  <span className="group-badge"><Users size={12} /> Group Order</span>
                )}
              </h2>
              <button className="sheet-close" onClick={() => setCartOpen(false)}><X size={18} /></button>
            </div>

            <div className="sheet-body">
              {/* Group by user */}
              {Array.from(new Set(cart.map(c => c.addedBy))).map(uid => {
                const userItems = cart.filter(c => c.addedBy === uid);
                const isMe = uid === customerName;
                return (
                  <div key={uid}>
                    {groupUsers.length > 0 && (
                      <div className="cart-user-header">
                        {isMe ? '👤 You' : `👤 ${uid}`}
                      </div>
                    )}
                    {userItems.map(c => (
                      <div key={`${c.item.id}-${uid}`} className="cart-row">
                        <div className="cart-row-left">
                          <VegIcon veg={isVeg(c.item.name)} />
                          <span className="cart-item-name">{c.item.name}</span>
                        </div>
                        <div className="cart-row-right">
                          {isMe ? (
                            <div className="qty-ctrl sm">
                              <button onClick={() => removeFromCart(c.item.id)}><Minus size={11} /></button>
                              <span>{c.quantity}</span>
                              <button onClick={() => addToCart(c.item)}><Plus size={11} /></button>
                            </div>
                          ) : (
                            <span className="qty-readonly">×{c.quantity}</span>
                          )}
                          <span className="cart-item-subtotal">{inr(Number(c.item.price) * c.quantity)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            <div className="sheet-footer">
              <div className="sheet-total-row">
                <span className="sheet-total-label">Total</span>
                <span className="sheet-total-amount">{inr(totalAmount)}</span>
              </div>
              <button className="place-order-btn" onClick={placeOrder} disabled={ordering}>
                {ordering ? <><Loader2 size={18} className="spin" /> Placing...</> : <>Place Order · {inr(totalAmount)}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
