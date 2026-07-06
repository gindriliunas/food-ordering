import { APIGatewayProxyEventV2 } from 'aws-lambda';

export interface AuthorizerContext {
  kitchenId?: string;
  sub?: string;
}

export type AuthorizedAPIGatewayEvent = APIGatewayProxyEventV2 & {
  requestContext: APIGatewayProxyEventV2['requestContext'] & {
    authorizer?: {
      lambda?: AuthorizerContext;
    };
  };
};

export function getKitchenId(event: AuthorizedAPIGatewayEvent): string {
  return event.requestContext?.authorizer?.lambda?.kitchenId ?? 'default-kitchen';
}
