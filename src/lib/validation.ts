import { CreateOrderRequest, OrderItem } from '../types/order';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateCreateRequest(body: unknown): CreateOrderRequest {
  if (!body || typeof body !== 'object') {
    throw new ValidationError('Request body must be a JSON object');
  }

  const { items, deliveryDate, kitchenId } = body as Record<string, unknown>;

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
    if (typeof unit !== 'string' || !unit.trim()) {
      throw new ValidationError(`items[${index}].unit must be a non-empty string`);
    }

    return { name: name.trim(), quantity, unit: unit.trim() };
  });

  if (typeof deliveryDate !== 'string' || !deliveryDate.trim()) {
    throw new ValidationError('deliveryDate must be a non-empty ISO date string');
  }

  const parsedDate = new Date(deliveryDate);
  if (Number.isNaN(parsedDate.getTime())) {
    throw new ValidationError('deliveryDate must be a valid date');
  }

  return {
    items: validatedItems,
    deliveryDate: deliveryDate.trim(),
    kitchenId: typeof kitchenId === 'string' ? kitchenId.trim() : undefined,
  };
}
