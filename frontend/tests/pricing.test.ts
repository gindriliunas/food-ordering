import {
  calculateLineTotal,
  calculateOrderTotals,
  formatGbp,
  unitPriceLabel,
} from '../src/lib/pricing';

describe('formatGbp', () => {
  it('formats amounts as GBP currency', () => {
    expect(formatGbp(4.5)).toBe('£4.50');
    expect(formatGbp(0)).toBe('£0.00');
  });
});

describe('calculateLineTotal', () => {
  it('calculates per-kg pricing', () => {
    expect(calculateLineTotal({ name: 'Tomatoes', quantity: 2, unit: 'kg' })).toBe(4.8);
  });

  it('converts grams to kilograms', () => {
    expect(calculateLineTotal({ name: 'Tomatoes', quantity: 500, unit: 'g' })).toBe(1.2);
  });

  it('calculates per-item pricing', () => {
    expect(calculateLineTotal({ name: 'Olive oil', quantity: 3, unit: 'items' })).toBe(19.5);
  });

  it('returns 0 for unknown ingredients', () => {
    expect(calculateLineTotal({ name: 'Unknown', quantity: 1, unit: 'kg' })).toBe(0);
  });
});

describe('calculateOrderTotals', () => {
  it('adds delivery fee and VAT for priced items', () => {
    const totals = calculateOrderTotals({ name: 'Tomatoes', quantity: 2, unit: 'kg' });

    expect(totals.subtotal).toBe(4.8);
    expect(totals.delivery).toBe(4.5);
    expect(totals.vat).toBeCloseTo(1.86);
    expect(totals.total).toBeCloseTo(11.16);
  });

  it('skips delivery fee when subtotal is zero', () => {
    const totals = calculateOrderTotals({ name: 'Unknown', quantity: 1, unit: 'kg' });

    expect(totals).toEqual({
      subtotal: 0,
      delivery: 0,
      vat: 0,
      total: 0,
    });
  });
});

describe('unitPriceLabel', () => {
  it('returns per-kg label', () => {
    expect(unitPriceLabel('Tomatoes', 'kg')).toBe('£2.40 / kg');
  });

  it('returns per-item label', () => {
    expect(unitPriceLabel('Olive oil', 'items')).toBe('£6.50 / item');
  });

  it('returns price on request for unknown ingredients', () => {
    expect(unitPriceLabel('Unknown', 'kg')).toBe('Price on request');
  });
});
