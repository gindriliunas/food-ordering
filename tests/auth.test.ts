import { signToken, verifyToken } from '../src/lib/auth';

describe('auth', () => {
  const secret = 'test-secret-key';

  it('signs and verifies a token', () => {
    const token = signToken('kitchen-123', secret);
    const payload = verifyToken(token, secret);
    expect(payload.kitchenId).toBe('kitchen-123');
    expect(payload.sub).toBe('kitchen-123');
  });

  it('rejects invalid token', () => {
    expect(() => verifyToken('invalid-token', secret)).toThrow();
  });

  it('rejects token signed with wrong secret', () => {
    const token = signToken('kitchen-123', secret);
    expect(() => verifyToken(token, 'wrong-secret')).toThrow();
  });
});
