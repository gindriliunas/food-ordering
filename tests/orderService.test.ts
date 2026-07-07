import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { OrderRepository } from '../src/repositories/orderRepository';
import { OrderService } from '../src/services/orderService';
import { Order } from '../src/types/order';

jest.mock('@aws-sdk/client-sns');
jest.mock('uuid', () => ({ v4: () => 'test-order-id' }));

describe('OrderService', () => {
  const mockOrder: Order = {
    id: 'test-order-id',
    kitchenId: 'kitchen-1',
    items: [{ name: 'Tomatoes', quantity: 5, unit: 'kg' }],
    deliveryDate: '2026-07-15T09:00:00.000Z',
    deliveryAddress: '12 Kitchen Lane, London',
    status: 'PENDING',
    createdAt: '2026-07-06T10:00:00.000Z',
    updatedAt: '2026-07-06T10:00:00.000Z',
  };

  let repository: jest.Mocked<OrderRepository>;
  let snsClient: jest.Mocked<SNSClient>;
  let service: OrderService;

  beforeEach(() => {
    repository = {
      save: jest.fn().mockResolvedValue(mockOrder),
      findById: jest.fn(),
      findAll: jest.fn(),
      updateStatus: jest.fn(),
      delete: jest.fn(),
    };

    snsClient = {
      send: jest.fn().mockResolvedValue({}),
    } as unknown as jest.Mocked<SNSClient>;

    service = new OrderService(repository, snsClient, 'arn:aws:sns:eu-west-2:123456789012:orders');
  });

  describe('createOrder', () => {
    it('saves order and publishes OrderPlaced event', async () => {
      const result = await service.createOrder(
        {
          items: [{ name: 'Tomatoes', quantity: 5, unit: 'kg' }],
          deliveryDate: '2026-07-15T09:00:00.000Z',
          deliveryAddress: '12 Kitchen Lane, London',
        },
        'kitchen-1'
      );

      expect(result.status).toBe('PENDING');
      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(snsClient.send).toHaveBeenCalledWith(expect.any(PublishCommand));
    });
  });

  describe('getOrder', () => {
    it('returns order from repository', async () => {
      repository.findById.mockResolvedValue(mockOrder);
      const result = await service.getOrder('test-order-id');
      expect(result).toEqual(mockOrder);
    });
  });

  describe('confirmOrder', () => {
    it('updates status to CONFIRMED', async () => {
      repository.findById.mockResolvedValue(mockOrder);
      repository.updateStatus.mockResolvedValue({ ...mockOrder, status: 'CONFIRMED' });

      const result = await service.confirmOrder('test-order-id');
      expect(result.status).toBe('CONFIRMED');
      expect(repository.updateStatus).toHaveBeenCalledWith('test-order-id', 'CONFIRMED');
    });

    it('returns existing order if already confirmed', async () => {
      const confirmed = { ...mockOrder, status: 'CONFIRMED' as const };
      repository.findById.mockResolvedValue(confirmed);

      const result = await service.confirmOrder('test-order-id');
      expect(result.status).toBe('CONFIRMED');
      expect(repository.updateStatus).not.toHaveBeenCalled();
    });

    it('throws when order not found', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.confirmOrder('missing')).rejects.toThrow('Order not found');
    });
  });

  describe('deleteOrder', () => {
    it('deletes order when it exists', async () => {
      repository.findById.mockResolvedValue(mockOrder);
      repository.delete.mockResolvedValue(undefined);

      await service.deleteOrder('test-order-id');

      expect(repository.delete).toHaveBeenCalledWith('test-order-id');
    });

    it('throws when order not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.deleteOrder('missing')).rejects.toThrow('Order not found');
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });
});
