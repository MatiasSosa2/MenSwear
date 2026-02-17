export type CartItem = {
  id: string; // slug + size + color
  slug: string;
  title: string;
  price: number;
  size: "S" | "M" | "L" | "XL" | "XXL";
  color?: string; // color name
  image: string;
  qty: number;
};

const STORAGE_KEY = "cart_items";
const EVENT_NAME = "cart-updated";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as CartItem[];
    return [];
  } catch {
    return [];
  }
}

export function setCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  } catch {
    // ignore
  }
}

export function addToCart(item: CartItem): void {
  const items = getCart();
  const existingIdx = items.findIndex((it) => it.id === item.id);
  if (existingIdx >= 0) {
    items[existingIdx].qty += item.qty;
  } else {
    items.push(item);
  }
  setCart(items);
}

export function clearCart(): void {
  setCart([]);
}

export function removeFromCart(id: string): void {
  const items = getCart();
  const next = items.filter((it) => it.id !== id);
  setCart(next);
}

export function onCartUpdated(handler: () => void): () => void {
  const bound = () => handler();
  window.addEventListener(EVENT_NAME, bound);
  return () => window.removeEventListener(EVENT_NAME, bound);
}
