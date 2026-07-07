import { validateCreateRequest, ValidationError } from '../src/lib/validation';

describe('validateCreateRequest', () => {
  const validRequest = {
    items: [{ name: 'Tomatoes', quantity: 10, unit: 'kg' }],
    deliveryDate: '2026-07-15T09:00:00.000Z',
    deliveryAddress: '12 Kitchen Lane, London',
  };

  it('accepts a valid request', () => {
    const result = validateCreateRequest(validRequest);
    expect(result.items).toHaveLength(1);
    expect(result.deliveryDate).toBe(validRequest.deliveryDate);
  });

  it('rejects empty items array', () => {
    expect(() =>
      validateCreateRequest({ ...validRequest, items: [] })
    ).toThrow(ValidationError);
  });

  it('rejects invalid quantity', () => {
    expect(() =>
      validateCreateRequest({
        items: [{ name: 'Tomatoes', quantity: 0, unit: 'kg' }],
        deliveryDate: validRequest.deliveryDate,
        deliveryAddress: validRequest.deliveryAddress,
      })
    ).toThrow(ValidationError);
  });

  it('rejects invalid unit', () => {
    expect(() =>
      validateCreateRequest({
        items: [{ name: 'Tomatoes', quantity: 5, unit: 'litres' }],
        deliveryDate: validRequest.deliveryDate,
        deliveryAddress: validRequest.deliveryAddress,
      })
    ).toThrow(ValidationError);
  });

  it('rejects missing delivery address', () => {
    expect(() =>
      validateCreateRequest({
        ...validRequest,
        deliveryAddress: '',
      })
    ).toThrow(ValidationError);
  });

  it('rejects invalid delivery date', () => {
    expect(() =>
      validateCreateRequest({
        ...validRequest,
        deliveryDate: 'not-a-date',
      })
    ).toThrow(ValidationError);
  });

  it('rejects non-object body', () => {
    expect(() => validateCreateRequest(null)).toThrow(ValidationError);
  });
});
