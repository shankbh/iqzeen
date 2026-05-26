// ─── Types ────────────────────────────────────────────────────────────────────
export type WeatherCondition = 'rainy' | 'hot' | 'cold' | 'pleasant' | 'foggy' | 'unknown';
export type MoodType = 'happy' | 'relaxed' | 'tired' | 'celebrating';
export type CravingType = 'spicy' | 'light' | 'sweet' | 'hearty';
export type HungerType = 'starving' | 'normal' | 'snack';
export type DietFilter = 'veg' | 'jain' | 'gluten-free' | 'dairy-free';

export interface WeatherData {
  condition: WeatherCondition;
  temp: number;
  description: string;
  emoji: string;
  wmoCode: number;
}

export interface MoodProfile {
  mood: MoodType;
  craving: CravingType;
  hunger: HungerType;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  category: { id: string; name: string; order: number };
}

// ─── Weather Fetching ─────────────────────────────────────────────────────────
function wmoToCondition(code: number, temp: number): WeatherCondition {
  if (code === 0 || code === 1) return temp > 29 ? 'hot' : temp < 20 ? 'cold' : 'pleasant';
  if (code === 2 || code === 3) return temp > 28 ? 'hot' : 'pleasant';
  if (code === 45 || code === 48) return 'foggy';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95) return 'rainy';
  if (code >= 71 && code <= 77) return 'cold';
  return 'unknown';
}

const WEATHER_META: Record<WeatherCondition, { emoji: string; label: string; foodMood: string }> = {
  rainy:    { emoji: '🌧️', label: 'Rainy & Cool',    foodMood: 'Perfect for hot snacks & chai' },
  hot:      { emoji: '☀️', label: 'Hot & Sunny',     foodMood: 'Stay cool with cold drinks' },
  cold:     { emoji: '🌡️', label: 'Cold Evening',    foodMood: 'Warm up with hearty food' },
  pleasant: { emoji: '⛅', label: 'Pleasant Weather', foodMood: 'Great day for anything you fancy' },
  foggy:    { emoji: '🌫️', label: 'Misty & Foggy',  foodMood: 'Cosy snacks & hot beverages' },
  unknown:  { emoji: '🌤️', label: 'Clear Skies',     foodMood: 'Great day to eat well' },
};

