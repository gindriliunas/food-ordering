import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { v4 as uuidv4 } from 'uuid';
import { OrderRepository } from '../repositories/orderRepository';
import {
  CreateOrderRequest,
  Order,
  OrderPlacedEvent,
} from '../types/order';
import { ValidationError, validateCreateRequest } from '../lib/validation';

export class OrderService {
  constructor(
    private readonly repository: OrderRepository,
    private readonly snsClient: SNSClient,
    private readonly topicArn: string
  ) {}

  async createOrder(
    request: CreateOrderRequest,
    kitchenId: string
  ): Promise<Order> {
    const validated = validateCreateRequest(request);
    const now = new Date().toISOString();

    const order: Order = {
      id: uuidv4(),
      kitchenId: validated.kitchenId ?? kitchenId,
      items: validated.items,
      deliveryDate: validated.deliveryDate,
      deliveryAddress: validated.deliveryAddress,
      status: 'PENDING',
      createdAt: now,
      updatedAt: now,
    };

    const saved = await this.repository.save(order);
    await this.publishOrderPlaced(saved);
    return saved;
  }

  async getOrder(id: string): Promise<Order | null> {
    return this.repository.findById(id);
  }

  async listOrders(): Promise<Order[]> {
    return this.repository.findAll();
  }

  async confirmOrder(id: string): Promise<Order> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error(`Order not found: ${id}`);
    }
    if (existing.status === 'CONFIRMED') {
      return existing;
    }
    return this.repository.updateStatus(id, 'CONFIRMED');
  }

  async deleteOrder(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error(`Order not found: ${id}`);
    }
    await this.repository.delete(id);
  }

  private async publishOrderPlaced(order: Order): Promise<void> {
    const event: OrderPlacedEvent = {
      eventType: 'OrderPlaced',
      orderId: order.id,
      kitchenId: order.kitchenId,
      items: order.items,
      deliveryDate: order.deliveryDate,
      deliveryAddress: order.deliveryAddress,
      timestamp: order.createdAt,
    };

    await this.snsClient.send(
      new PublishCommand({
        TopicArn: this.topicArn,
        Message: JSON.stringify(event),
        MessageAttributes: {
          eventType: {
            DataType: 'String',
            StringValue: 'OrderPlaced',
          },
        },
      })
    );
  }
}

export { ValidationError };
