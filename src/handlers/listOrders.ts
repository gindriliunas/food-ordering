import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getOrderService } from '../lib/container';
import { errorResponse, jsonResponse } from '../lib/response';

export async function handler(
  _event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  try {
    const orders = await getOrderService().listOrders();
    return jsonResponse(200, { orders, count: orders.length });
  } catch (error) {
    console.error('listOrders error:', error);
    return errorResponse(500, 'Internal server error');
  }
}
