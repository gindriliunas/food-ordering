import { OrdersApi } from '../src/services/ordersApi';
import type { CreateOrderPayload, Order } from '../src/types/order';

describe('OrdersApi', () => {
  const apiUrl = 'https://api.test.example.com';
  const token = 'test-token';
  const mockOrder: Order = {
    id: 'order-1',
    kitchenId: 'kitchen-1',
    items: [{ name: 'Tomatoes', quantity: 2, unit: 'kg' }],
    deliveryDate: '2026-07-20T09:00:00.000Z',
    deliveryAddress: '12 Kitchen Lane, London',
    status: 'PENDING',
    createdAt: '2026-07-15T10:00:00.000Z',
    updatedAt: '2026-07-15T10:00:00.000Z',
  };

  let fetchMock: jest.Mock;
  let api: OrdersApi;

  beforeEach(() => {
    fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
    api = new OrdersApi(token, apiUrl);
  });

  it('creates an order with auth headers', async () => {
    const payload: CreateOrderPayload = {
      items: mockOrder.items,
      deliveryDate: mockOrder.deliveryDate,
      deliveryAddress: mockOrder.deliveryAddress!,
    };

    fetchMock.mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => mockOrder,
    });

    await expect(api.createOrder(payload)).resolves.toEqual(mockOrder);

    expect(fetchMock).toHaveBeenCalledWith(`${apiUrl}/orders`, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  });

  it('lists orders and unwraps the response envelope', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ orders: [mockOrder] }),
    });

    await expect(api.listOrders()).resolves.toEqual([mockOrder]);
    expect(fetchMock).toHaveBeenCalledWith(
      `${apiUrl}/orders`,
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: `Bearer ${token}`,
        }),
      })
    );
  });

  it('gets a single order by id', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockOrder,
    });

    await expect(api.getOrder('order-1')).resolves.toEqual(mockOrder);
    expect(fetchMock).toHaveBeenCalledWith(
      `${apiUrl}/orders/order-1`,
      expect.any(Object)
    );
  });

  it('deletes an order and handles 204 with no body', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 204,
      json: async () => {
        throw new Error('no body');
      },
    });

    await expect(api.deleteOrder('order-1')).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(`${apiUrl}/orders/order-1`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  });

  it('throws the API error message when the request fails', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Invalid delivery date' }),
    });

    await expect(api.getOrder('order-1')).rejects.toThrow('Invalid delivery date');
  });

  it('throws a status fallback when the error body has no message', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    await expect(api.getOrder('order-1')).rejects.toThrow('Request failed with 500');
  });
});
