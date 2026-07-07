import { APIGatewayProxyEventV2 } from 'aws-lambda';

export type AuthorizedAPIGatewayEvent = APIGatewayProxyEventV2 & {
  requestContext: APIGatewayProxyEventV2['requestContext'] & {
    authorizer?: {
      jwt?: {
        claims?: Record<string, string>;
      };
    };
  };
};

export function getKitchenId(event: AuthorizedAPIGatewayEvent): string {
  const claims = event.requestContext?.authorizer?.jwt?.claims;

  return (
    claims?.['custom:kitchen_id'] ??
    claims?.preferred_username ??
    claims?.email ??
    claims?.sub ??
    'default-kitchen'
  );
}
