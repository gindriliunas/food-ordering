import jwt from 'jsonwebtoken';

export interface JwtPayload {
  sub: string;
  kitchenId: string;
}

export function verifyToken(token: string, secret: string): JwtPayload {
  const payload = jwt.verify(token, secret) as JwtPayload;
  if (!payload.kitchenId) {
    throw new Error('Invalid token: missing kitchenId');
  }
  return payload;
}

export function signToken(kitchenId: string, secret: string): string {
  return jwt.sign({ sub: kitchenId, kitchenId }, secret, { expiresIn: '24h' });
}
