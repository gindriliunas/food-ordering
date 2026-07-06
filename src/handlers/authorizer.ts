import { APIGatewayRequestAuthorizerEventV2 } from 'aws-lambda';
import { verifyToken } from '../lib/auth';

interface AuthorizerResult {
  isAuthorized: boolean;
  context?: {
    kitchenId: string;
    sub: string;
  };
}

export async function handler(
  event: APIGatewayRequestAuthorizerEventV2
): Promise<AuthorizerResult> {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET not configured');
    return { isAuthorized: false };
  }

  const authHeader =
    event.headers?.authorization ?? event.headers?.Authorization ?? '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (!token) {
    return { isAuthorized: false };
  }

  try {
    const payload = verifyToken(token, secret);
    return {
      isAuthorized: true,
      context: {
        kitchenId: payload.kitchenId,
        sub: payload.sub,
      },
    };
  } catch (error) {
    console.warn('Authorization failed:', error);
    return { isAuthorized: false };
  }
}
