import { getKitchenId, AuthorizedAPIGatewayEvent } from '../src/lib/event';

describe('getKitchenId', () => {
  it('reads kitchen id from Cognito custom claim', () => {
    const event = {
      requestContext: {
        authorizer: {
          jwt: {
            claims: {
              'custom:kitchen_id': 'demo-kitchen',
              email: 'chef@kitchen.com',
            },
          },
        },
      },
    } as unknown as AuthorizedAPIGatewayEvent;

    expect(getKitchenId(event)).toBe('demo-kitchen');
  });

  it('falls back to email when kitchen id missing', () => {
    const event = {
      requestContext: {
        authorizer: {
          jwt: {
            claims: {
              email: 'chef@kitchen.com',
            },
          },
        },
      },
    } as unknown as AuthorizedAPIGatewayEvent;

    expect(getKitchenId(event)).toBe('chef@kitchen.com');
  });
});
