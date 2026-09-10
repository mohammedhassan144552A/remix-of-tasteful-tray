import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartExtra = { id: string; name: string; price: number };

export type CartItem = {
  key: string;
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  sizeId: string | null;
  sizeName: string | null;
  unitPrice: number;
  quantity: number;
  extras: CartExtra[];
  notes: string;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  ready: boolean;
  addItem: (item: Omit<CartItem, "key">) => void;
  updateItem: (key: string, item: Omit<CartItem, "key">) => void;
  removeItem: (key: string) => void;
  setQuantity: (key: string, qty: number) => void;
  clear: () => void;
};

const STORAGE_KEY = "mazzah.cart.v1";
const CartContext = createContext<CartContextValue | null>(null);

function itemKey(item: Omit<CartItem, "key">): string {
  const extras = [...item.extras.map((e) => e.id)].sort().join("+");
  return `${item.productId}|${item.sizeId ?? "-"}|${extras}|${item.notes.trim()}`;
}

export function lineTotal(item: CartItem): number {
  const extras = item.extras.reduce((sum, e) => sum + Number(e.price), 0);
  return (Number(item.unitPrice) + extras) * item.quantity;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* تجاهل سلة تالفة */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* التخزين ممتلئ */
    }
  }, [items, ready]);

  const addItem = useCallback((item: Omit<CartItem, "key">) => {
    const key = itemKey(item);
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) =>
          i.key === key ? { ...i, quantity: i.quantity + item.quantity } : i,
        );
      }
      return [...prev, { ...item, key }];
    });
  }, []);

  const updateItem = useCallback((key: string, item: Omit<CartItem, "key">) => {
    const nextKey = itemKey(item);
    setItems((prev) => {
      const without = prev.filter((i) => i.key !== key);
      const existing = without.find((i) => i.key === nextKey);
      if (existing) {
        return without.map((i) =>
          i.key === nextKey ? { ...i, quantity: i.quantity + item.quantity } : i,
        );
      }
      const index = prev.findIndex((i) => i.key === key);
      const next = [...without];
      next.splice(index < 0 ? next.length : index, 0, { ...item, key: nextKey });
      return next;
    });
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }, []);

  const setQuantity = useCallback((key: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.key !== key)
        : prev.map((i) => (i.key === key ? { ...i, quantity: Math.min(qty, 50) } : i)),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      ready,
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: items.reduce((sum, i) => sum + lineTotal(i), 0),
      addItem,
      updateItem,
      removeItem,
      setQuantity,
      clear,
    }),
    [items, ready, addItem, updateItem, removeItem, setQuantity, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
