import { create } from "zustand";
import { CartItem, CartItemType, CartState } from "../types/cart";

function computeItemTotal(item: CartItem): number {
  const base = item.unitPrice * item.quantity;
  const addonsTotal =
    item.addons?.reduce((sum, addon) => sum + addon.price * item.quantity, 0) ?? 0;
  return base + addonsTotal;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  schedule: null,

  addOrUpdateItem: (itemInput) => {
    const { items } = get();
    const quantity = itemInput.quantity ?? 1;
    const keyMatches = (it: CartItem) =>
      it.id === itemInput.id &&
      it.type === itemInput.type &&
      it.packageId === itemInput.packageId;

    const existingIndex = items.findIndex(keyMatches);

    // If adding a product, clear any existing schedule (products don't need scheduling)
    if (itemInput.type === "product") {
      set({ schedule: null });
    }

    if (existingIndex === -1) {
      const newItem: CartItem = {
        ...itemInput,
        quantity,
        addons: itemInput.addons ?? [],
      };
      set({ items: [...items, newItem] });
    } else {
      const next = [...items];
      const existing = next[existingIndex];
      next[existingIndex] = {
        ...existing,
        ...itemInput,
        quantity: quantity,
        addons: itemInput.addons ?? existing.addons ?? [],
      };
      set({ items: next });
    }
  },

  removeItem: (id, type, packageId) => {
    const { items } = get();
    set({
      items: items.filter(
        (it) =>
          !(
            it.id === id &&
            it.type === type &&
            (packageId === undefined ? it.packageId == null : it.packageId === packageId)
          )
      ),
    });
  },

  updateQuantity: (id, type, quantity, packageId) => {
    if (quantity <= 0) {
      const { removeItem } = get();
      removeItem(id, type, packageId);
      return;
    }

    const { items } = get();
    const matches = (it: CartItem) =>
      it.id === id &&
      it.type === type &&
      (packageId === undefined ? it.packageId == null : it.packageId === packageId);
    set({
      items: items.map((it) => (matches(it) ? { ...it, quantity } : it)),
    });
  },

  clearCart: () => {
    set({ items: [] });
  },

  setSchedule: (schedule) => {
    set({ schedule });
  },

  getTotal: () => {
    const { items } = get();
    return items.reduce((sum, item) => sum + computeItemTotal(item), 0);
  },
  canAdd: (type) => {
    const { items } = get();
    if (items.length === 0) return true;
    // Strict isolation: all items must have the same type
    return items.every((it) => it.type === type);
  },
}));
