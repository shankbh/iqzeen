"use client";

import { useState, useEffect } from "react";
import { Plus, List, ChefHat, LayoutGrid, Store, Menu, X, Mail, Phone, Briefcase, ExternalLink, Activity } from "lucide-react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export default function AdminPortal() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [successMsg, setSuccessMsg] = useState("");
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<"dashboard" | "add-restaurant" | "add-category" | "add-item">("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Forms State
  const [restaurantForm, setRestaurantForm] = useState({
    name: "", email: "", slug: "", phone: "", upiId: "", whatsappNumber: "",
    gstNumber: "", fssaiCertificate: "", ownerName: "", bankDetails: ""
  });
  const [categoryForm, setCategoryForm] = useState({ name: "", restaurantId: "", order: 0 });
  const [itemForm, setItemForm] = useState({
    name: "", description: "", price: "", type: "veg",
    restaurantId: "", categoryId: "", isAvailable: true
  });

  useEffect(() => {
    fetchRestaurants();
  }, [activeTab]);

  const fetchRestaurants = async () => {
    try {
      const res = await fetch(`${API_BASE}/restaurant`);
      if (res.ok) setRestaurants(await res.json());
    } catch (e) { console.error("Error fetching restaurants", e); }
  };

  const fetchCategories = async (restaurantId: string) => {
    try {
      const res = await fetch(`${API_BASE}/menu/categories/${restaurantId}`);
      if (res.ok) setCategories(await res.json());
    } catch (e) { console.error("Error fetching categories", e); }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleCreateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/restaurant`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(restaurantForm)
      });
      if (res.ok) {
        showSuccess("Restaurant created successfully!");
        setRestaurantForm({ name: "", email: "", slug: "", phone: "", upiId: "", whatsappNumber: "", gstNumber: "", fssaiCertificate: "", ownerName: "", bankDetails: "" });
        setActiveTab("dashboard");
      }
    } catch (e) { console.error(e); }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/menu/category`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...categoryForm, order: Number(categoryForm.order) })
      });
      if (res.ok) {
        showSuccess("Category created successfully!");
        setCategoryForm({ ...categoryForm, name: "", order: 0 });
        setActiveTab("dashboard");
      }
    } catch (e) { console.error(e); }
  };

  const handleCreateMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/menu/item`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...itemForm, price: Number(itemForm.price) })
      });
      if (res.ok) {
        showSuccess("Menu item created successfully!");
        setItemForm({ ...itemForm, name: "", description: "", price: "" });
        setActiveTab("dashboard");
      }
    } catch (e) { console.error(e); }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col md:flex-row">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-indigo-600 text-white p-4 flex justify-between items-center shadow-md z-20">
        <div className="flex items-center gap-2 font-bold text-lg">
          <Store size={24} /> IQZEEN Admin
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-indigo-700 rounded-lg">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        ${isMobileMenuOpen ? "block" : "hidden"} 
        md:block w-full md:w-64 bg-white border-r border-gray-200 flex-shrink-0 md:h-screen md:sticky md:top-0 shadow-sm z-10
      `}>
        <div className="hidden md:flex p-6 border-b border-gray-100 items-center gap-3">
          <div className="bg-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center">
            <Store className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl text-gray-800">IQZEEN Admin</span>
        </div>
        
        <nav className="p-4 flex flex-col gap-2">
          <button onClick={() => { setActiveTab("dashboard"); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === "dashboard" ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"}`}>
            <List size={20} /> Dashboard
          </button>
          <button onClick={() => { setActiveTab("add-restaurant"); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === "add-restaurant" ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"}`}>
            <Plus size={20} /> Add Restaurant
          </button>
          <button onClick={() => { setActiveTab("add-category"); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === "add-category" ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"}`}>
            <LayoutGrid size={20} /> Add Category
          </button>
          <button onClick={() => { setActiveTab("add-item"); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === "add-item" ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"}`}>
            <ChefHat size={20} /> Add Menu Item
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        
        {/* Success Alert */}
        {successMsg && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-3 shadow-sm">
            <span className="text-xl">✅</span>
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {/* --- DASHBOARD TAB --- */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Overview</h1>
            
            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                <div className="bg-indigo-100 text-indigo-600 p-4 rounded-full"><Store size={28} /></div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Restaurants</p>
                  <p className="text-3xl font-bold text-gray-900">{restaurants.length}</p>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-800 pt-4 border-t border-gray-200">Active Restaurants</h2>
            
            {/* Restaurant Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {restaurants.map(r => (
                <div key={r.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-5 border-b border-gray-100 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl">
                      {r.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 leading-tight">{r.name}</h3>
                      <p className="text-xs text-gray-500 font-mono mt-1">/{r.slug}</p>
                    </div>
                  </div>
                  <div className="p-5 space-y-3 flex-1 bg-gray-50/50">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail size={14} className="text-gray-400" /> <span className="truncate">{r.email || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone size={14} className="text-gray-400" /> <span>{r.phone || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Briefcase size={14} className="text-gray-400" /> <span>{r.gstNumber || "No GST"}</span>
                    </div>
                  </div>
                  <div className="p-4 border-t border-gray-100 bg-white">
                    <Link href={`/dashboard/${r.slug}`} className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors">
                      Open Owner Portal <ExternalLink size={16} />
                    </Link>
                  </div>
                </div>
              ))}

              {restaurants.length === 0 && (
                <div className="col-span-full py-16 text-center bg-white border border-gray-200 border-dashed rounded-xl">
                  <Store size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 font-medium">No restaurants onboarded yet.</p>
                  <button onClick={() => setActiveTab("add-restaurant")} className="text-indigo-600 font-semibold mt-2 hover:underline">Add one now</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- ADD RESTAURANT TAB --- */}
        {activeTab === "add-restaurant" && (
          <div className="max-w-3xl">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Onboard New Restaurant</h1>
            <form onSubmit={handleCreateRestaurant} className="bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Restaurant Name *</label>
                  <input required type="text" value={restaurantForm.name} onChange={e => setRestaurantForm({...restaurantForm, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Shaan Restaurant" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">URL Slug *</label>
                  <input required type="text" value={restaurantForm.slug} onChange={e => setRestaurantForm({...restaurantForm, slug: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm" placeholder="shaan-restaurant" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address *</label>
                  <input required type="email" value={restaurantForm.email} onChange={e => setRestaurantForm({...restaurantForm, email: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="admin@shaan.com" />
                </div>

                <div className="col-span-1 md:col-span-2 pt-4 border-t border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800">Contact & Payments</h3>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                  <input type="text" value={restaurantForm.phone} onChange={e => setRestaurantForm({...restaurantForm, phone: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">WhatsApp Number</label>
                  <input type="text" value={restaurantForm.whatsappNumber} onChange={e => setRestaurantForm({...restaurantForm, whatsappNumber: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">UPI ID for Payments</label>
                  <input type="text" value={restaurantForm.upiId} onChange={e => setRestaurantForm({...restaurantForm, upiId: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="merchant@upi" />
                </div>

                <div className="col-span-1 md:col-span-2 pt-4 border-t border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800">Legal Details</h3>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Owner Name</label>
                  <input type="text" value={restaurantForm.ownerName} onChange={e => setRestaurantForm({...restaurantForm, ownerName: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">GST Number</label>
                  <input type="text" value={restaurantForm.gstNumber} onChange={e => setRestaurantForm({...restaurantForm, gstNumber: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none uppercase font-mono text-sm" />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">FSSAI Certificate No.</label>
                  <input type="text" value={restaurantForm.fssaiCertificate} onChange={e => setRestaurantForm({...restaurantForm, fssaiCertificate: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm" />
                </div>
              </div>

              <div className="pt-6">
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-lg">
                  Save Restaurant
                </button>
              </div>
            </form>
          </div>
        )}

        {/* --- ADD CATEGORY TAB --- */}
        {activeTab === "add-category" && (
          <div className="max-w-xl">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Create Menu Category</h1>
            <form onSubmit={handleCreateCategory} className="bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Select Restaurant *</label>
                <select required value={categoryForm.restaurantId} onChange={e => setCategoryForm({...categoryForm, restaurantId: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                  <option value="">-- Choose Restaurant --</option>
                  {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category Name *</label>
                <input required type="text" value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Starters" />
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                Save Category
              </button>
            </form>
          </div>
        )}

        {/* --- ADD ITEM TAB --- */}
        {activeTab === "add-item" && (
          <div className="max-w-2xl">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Add Menu Item</h1>
            <form onSubmit={handleCreateMenuItem} className="bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Select Restaurant *</label>
                  <select required value={itemForm.restaurantId} onChange={e => { setItemForm({...itemForm, restaurantId: e.target.value, categoryId: ""}); fetchCategories(e.target.value); }} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                    <option value="">-- Choose Restaurant --</option>
                    {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Select Category *</label>
                  <select required disabled={!itemForm.restaurantId} value={itemForm.categoryId} onChange={e => setItemForm({...itemForm, categoryId: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-white disabled:bg-gray-100">
                    <option value="">-- Choose Category --</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Item Name *</label>
                  <input required type="text" value={itemForm.name} onChange={e => setItemForm({...itemForm, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Paneer Tikka" />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                  <textarea value={itemForm.description} onChange={e => setItemForm({...itemForm, description: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" rows={3} placeholder="A short description of the dish..."></textarea>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Price (₹) *</label>
                  <input required type="number" min="0" step="0.01" value={itemForm.price} onChange={e => setItemForm({...itemForm, price: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Dietary Type</label>
                  <select value={itemForm.type} onChange={e => setItemForm({...itemForm, type: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                    <option value="veg">Vegetarian (Veg)</option>
                    <option value="non-veg">Non-Vegetarian (Non-Veg)</option>
                    <option value="vegan">Vegan</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-4">
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                  Save Menu Item
                </button>
              </div>
            </form>
          </div>
        )}

      </main>
    </div>
  );
}
