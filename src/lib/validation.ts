import { CreateOrderRequest, OrderItem, OrderUnit } from '../types/order';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

const ALLOWED_UNITS: OrderUnit[] = ['g', 'kg', 'items'];

export function validateCreateRequest(body: unknown): CreateOrderRequest {
  if (!body || typeof body !== 'object') {
    throw new ValidationError('Request body must be a JSON object');
  }

  const { items, deliveryDate, deliveryAddress, kitchenId } = body as Record<string, unknown>;

  if (!Array.isArray(items) || items.length === 0) {
    throw new ValidationError('items must be a non-empty array');
  }

  const validatedItems: OrderItem[] = items.map((item, index) => {
    if (!item || typeof item !== 'object') {
      throw new ValidationError(`items[${index}] must be an object`);
    }
    const record = item as Record<string, unknown>;
    const name = record.name;
    const quantity = record.quantity;
    const unit = record.unit;

    if (typeof name !== 'string' || !name.trim()) {
      throw new ValidationError(`items[${index}].name must be a non-empty string`);
    }
    if (typeof quantity !== 'number' || quantity <= 0) {
      throw new ValidationError(`items[${index}].quantity must be a positive number`);
    }
    if (typeof unit !== 'string' || !ALLOWED_UNITS.includes(unit as OrderUnit)) {
      throw new ValidationError(`items[${index}].unit must be one of: ${ALLOWED_UNITS.join(', ')}`);
    }

    return { name: name.trim(), quantity, unit: unit as OrderUnit };
  });

  if (typeof deliveryDate !== 'string' || !deliveryDate.trim()) {
    throw new ValidationError('deliveryDate must be a non-empty ISO date string');
  }

  const parsedDate = new Date(deliveryDate);
  if (Number.isNaN(parsedDate.getTime())) {
    throw new ValidationError('deliveryDate must be a valid date');
  }

  if (typeof deliveryAddress !== 'string' || !deliveryAddress.trim()) {
    throw new ValidationError('deliveryAddress must be a non-empty string');
  }

  return {
    items: validatedItems,
    deliveryDate: deliveryDate.trim(),
    deliveryAddress: deliveryAddress.trim(),
    kitchenId: typeof kitchenId === 'string' ? kitchenId.trim() : undefined,
  };
}
