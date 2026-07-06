import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getOrderService } from '../lib/container';
import { getKitchenId, AuthorizedAPIGatewayEvent } from '../lib/event';
import { errorResponse, jsonResponse } from '../lib/response';
import { ValidationError } from '../services/orderService';

export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  try {
    if (!event.body) {
      return errorResponse(400, 'Request body is required');
    }

    const kitchenId = getKitchenId(event as AuthorizedAPIGatewayEvent);

    const body = JSON.parse(event.body);
    const order = await getOrderService().createOrder(body, kitchenId);

    return jsonResponse(201, order);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return errorResponse(400, 'Invalid JSON body');
    }
    if (error instanceof ValidationError) {
      return errorResponse(400, error.message);
    }
    console.error('createOrder error:', error);
    return errorResponse(500, 'Internal server error');
  }
}
