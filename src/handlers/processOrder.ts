import { SQSEvent } from 'aws-lambda';
import { getOrderService } from '../lib/container';
import { OrderPlacedEvent } from '../types/order';

export async function handler(event: SQSEvent): Promise<void> {
  const service = getOrderService();

  for (const record of event.Records) {
    try {
      const body = JSON.parse(record.body);
      const message = typeof body.Message === 'string' ? JSON.parse(body.Message) : body;
      const orderEvent = message as OrderPlacedEvent;

      if (orderEvent.eventType !== 'OrderPlaced' || !orderEvent.orderId) {
        console.warn('Skipping unknown message format:', record.body);
        continue;
      }

      console.log(`Processing order ${orderEvent.orderId}`);
      await service.confirmOrder(orderEvent.orderId);
      console.log(`Order ${orderEvent.orderId} confirmed`);
    } catch (error) {
      console.error('Failed to process SQS record:', error);
      throw error;
    }
  }
}
