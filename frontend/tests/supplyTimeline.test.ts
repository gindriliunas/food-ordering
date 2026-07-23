import { buildSupplyTimeline } from '../src/lib/supplyTimeline';

describe('buildSupplyTimeline', () => {
  const deliveryDate = '2026-07-20T12:00:00.000Z';
  const deliveryAddress = '12 Kitchen Lane, London';

  it('returns the full set of timeline steps in order', () => {
    const steps = buildSupplyTimeline('Tomatoes', deliveryDate, deliveryAddress);

    expect(steps).toHaveLength(7);
    expect(steps.map((step) => step.id)).toEqual([
      'picked',
      'source',
      'stored-regional',
      'delivered-hub',
      'stored-warehouse',
      'out-for-delivery',
      'delivered-customer',
    ]);
  });

  it('uses ingredient-specific source details', () => {
    const steps = buildSupplyTimeline('Tomatoes', deliveryDate, deliveryAddress);

    expect(steps[0].location).toBe('Almería greenhouses');
    expect(steps[1].location).toBe('Almería greenhouses, Andalusia, Spain');
    expect(steps[1].description).toContain('Tomatoes');
  });

  it('uses the delivery address for the final step', () => {
    const steps = buildSupplyTimeline('Potatoes', deliveryDate, deliveryAddress);
    const delivered = steps.find((step) => step.id === 'delivered-customer');

    expect(delivered?.location).toBe(deliveryAddress);
  });

  it('falls back to the default source for unknown ingredients', () => {
    const steps = buildSupplyTimeline('Mystery greens', deliveryDate, '');

    expect(steps[0].location).toBe('Regional supplier network');
    expect(steps[1].location).toBe('Regional supplier network, UK & EU');
    expect(steps[6].location).toBe('Kitchen delivery address');
  });

  it('includes formatted timestamps for every step', () => {
    const steps = buildSupplyTimeline('Fresh basil', deliveryDate, deliveryAddress);

    for (const step of steps) {
      expect(step.timestamp.length).toBeGreaterThan(0);
      expect(step.title.length).toBeGreaterThan(0);
      expect(step.description.length).toBeGreaterThan(0);
    }
  });
});
