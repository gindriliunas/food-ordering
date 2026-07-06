export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'FAILED';

export interface OrderItem {
  name: string;
  quantity: number;
  unit: string;
}

export interface Order {
  id: string;
  kitchenId: string;
  items: OrderItem[];
  deliveryDate: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  items: OrderItem[];
  deliveryDate: string;
}
