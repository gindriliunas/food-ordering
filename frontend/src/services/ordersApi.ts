import type { CreateOrderPayload, Order } from '../types/order';

const defaultApiUrl = 'https://9qh6gssgf0.execute-api.eu-west-2.amazonaws.com';

export class OrdersApi {
  constructor(
    private readonly token: string,
    private readonly apiUrl = import.meta.env.VITE_API_URL || defaultApiUrl
  ) {}

  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    return this.request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async listOrders(): Promise<Order[]> {
    const response = await this.request<{ orders: Order[] }>('/orders');
    return response.orders;
  }

  async getOrder(id: string): Promise<Order> {
    return this.request<Order>(`/orders/${id}`);
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.apiUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...init.headers,
      },
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        body && typeof body.error === 'string'
          ? body.error
          : `Request failed with ${response.status}`;
      throw new Error(message);
    }

    return body as T;
  }
}
