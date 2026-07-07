import type { OrderItem } from '../types/order';

export interface IngredientPricing {
  perKg?: number;
  perItem?: number;
}

export const INGREDIENT_PRICES: Record<string, IngredientPricing> = {
  Tomatoes: { perKg: 2.4 },
  Potatoes: { perKg: 1.1 },
  Onions: { perKg: 0.95 },
  'Chicken breast': { perKg: 8.5 },
  'Basmati rice': { perKg: 2.8 },
  'Olive oil': { perItem: 6.5 },
  'Fresh basil': { perItem: 1.8 },
  Mozzarella: { perKg: 7.2 },
  Spinach: { perKg: 3.1 },
  Garlic: { perKg: 4.5 },
};

const DELIVERY_FEE = 4.5;
const VAT_RATE = 0.2;

export function formatGbp(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);
}

export function calculateLineTotal(item: Pick<OrderItem, 'name' | 'quantity' | 'unit'>): number {
  const pricing = INGREDIENT_PRICES[item.name];
  if (!pricing) {
    return 0;
  }

  if (item.unit === 'items' && pricing.perItem) {
    return item.quantity * pricing.perItem;
  }

  if (pricing.perKg) {
    const kg = item.unit === 'g' ? item.quantity / 1000 : item.quantity;
    return kg * pricing.perKg;
  }

  if (pricing.perItem) {
    return item.quantity * pricing.perItem;
  }

  return 0;
}

export function calculateOrderTotals(item: Pick<OrderItem, 'name' | 'quantity' | 'unit'>) {
  const subtotal = calculateLineTotal(item);
  const delivery = subtotal > 0 ? DELIVERY_FEE : 0;
  const vat = (subtotal + delivery) * VAT_RATE;
  const total = subtotal + delivery + vat;

  return { subtotal, delivery, vat, total };
}

export function unitPriceLabel(name: string, unit: string): string {
  const pricing = INGREDIENT_PRICES[name];
  if (!pricing) {
    return 'Price on request';
  }

  if (unit === 'items' && pricing.perItem) {
    return `${formatGbp(pricing.perItem)} / item`;
  }

  if (pricing.perKg) {
    return `${formatGbp(pricing.perKg)} / kg`;
  }

  if (pricing.perItem) {
    return `${formatGbp(pricing.perItem)} / item`;
  }

  return 'Price on request';
}
