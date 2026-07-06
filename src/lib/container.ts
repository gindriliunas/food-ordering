import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { SNSClient } from '@aws-sdk/client-sns';
import { DynamoOrderRepository } from '../repositories/orderRepository';
import { OrderService } from '../services/orderService';

let orderService: OrderService | null = null;

export function getOrderService(): OrderService {
  if (!orderService) {
    const tableName = process.env.ORDERS_TABLE_NAME;
    const topicArn = process.env.ORDER_EVENTS_TOPIC_ARN;

    if (!tableName || !topicArn) {
      throw new Error('Missing required environment variables');
    }

    const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
    const repository = new DynamoOrderRepository(dynamoClient, tableName);
    const snsClient = new SNSClient({});

    orderService = new OrderService(repository, snsClient, topicArn);
  }

  return orderService;
}