export async function fetchWeather(): Promise<WeatherData> {
  try {
    const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 6000, maximumAge: 300000 })
    );
    const { latitude, longitude } = pos.coords;
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`,
      { cache: 'no-store' }
    );
    const data = await res.json();
    const temp: number = data.current.temperature_2m;
    const code: number = data.current.weather_code;
    const condition = wmoToCondition(code, temp);
    const meta = WEATHER_META[condition];
    return {
      condition, temp, wmoCode: code,
      emoji: meta.emoji,
      description: `${meta.label} · ${Math.round(temp)}°C — ${meta.foodMood}`,
    };
  } catch {
    return {
      condition: 'pleasant', temp: 27, wmoCode: 1,
      emoji: '⛅',
      description: 'Bangalore · 27°C — Great day to eat well',
    };
  }
}

// ─── Item Tagging ─────────────────────────────────────────────────────────────
function tagItem(item: MenuItem): Set<string> {
  const n = item.name.toLowerCase();
  const d = (item.description ?? '').toLowerCase();
  const cat = item.category.name.toLowerCase();
  const tags = new Set<string>();

  if (cat.includes('appetizer') || cat.includes('starter') || cat.includes('snack')) tags.add('appetizer');
  if (cat.includes('main') || cat.includes('curry') || cat.includes('biryani') || cat.includes('rice')) tags.add('main');
  if (cat.includes('beverage') || cat.includes('drink') || cat.includes('juice')) tags.add('beverage');
  if (cat.includes('dessert') || cat.includes('sweet')) tags.add('dessert');
  if (cat.includes('bread') || cat.includes('roti')) tags.add('bread');

  // Hot / cold
  const hotWords = ['soup', 'chai', 'tea', 'coffee', 'hot', 'rasam', 'sambar', 'kadha'];
  const coldWords = ['lassi', 'iced', 'cold', 'juice', 'shake', 'soda', 'smoothie', 'lemonade', 'mojito', 'cooler'];
  if (hotWords.some(k => n.includes(k) || d.includes(k))) tags.add('hot');
  if (coldWords.some(k => n.includes(k) || d.includes(k))) tags.add('cold');

  // Spice
  const spicyWords = ['tikka', 'masala', 'chilli', 'pepper', 'vindaloo', 'achari', 'hariyali', 'spicy', 'szechuan'];
  const mildWords  = ['butter', 'cream', 'korma', 'makhani', 'malai', 'mild', 'white'];
  if (spicyWords.some(k => n.includes(k))) tags.add('spicy');
  if (mildWords.some(k => n.includes(k))) tags.add('mild');

  // Sweet
  if (['gulab', 'halwa', 'kheer', 'payasam', 'mango', 'lassi', 'sweet', 'chocolate', 'ice cream', 'pudding', 'rasgulla'].some(k => n.includes(k))) tags.add('sweet');

  // Hearty / filling
  if (['biryani', 'rice', 'pulao', 'chicken', 'mutton', 'fish', 'prawn', 'paneer', 'lamb', 'dal', 'thali'].some(k => n.includes(k))) tags.add('hearty');

  // Rainy day comfort foods
  if (['roll', 'pakora', 'bhaji', 'vada', 'spring', 'crispy', 'fried', 'samosa'].some(k => n.includes(k)) || tags.has('hot')) tags.add('rainy-day');

  // Hot-day refresh
  if (tags.has('cold') || tags.has('sweet')) tags.add('hot-day');

  // Light bites
  if (tags.has('beverage') || tags.has('appetizer') || tags.has('dessert')) tags.add('light');

  // Energising
  if (['tea', 'coffee', 'chai', 'lassi', 'juice', 'lemon'].some(k => n.includes(k))) tags.add('energising');

  // Celebration
  if (['special', 'premium', 'signature', 'platter', 'biryani', 'kebab', 'feast'].some(k => n.includes(k))) tags.add('celebration');

  return tags;
}

// ─── Scoring Engine ───────────────────────────────────────────────────────────
export function scoreItems(items: MenuItem[], mood: MoodProfile, weather: WeatherData) {
  return items.map(item => {
    const tags = tagItem(item);
    let score = 0;

    // ── Weather ──
    switch (weather.condition) {
      case 'rainy':
        if (tags.has('rainy-day')) score += 5;
        if (tags.has('hot')) score += 4;
        if (tags.has('appetizer')) score += 2;
        if (tags.has('cold')) score -= 3;
        break;
      case 'hot':
        if (tags.has('cold')) score += 5;
        if (tags.has('hot-day')) score += 4;
        if (tags.has('beverage')) score += 3;
        if (tags.has('hot') && !tags.has('beverage')) score -= 2;
        break;
      case 'cold':
        if (tags.has('hot')) score += 5;
        if (tags.has('hearty')) score += 4;
        if (tags.has('spicy')) score += 3;
        if (tags.has('cold')) score -= 3;
        break;
      case 'foggy':
        if (tags.has('hot')) score += 4;
        if (tags.has('appetizer')) score += 2;
        break;
      case 'pleasant':
        if (tags.has('main')) score += 2;
        score += 1;
        break;
    }

    // ── Mood ──
    switch (mood.mood) {
      case 'happy':
        if (tags.has('celebration')) score += 3;
        if (tags.has('sweet')) score += 2;
        break;
      case 'tired':
        if (tags.has('energising')) score += 5;
        if (tags.has('light')) score += 3;
        if (tags.has('cold')) score += 2;
        if (tags.has('hearty')) score -= 2;
        break;
      case 'celebrating':
        if (tags.has('celebration')) score += 5;
        if (tags.has('main')) score += 3;
        if (tags.has('hearty')) score += 2;
        break;
      case 'relaxed':
        if (tags.has('mild')) score += 3;
        if (tags.has('light')) score += 2;
        if (tags.has('beverage')) score += 2;
        break;
    }

    // ── Craving ──
    switch (mood.craving) {
      case 'spicy':
        if (tags.has('spicy')) score += 5;
        break;
      case 'light':
        if (tags.has('light')) score += 4;
        if (tags.has('beverage')) score += 3;
        if (tags.has('hearty') && !tags.has('light')) score -= 2;
        break;
      case 'sweet':
        if (tags.has('sweet')) score += 6;
        if (tags.has('dessert')) score += 4;
        break;
      case 'hearty':
        if (tags.has('hearty')) score += 5;
        if (tags.has('main')) score += 3;
        if (tags.has('bread')) score += 2;
        break;
    }

    // ── Hunger ──
    switch (mood.hunger) {
      case 'starving':
        if (tags.has('main')) score += 3;
        if (tags.has('hearty')) score += 3;
        break;
      case 'snack':
        if (tags.has('appetizer')) score += 4;
        if (tags.has('beverage')) score += 3;
        if (tags.has('hearty') && !tags.has('appetizer')) score -= 3;
        break;
      case 'normal':
        score += 1;
        break;
    }

    return { item, score, tags };
  });
}

export function getRecommendations(
  items: MenuItem[],
  mood: MoodProfile,
  weather: WeatherData,
  count = 4,
): { items: MenuItem[]; reason: string } {
  const scored = scoreItems(items, mood, weather)
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score);

  const top = scored.slice(0, count).map(s => s.item);

  const reasons: string[] = [];
  if (weather.condition === 'rainy') reasons.push('perfect for this rainy weather 🌧️');
  else if (weather.condition === 'hot') reasons.push('great to beat the heat ☀️');
  else if (weather.condition === 'cold') reasons.push('ideal for this cold evening 🌡️');
  if (mood.mood === 'tired') reasons.push('to energise you');
  if (mood.mood === 'celebrating') reasons.push('to celebrate in style 🎉');
  if (mood.craving === 'spicy') reasons.push('matching your spicy craving 🌶️');
  if (mood.craving === 'sweet') reasons.push('for your sweet tooth 🍮');

  const reason = reasons.length > 0 ? reasons.join(' & ') : 'picked just for your vibe today ✨';

  return { items: top.length > 0 ? top : items.slice(0, count), reason };
}

// ─── Diet Filtering ───────────────────────────────────────────────────────────
const NON_VEG_WORDS = ['chicken', 'fish', 'prawn', 'mutton', 'beef', 'pork', 'egg', 'meat', 'lamb', 'crab', 'shrimp', 'seafood'];
const ONION_GARLIC_WORDS = ['onion', 'garlic', 'pyaaz', 'lahsun'];
const GLUTEN_WORDS = ['bread', 'naan', 'roti', 'paratha', 'pasta', 'pizza', 'flour', 'wheat', 'puri', 'kulcha'];
const DAIRY_WORDS = ['milk', 'cream', 'butter', 'cheese', 'paneer', 'ghee', 'curd', 'lassi', 'yogurt', 'kheer', 'makhani', 'malai'];

export function applyDietFilter(items: MenuItem[], filters: Set<DietFilter>): MenuItem[] {
  if (filters.size === 0) return items;

  return items.filter(item => {
    const n = item.name.toLowerCase();
    const d = (item.description ?? '').toLowerCase();
    const combined = `${n} ${d}`;

    if (filters.has('veg') && NON_VEG_WORDS.some(w => combined.includes(w))) return false;
    if (filters.has('jain') && (NON_VEG_WORDS.some(w => combined.includes(w)) || ONION_GARLIC_WORDS.some(w => combined.includes(w)))) return false;
    if (filters.has('gluten-free') && GLUTEN_WORDS.some(w => combined.includes(w))) return false;
    if (filters.has('dairy-free') && DAIRY_WORDS.some(w => combined.includes(w))) return false;

    return true;
  });
}

// ─── Repeat Last Order ────────────────────────────────────────────────────────
const LAST_ORDER_KEY = 'zeen_last_order';

export function saveLastOrder(restaurantId: string, items: { id: string; name: string; price: number; quantity: number }[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LAST_ORDER_KEY, JSON.stringify({ restaurantId, items, at: Date.now() }));
}

export function getLastOrder(restaurantId: string) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LAST_ORDER_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    // Only within last 7 days and same restaurant
    if (data.restaurantId !== restaurantId) return null;
    if (Date.now() - data.at > 7 * 24 * 60 * 60 * 1000) return null;
    return data.items as { id: string; name: string; price: number; quantity: number }[];
  } catch {
    return null;
  }
}
