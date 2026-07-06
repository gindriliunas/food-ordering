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

export interface CreateOrderRequest {
  items: OrderItem[];
  deliveryDate: string;
  kitchenId?: string;
}

export interface OrderPlacedEvent {
  eventType: 'OrderPlaced';
  orderId: string;
  kitchenId: string;
  items: OrderItem[];
  deliveryDate: string;
  timestamp: string;
}
