import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getOrderService } from '../lib/container';
import { errorResponse, jsonResponse } from '../lib/response';

export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  try {
    const id = event.pathParameters?.id;
    if (!id) {
      return errorResponse(400, 'Order id is required');
    }

    const order = await getOrderService().getOrder(id);
    if (!order) {
      return errorResponse(404, 'Order not found');
    }

    return jsonResponse(200, order);
  } catch (error) {
    console.error('getOrder error:', error);
    return errorResponse(500, 'Internal server error');
  }
}
