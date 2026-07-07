export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'FAILED';
export type OrderUnit = 'g' | 'kg' | 'items';

export interface OrderItem {
  name: string;
  quantity: number;
  unit: OrderUnit | string;
}

export interface Order {
  id: string;
  kitchenId: string;
  items: OrderItem[];
  deliveryDate: string;
  deliveryAddress?: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  items: OrderItem[];
  deliveryDate: string;
  deliveryAddress: string;
}
