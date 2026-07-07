import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { Order } from '../types/order';

export interface OrderRepository {
  save(order: Order): Promise<Order>;
  findById(id: string): Promise<Order | null>;
  findAll(): Promise<Order[]>;
  updateStatus(id: string, status: Order['status']): Promise<Order>;
  delete(id: string): Promise<void>;
}

export class DynamoOrderRepository implements OrderRepository {
  constructor(
    private readonly client: DynamoDBDocumentClient,
    private readonly tableName: string
  ) {}

  async save(order: Order): Promise<Order> {
    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: order,
      })
    );
    return order;
  }

  async findById(id: string): Promise<Order | null> {
    const result = await this.client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { id },
      })
    );
    return (result.Item as Order | undefined) ?? null;
  }

  async findAll(): Promise<Order[]> {
    const result = await this.client.send(
      new ScanCommand({ TableName: this.tableName })
    );
    return (result.Items ?? []) as Order[];
  }

  async updateStatus(id: string, status: Order['status']): Promise<Order> {
    const now = new Date().toISOString();
    const result = await this.client.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { id },
        UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: {
          ':status': status,
          ':updatedAt': now,
        },
        ReturnValues: 'ALL_NEW',
      })
    );
    return result.Attributes as Order;
  }

  async delete(id: string): Promise<void> {
    await this.client.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: { id },
      })
    );
  }
}
