import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { handler as createOrderHandler } from '../src/handlers/createOrder';
import { handler as deleteOrderHandler } from '../src/handlers/deleteOrder';
import { handler as getOrderHandler } from '../src/handlers/getOrder';
import { OrderService } from '../src/services/orderService';
import { Order } from '../src/types/order';

jest.mock('../src/lib/container');

import { getOrderService } from '../src/lib/container';

const mockGetOrderService = getOrderService as jest.MockedFunction<typeof getOrderService>;

describe('handlers', () => {
  const mockOrder: Order = {
    id: 'order-1',
    kitchenId: 'kitchen-1',
    items: [{ name: 'Tomatoes', quantity: 5, unit: 'kg' }],
    deliveryDate: '2026-07-15T09:00:00.000Z',
    deliveryAddress: '12 Kitchen Lane, London',
    status: 'PENDING',
    createdAt: '2026-07-06T10:00:00.000Z',
    updatedAt: '2026-07-06T10:00:00.000Z',
  };

  let service: jest.Mocked<OrderService>;

  beforeEach(() => {
    service = {
      createOrder: jest.fn(),
      getOrder: jest.fn(),
      listOrders: jest.fn(),
      confirmOrder: jest.fn(),
      deleteOrder: jest.fn(),
    } as unknown as jest.Mocked<OrderService>;

    mockGetOrderService.mockReturnValue(service);
  });

  describe('createOrder', () => {
    it('returns 201 on success', async () => {
      service.createOrder.mockResolvedValue(mockOrder);

      const event = {
        body: JSON.stringify({
          items: [{ name: 'Tomatoes', quantity: 5, unit: 'kg' }],
          deliveryDate: '2026-07-15T09:00:00.000Z',
          deliveryAddress: '12 Kitchen Lane, London',
        }),
        requestContext: {
          authorizer: {
            jwt: {
              claims: {
                'custom:kitchen_id': 'kitchen-1',
                email: 'chef@kitchen.com',
              },
            },
          },
        },
      } as unknown as APIGatewayProxyEventV2;

      const result = (await createOrderHandler(event)) as APIGatewayProxyStructuredResultV2;
      expect(result.statusCode).toBe(201);
      expect(JSON.parse(result.body!)).toEqual(mockOrder);
    });

    it('returns 400 for invalid JSON', async () => {
      const event = {
        body: '{invalid',
        requestContext: {},
      } as APIGatewayProxyEventV2;
      const result = (await createOrderHandler(event)) as APIGatewayProxyStructuredResultV2;
      expect(result.statusCode).toBe(400);
    });
  });

  describe('getOrder', () => {
    it('returns 200 when order exists', async () => {
      service.getOrder.mockResolvedValue(mockOrder);

      const event = {
        pathParameters: { id: 'order-1' },
      } as unknown as APIGatewayProxyEventV2;

      const result = (await getOrderHandler(event)) as APIGatewayProxyStructuredResultV2;
      expect(result.statusCode).toBe(200);
    });

    it('returns 404 when order missing', async () => {
      service.getOrder.mockResolvedValue(null);

      const event = {
        pathParameters: { id: 'missing' },
      } as unknown as APIGatewayProxyEventV2;

      const result = (await getOrderHandler(event)) as APIGatewayProxyStructuredResultV2;
      expect(result.statusCode).toBe(404);
    });
  });

  describe('deleteOrder', () => {
    it('returns 204 on success', async () => {
      service.deleteOrder.mockResolvedValue(undefined);

      const event = {
        pathParameters: { id: 'order-1' },
      } as unknown as APIGatewayProxyEventV2;

      const result = (await deleteOrderHandler(event)) as APIGatewayProxyStructuredResultV2;
      expect(result.statusCode).toBe(204);
      expect(service.deleteOrder).toHaveBeenCalledWith('order-1');
    });

    it('returns 404 when order missing', async () => {
      service.deleteOrder.mockRejectedValue(new Error('Order not found: missing'));

      const event = {
        pathParameters: { id: 'missing' },
      } as unknown as APIGatewayProxyEventV2;

      const result = (await deleteOrderHandler(event)) as APIGatewayProxyStructuredResultV2;
      expect(result.statusCode).toBe(404);
    });

    it('returns 400 when id missing', async () => {
      const event = {
        pathParameters: {},
      } as unknown as APIGatewayProxyEventV2;

      const result = (await deleteOrderHandler(event)) as APIGatewayProxyStructuredResultV2;
      expect(result.statusCode).toBe(400);
    });
  });
});
