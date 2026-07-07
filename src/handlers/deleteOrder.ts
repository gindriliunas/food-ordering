import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getOrderService } from '../lib/container';
import { errorResponse, noContentResponse } from '../lib/response';

export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  try {
    const id = event.pathParameters?.id;
    if (!id) {
      return errorResponse(400, 'Order id is required');
    }

    await getOrderService().deleteOrder(id);
    return noContentResponse();
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Order not found')) {
      return errorResponse(404, error.message);
    }
    console.error('deleteOrder error:', error);
    return errorResponse(500, 'Internal server error');
  }
}
