'use client';

import { use, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { QRCodeSVG } from 'qrcode.react';
import { LayoutDashboard, UtensilsCrossed, QrCode, Plus, CheckCircle, Clock, Check, Loader2, Save, Download, Store, Power, Edit2, Trash2, X, BarChart3, History } from 'lucide-react';
import type { MenuItem } from '@/lib/recommendations';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://iqzeen.onrender.com/api';
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://iqzeen.onrender.com';
const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';

interface Restaurant { id: string; name: string; slug: string; isActive: boolean; }
interface Table { id: string; tableNumber: string; qrCodeId: string; }
interface Category { id: string; name: string; }
interface OrderItem { id: string; quantity: number; priceAtOrder: string; menuItem: MenuItem; }
interface Order {
  id: string; tableId: string; table: Table; totalAmount: string; status: 'PENDING' | 'RECEIVED' | 'COOKING' | 'READY' | 'SERVED';
  customerName?: string; customerPhone?: string; createdAt: string; items: OrderItem[];
}

export default function OwnerDashboard({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [activeTab, setActiveTab] = useState<'kds' | 'menu' | 'qr' | 'analytics' | 'history'>('kds');
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  
  // ── Table Manager State ──
  const [newTableNum, setNewTableNum] = useState('');
  const [editingTable, setEditingTable] = useState<Table | null>(null);

  // ── QR Designer State ──
  const [selectedTableQR, setSelectedTableQR] = useState<Table | null>(null);
  const [qrColor, setQrColor] = useState('#ffffff');
  const [qrBg, setQrBg] = useState('#000000');
  const [qrText, setQrText] = useState('Scan to Order');

  const socketRef = useRef<Socket | null>(null);

  const router = useRouter();

  const getHeaders = () => {
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("restaurant_token")}`
    };
  };

  // Load Initial Data
  useEffect(() => {
    const token = localStorage.getItem("restaurant_token");
    if (!token) {
      router.push("/dashboard/login");
      return;
    }

    async function init() {
      const res = await fetch(`${API}/restaurant`, { headers: getHeaders() });
      const allRests: Restaurant[] = await res.json();
      const rest = allRests.find(r => r.slug === slug);
      if (!rest) return alert('Restaurant not found');
      setRestaurant(rest);

      const [ordRes, tabRes, catRes, itemRes] = await Promise.all([
        fetch(`${API}/order/restaurant/${rest.id}`, { headers: getHeaders() }),
        fetch(`${API}/table/restaurant/${rest.id}`, { headers: getHeaders() }),
        fetch(`${API}/menu/categories/${rest.id}`, { headers: getHeaders() }),
        fetch(`${API}/menu/restaurant/${rest.id}`, { headers: getHeaders() })
      ]);
      setOrders(await ordRes.json());
      setTables(await tabRes.json());
      setCategories(await catRes.json());
      setMenuItems(await itemRes.json());

      const socket = io(SOCKET_URL, { transports: ['websocket'] });
      socketRef.current = socket;
      socket.emit('kitchen:join', rest.id);

      socket.on('order:new', (newOrder: Order) => {
        setOrders(prev => [newOrder, ...prev]);
        new Audio('/bell.mp3').play().catch(() => {});
      });
    }
    init();
    return () => { socketRef.current?.disconnect(); };
  }, [slug]);

  if (!restaurant) return <div className="flex h-screen items-center justify-center bg-gray-950"><Loader2 className="animate-spin text-amber-500" size={32} /></div>;

  // ── KDS Logic ──
  const receivedOrders = orders.filter(o => o.status === 'PENDING' || o.status === 'RECEIVED');
  const cookingOrders = orders.filter(o => o.status === 'COOKING');
  const readyOrders = orders.filter(o => o.status === 'READY');

  async function updateOrderStatus(orderId: string, status: string) {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: status as any } : o));
    await fetch(`${API}/order/${orderId}/status`, {
      method: 'PUT', headers: getHeaders(),
      body: JSON.stringify({ status })
    });
  }

  // ── Table Manager Logic ──
  async function addTable() {
    if (!newTableNum) return;
    const res = await fetch(`${API}/table`, {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify({ tableNumber: newTableNum, restaurantId: restaurant!.id })
    });
    const nt = await res.json();
    setTables(prev => [...prev, nt]);
    setNewTableNum('');
  }

  async function updateTable() {
    if (!newTableNum || !editingTable) return;
    const res = await fetch(`${API}/table/${editingTable.id}`, {
      method: 'PUT', headers: getHeaders(),
      body: JSON.stringify({ tableNumber: newTableNum })
    });
    const updated = await res.json();
    setTables(prev => prev.map(t => t.id === updated.id ? updated : t));
    if (selectedTableQR?.id === updated.id) setSelectedTableQR(updated);
    setNewTableNum('');
    setEditingTable(null);
  }

  function editTable(t: Table) {
    setEditingTable(t);
    setNewTableNum(t.tableNumber);
  }

  async function deleteTable(id: string) {
    if(!confirm("Are you sure?")) return;
    await fetch(`${API}/table/${id}`, { method: 'DELETE', headers: getHeaders() });
    setTables(prev => prev.filter(t => t.id !== id));
    if (selectedTableQR?.id === id) setSelectedTableQR(null);
  }

  // ── QR Designer Logic ──
  function downloadQR() {
    const svg = document.getElementById('qr-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width + 60;
      canvas.height = img.height + 140;
      
      // Draw frame background
      ctx!.fillStyle = qrBg;
      ctx!.beginPath();
      ctx!.roundRect(0, 0, canvas.width, canvas.height, 40);
      ctx!.fill();
      
      // Draw text
      ctx!.fillStyle = qrColor;
      ctx!.font = "bold 26px sans-serif";
      ctx!.textAlign = "center";
      ctx!.fillText(`TABLE ${selectedTableQR?.tableNumber}`, canvas.width/2, 45);
      
      // Draw QR
      ctx!.drawImage(img, 30, 65);
      
      // Draw bottom text
      ctx!.font = "bold 22px sans-serif";
      ctx!.fillText(qrText.toUpperCase(), canvas.width/2, canvas.height - 30);

      const a = document.createElement("a");
      a.download = `Table-${selectedTableQR?.tableNumber}-QR.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  }

  return (
    <div className="flex h-screen bg-[#0A0A0A] text-gray-300 font-sans selection:bg-amber-500/30">
      
      {/* Sidebar (Dark Mode) */}
      <div className="w-64 bg-[#111111] border-r border-white/5 flex flex-col shadow-2xl z-10 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full filter blur-[50px] pointer-events-none"></div>
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Store className="text-white w-4 h-4" />
            </div>
            <h1 className="text-xl font-black text-white tracking-tight">{restaurant.name}</h1>
          </div>
          <p className="text-xs text-gray-500 font-medium">Owner Terminal</p>
        </div>
        
        <div className="flex-1 p-4 space-y-1 mt-2">
          <button onClick={() => setActiveTab('kds')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'kds' ? 'bg-white/10 text-white shadow-inner border border-white/5' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>
            <LayoutDashboard size={18} className={activeTab === 'kds' ? 'text-amber-400' : ''} /> Live KDS
          </button>
          <button onClick={() => setActiveTab('menu')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'menu' ? 'bg-white/10 text-white shadow-inner border border-white/5' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>
            <UtensilsCrossed size={18} className={activeTab === 'menu' ? 'text-amber-400' : ''} /> Menu
          </button>
          <button onClick={() => setActiveTab('qr')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'qr' ? 'bg-white/10 text-white shadow-inner border border-white/5' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>
            <QrCode size={18} className={activeTab === 'qr' ? 'text-amber-400' : ''} /> Tables & QR
          </button>
          <button onClick={() => setActiveTab('analytics')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'analytics' ? 'bg-white/10 text-white shadow-inner border border-white/5' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>
            <BarChart3 size={18} className={activeTab === 'analytics' ? 'text-amber-400' : ''} /> Analytics
          </button>
          <button onClick={() => setActiveTab('history')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'history' ? 'bg-white/10 text-white shadow-inner border border-white/5' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>
            <History size={18} className={activeTab === 'history' ? 'text-amber-400' : ''} /> Order History
          </button>
        </div>

        <div className="p-4 border-t border-white/5">
           <button onClick={() => { localStorage.removeItem("restaurant_token"); router.push("/dashboard/login"); }} className="w-full flex items-center gap-3 text-sm text-gray-500 hover:text-white transition-colors p-2">
             <Power size={16} /> Logout
           </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto relative">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-600/5 rounded-full filter blur-[100px] pointer-events-none"></div>

        {/* KDS TAB */}
        {activeTab === 'kds' && (
          <div className="p-8 h-full flex flex-col relative z-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Clock className="text-amber-500"/> Kitchen Display</h2>
              <div className="flex gap-4">
                <div className="px-4 py-1.5 bg-[#1A1A1A] rounded-full border border-white/10 text-sm font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> {receivedOrders.length + cookingOrders.length} Active
                </div>
              </div>
            </div>
            
            <div className="flex gap-6 flex-1 min-h-0">
              {/* Column 1: Received */}
              <div className="flex-1 bg-[#151515] rounded-3xl p-4 flex flex-col border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-rose-600"></div>
                <div className="flex items-center justify-between mb-4 px-2 mt-2">
                  <h3 className="font-bold text-gray-200 uppercase tracking-wider text-sm">New Orders</h3>
                  <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-xs px-2.5 py-1 rounded-full font-bold">{receivedOrders.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                  {receivedOrders.map(o => (
                    <OrderCard key={o.id} order={o} onAction={() => updateOrderStatus(o.id, 'COOKING')} actionLabel="START COOKING" actionColor="bg-amber-500 text-black hover:bg-amber-400" />
                  ))}
                  {receivedOrders.length === 0 && <EmptyColumn msg="No new orders" />}
                </div>
              </div>

              {/* Column 2: Cooking */}
              <div className="flex-1 bg-[#151515] rounded-3xl p-4 flex flex-col border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
                <div className="flex items-center justify-between mb-4 px-2 mt-2">
                  <h3 className="font-bold text-gray-200 uppercase tracking-wider text-sm">Cooking</h3>
                  <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs px-2.5 py-1 rounded-full font-bold">{cookingOrders.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                  {cookingOrders.map(o => (
                    <OrderCard key={o.id} order={o} onAction={() => updateOrderStatus(o.id, 'READY')} actionLabel="MARK READY" actionColor="bg-green-500 text-black hover:bg-green-400" />
                  ))}
                  {cookingOrders.length === 0 && <EmptyColumn msg="Kitchen is quiet" />}
                </div>
              </div>

              {/* Column 3: Ready */}
              <div className="flex-1 bg-[#151515] rounded-3xl p-4 flex flex-col border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
                <div className="flex items-center justify-between mb-4 px-2 mt-2">
                  <h3 className="font-bold text-gray-200 uppercase tracking-wider text-sm">Ready to Serve</h3>
                  <span className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs px-2.5 py-1 rounded-full font-bold">{readyOrders.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                  {readyOrders.map(o => (
                    <OrderCard key={o.id} order={o} onAction={() => updateOrderStatus(o.id, 'SERVED')} actionLabel="MARK SERVED" actionColor="bg-[#222] text-white hover:bg-[#333] border border-white/10" />
                  ))}
                  {readyOrders.length === 0 && <EmptyColumn msg="Nothing ready yet" />}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="p-8 relative z-10">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><BarChart3 className="text-amber-500"/> Business Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
               <div className="bg-[#151515] p-6 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group hover:border-white/10 transition-colors">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full filter blur-[40px] group-hover:bg-amber-500/20 transition-all"></div>
                 <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Total Revenue</p>
                 <h3 className="text-4xl font-black text-white tracking-tight">₹{orders.reduce((sum, o) => sum + Number(o.totalAmount), 0).toFixed(2)}</h3>
               </div>
               
               <div className="bg-[#151515] p-6 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group hover:border-white/10 transition-colors">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full filter blur-[40px] group-hover:bg-orange-500/20 transition-all"></div>
                 <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Total Orders</p>
                 <h3 className="text-4xl font-black text-white tracking-tight">{orders.length}</h3>
               </div>
               
               <div className="bg-[#151515] p-6 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group hover:border-white/10 transition-colors">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full filter blur-[40px] group-hover:bg-rose-500/20 transition-all"></div>
                 <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Avg Order Value</p>
                 <h3 className="text-4xl font-black text-white tracking-tight">₹{orders.length ? (orders.reduce((sum, o) => sum + Number(o.totalAmount), 0) / orders.length).toFixed(2) : '0.00'}</h3>
               </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-[#151515] p-8 rounded-3xl border border-white/5 shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-6">Top Selling Items</h3>
                <div className="space-y-6">
                  {(() => {
                    const itemCounts: Record<string, number> = {};
                    orders.forEach(o => {
                      o.items?.forEach(i => {
                        const name = i.menuItem?.name || 'Unknown Item';
                        itemCounts[name] = (itemCounts[name] || 0) + i.quantity;
                      });
                    });
                    const sorted = Object.entries(itemCounts).sort((a,b) => b[1] - a[1]).slice(0, 5);
                    if(sorted.length === 0) return <p className="text-gray-500 italic">No order data available yet.</p>;
                    
                    return sorted.map(([name, count], idx) => (
                      <div key={name} className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 text-amber-500 flex items-center justify-center font-black text-lg border border-amber-500/20 shadow-inner">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-2">
                            <span className="text-white font-bold">{name}</span>
                            <span className="text-gray-400 text-sm font-medium">{count} orders</span>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-2 shadow-inner">
                            <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" style={{ width: `${(count / sorted[0][1]) * 100}%` }}></div>
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="p-8 relative z-10">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><History className="text-amber-500"/> Order History</h2>
            <div className="bg-[#151515] rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-black/40 border-b border-white/5">
                      <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Order ID</th>
                      <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Date & Time</th>
                      <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Table</th>
                      <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Total</th>
                      <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {orders.length === 0 ? (
                      <tr><td colSpan={5} className="p-12 text-center text-gray-500 font-medium">No order history available.</td></tr>
                    ) : (
                      orders.map(o => (
                        <tr key={o.id} className="hover:bg-white/5 transition-colors group">
                          <td className="p-5 text-sm font-bold text-gray-300">#{o.id.slice(-6).toUpperCase()}</td>
                          <td className="p-5 text-sm font-medium text-gray-400 group-hover:text-gray-300">{new Date(o.createdAt).toLocaleString()}</td>
                          <td className="p-5 text-sm font-medium text-gray-400 group-hover:text-gray-300">{o.table?.tableNumber || 'N/A'}</td>
                          <td className="p-5 text-sm font-black text-amber-500">₹{o.totalAmount}</td>
                          <td className="p-5">
                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-inner ${
                              o.status === 'SERVED' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                              o.status === 'PENDING' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                              o.status === 'COOKING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                              'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}>
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MENU TAB */}
        {activeTab === 'menu' && (
          <div className="p-8 relative z-10">
             <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><UtensilsCrossed className="text-amber-500"/> Menu Manager</h2>
             
             <div className="grid gap-8">
               {categories.map(cat => {
                 const items = menuItems.filter(m => m.category.id === cat.id);
                 if (items.length === 0) return null;
                 return (
                   <div key={cat.id} className="bg-[#151515] border border-white/5 rounded-3xl p-6 shadow-2xl">
                     <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                       <span className="w-1.5 h-6 bg-amber-500 rounded-full inline-block"></span>
                       {cat.name} <span className="text-sm font-normal text-gray-500 ml-2">({items.length} items)</span>
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                       {items.map(item => (
                         <div key={item.id} className="flex justify-between items-center bg-[#1A1A1A] p-4 rounded-2xl border border-white/5 hover:border-amber-500/30 transition-colors group">
                           <div>
                             <h4 className="font-bold text-gray-200 group-hover:text-amber-400 transition-colors">{item.name}</h4>
                             <span className="text-sm font-mono text-gray-500">₹{item.price}</span>
                           </div>
                           <label className="relative inline-flex items-center cursor-pointer">
                             {/* Mock toggle for UI purposes */}
                             <input type="checkbox" className="sr-only peer" defaultChecked={item.isAvailable} />
                             <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                           </label>
                         </div>
                       ))}
                     </div>
                   </div>
                 );
               })}
             </div>
          </div>
        )}

        {/* QR & TABLES TAB */}
        {activeTab === 'qr' && (
          <div className="p-8 h-full flex flex-col relative z-10">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><QrCode className="text-amber-500"/> QR Designer Pro</h2>
            
            <div className="flex gap-8 flex-1 min-h-0">
              
              {/* Tables List */}
              <div className="w-1/3 bg-[#151515] rounded-3xl shadow-2xl border border-white/5 flex flex-col overflow-hidden">
                <div className="p-5 border-b border-white/5 flex gap-2 bg-[#1A1A1A]">
                  <input 
                    type="text" 
                    placeholder={editingTable ? "Update Table No." : "New Table No."} 
                    value={newTableNum} 
                    onChange={e => setNewTableNum(e.target.value)}
                    className="flex-1 bg-[#111] border border-white/10 text-white rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none placeholder-gray-600 font-bold"
                  />
                  {editingTable ? (
                    <>
                      <button onClick={updateTable} className="bg-amber-500 text-black px-4 rounded-xl hover:bg-amber-400 flex items-center font-bold transition-colors shadow-lg shadow-amber-500/20"><Check size={18}/></button>
                      <button onClick={() => { setEditingTable(null); setNewTableNum(''); }} className="bg-gray-700 text-white px-3 rounded-xl hover:bg-gray-600 flex items-center font-bold transition-colors"><X size={18}/></button>
                    </>
                  ) : (
                    <button onClick={addTable} className="bg-amber-500 text-black px-4 rounded-xl hover:bg-amber-400 flex items-center font-bold transition-colors shadow-lg shadow-amber-500/20"><Plus size={18}/></button>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                  {tables.map(t => (
                    <div 
                      key={t.id} 
                      className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl text-sm font-bold transition-all ${selectedTableQR?.id === t.id ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'bg-[#1A1A1A] text-gray-400 hover:bg-white/5 hover:text-white border border-white/5'}`}
                    >
                      <button onClick={() => setSelectedTableQR(t)} className="flex-1 text-left flex items-center gap-2">
                        <QrCode size={16} className={selectedTableQR?.id === t.id ? 'opacity-100' : 'opacity-30'} />
                        <span>Table {t.tableNumber}</span>
                      </button>
                      <div className="flex gap-3">
                        <button onClick={() => editTable(t)} className="opacity-60 hover:opacity-100"><Edit2 size={14}/></button>
                        <button onClick={() => deleteTable(t.id)} className="opacity-60 hover:opacity-100 text-red-500 hover:text-red-400"><Trash2 size={14}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* QR Designer */}
              <div className="flex-1 bg-[#151515] rounded-3xl shadow-2xl border border-white/5 p-8 flex flex-col items-center justify-center relative overflow-hidden">
                {!selectedTableQR ? (
                  <div className="text-gray-500 text-center flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10">
                      <QrCode size={40} className="text-gray-600" />
                    </div>
                    <p className="font-medium">Select a table to launch the designer.</p>
                  </div>
                ) : (
                  <div className="w-full max-w-md space-y-8 relative z-10">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-black text-white mb-2 tracking-tight">QR Studio: Table {selectedTableQR.tableNumber}</h3>
                      <p className="text-sm text-gray-400 font-medium">Design your scan target.</p>
                    </div>

                    <div className="flex justify-center perspective-1000">
                      {/* Live Preview Frame */}
                      <div className="relative p-6 rounded-[2.5rem] shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-rotate-1" style={{ backgroundColor: qrBg, boxShadow: `0 25px 50px -12px ${qrBg}80` }}>
                        <div className="text-center font-black text-sm mb-4 tracking-widest" style={{ color: qrColor }}>
                          TABLE {selectedTableQR.tableNumber}
                        </div>
                        <div className="bg-white p-2 rounded-3xl overflow-hidden shadow-inner">
                          <QRCodeSVG 
                            id="qr-svg"
                            value={`${FRONTEND_URL}/menu/${selectedTableQR.qrCodeId}`} 
                            size={200} 
                            fgColor="#000000" // Keep QR scannable inside white box
                            bgColor="#ffffff"
                            level="H"
                            className="rounded-2xl"
                          />
                        </div>
                        <div className="text-center mt-5 font-black text-base tracking-widest" style={{ color: qrColor }}>
                          {qrText.toUpperCase()}
                        </div>
                      </div>
                    </div>

                    {/* Pro Controls */}
                    <div className="bg-[#1A1A1A] p-6 rounded-3xl border border-white/5 space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Frame Color</label>
                          <div className="flex gap-2 flex-wrap">
                            {['#000000', '#111111', '#18181b', '#C0392B', '#E8871A', '#047857', '#1d4ed8'].map(c => (
                              <button key={c} onClick={() => setQrBg(c)} className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${qrBg === c ? 'border-amber-500 scale-110' : 'border-transparent shadow-sm'}`} style={{ backgroundColor: c }} />
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Accent Color</label>
                          <div className="flex gap-2 flex-wrap">
                            {['#ffffff', '#fcd34d', '#f87171', '#34d399', '#60a5fa'].map(c => (
                              <button key={c} onClick={() => setQrColor(c)} className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${qrColor === c ? 'border-amber-500 scale-110' : 'border-transparent shadow-sm'}`} style={{ backgroundColor: c }} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Call to Action Text</label>
                        <input type="text" value={qrText} onChange={e => setQrText(e.target.value)} maxLength={18} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-amber-500 transition-colors uppercase tracking-widest text-sm" />
                      </div>
                      <button onClick={downloadQR} className="w-full bg-amber-500 text-black font-black py-4 rounded-2xl mt-2 flex justify-center items-center gap-2 hover:bg-amber-400 transition-colors uppercase tracking-wider text-sm shadow-lg shadow-amber-500/20">
                        <Download size={18} /> Export High-Res Design
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ── Minimalist Dark Mode KDS Card Component ──
function OrderCard({ order, onAction, actionLabel, actionColor }: { order: Order, onAction: () => void, actionLabel: string, actionColor: string }) {
  return (
    <div className="bg-[#1A1A1A] rounded-2xl shadow-lg border border-white/5 overflow-hidden group hover:border-white/10 transition-colors">
      <div className="bg-[#222222] px-5 py-3 flex justify-between items-center">
        <div>
          <span className="font-black text-white text-lg mr-3 tracking-tight">T-{order.table?.tableNumber || '?'}</span>
          <span className="text-[10px] text-amber-500 font-mono tracking-widest uppercase bg-amber-500/10 px-2 py-0.5 rounded-full">#{order.id.slice(-5)}</span>
        </div>
        <div className="text-[10px] font-bold text-gray-500 tracking-wider">
          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      
      {(order.customerName || order.customerPhone) && (
        <div className="px-5 py-2.5 border-b border-white/5 flex items-center gap-3 bg-white/5">
          <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 text-xs font-bold">
            {order.customerName?.charAt(0).toUpperCase() || '👤'}
          </div>
          <div>
            <div className="text-xs font-bold text-gray-200">{order.customerName}</div>
            <div className="text-[10px] text-gray-500 font-mono">{order.customerPhone}</div>
          </div>
        </div>
      )}

      <div className="p-5">
        <ul className="space-y-3 mb-6">
          {order.items.map(item => (
            <li key={item.id} className="flex justify-between items-start text-sm">
              <span className="text-gray-300 font-medium leading-tight">
                <span className="font-black text-white mr-3 bg-white/10 px-2 py-0.5 rounded-md">{item.quantity}x</span> 
                {item.menuItem?.name || 'Unknown Item'}
              </span>
            </li>
          ))}
        </ul>
        <button onClick={onAction} className={`w-full py-3.5 rounded-xl text-xs font-black tracking-widest transition-all ${actionColor}`}>
          {actionLabel}
        </button>
      </div>
    </div>
  );
}

function EmptyColumn({ msg }: { msg: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50 pb-10">
      <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center mb-3">
        <UtensilsCrossed size={20} />
      </div>
      <p className="text-sm font-bold uppercase tracking-wider">{msg}</p>
    </div>
  );
}
