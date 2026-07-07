export interface TimelineStep {
  id: string;
  title: string;
  location: string;
  timestamp: string;
  description: string;
}

interface SupplySource {
  origin: string;
  region: string;
  pickOffsetDays: number;
  hubOffsetDays: number;
  importOffsetDays: number;
  warehouseOffsetDays: number;
  dispatchOffsetHours: number;
}

const SUPPLY_SOURCES: Record<string, SupplySource> = {
  Tomatoes: {
    origin: 'Almería greenhouses',
    region: 'Andalusia, Spain',
    pickOffsetDays: 5,
    hubOffsetDays: 4,
    importOffsetDays: 3,
    warehouseOffsetDays: 1,
    dispatchOffsetHours: 6,
  },
  Potatoes: {
    origin: 'Lincolnshire farms',
    region: 'East Midlands, UK',
    pickOffsetDays: 4,
    hubOffsetDays: 3,
    importOffsetDays: 2,
    warehouseOffsetDays: 1,
    dispatchOffsetHours: 8,
  },
  Onions: {
    origin: 'Cambridgeshire fields',
    region: 'East of England, UK',
    pickOffsetDays: 4,
    hubOffsetDays: 3,
    importOffsetDays: 2,
    warehouseOffsetDays: 1,
    dispatchOffsetHours: 8,
  },
  'Chicken breast': {
    origin: 'Norfolk poultry unit',
    region: 'East Anglia, UK',
    pickOffsetDays: 2,
    hubOffsetDays: 1.5,
    importOffsetDays: 1,
    warehouseOffsetDays: 0.5,
    dispatchOffsetHours: 4,
  },
  'Basmati rice': {
    origin: 'Punjab cooperative',
    region: 'India',
    pickOffsetDays: 14,
    hubOffsetDays: 10,
    importOffsetDays: 7,
    warehouseOffsetDays: 2,
    dispatchOffsetHours: 12,
  },
  'Olive oil': {
    origin: 'Tuscany mill',
    region: 'Italy',
    pickOffsetDays: 21,
    hubOffsetDays: 14,
    importOffsetDays: 9,
    warehouseOffsetDays: 3,
    dispatchOffsetHours: 12,
  },
  'Fresh basil': {
    origin: 'Kent glasshouses',
    region: 'South East, UK',
    pickOffsetDays: 1,
    hubOffsetDays: 0.75,
    importOffsetDays: 0.5,
    warehouseOffsetDays: 0.25,
    dispatchOffsetHours: 3,
  },
  Mozzarella: {
    origin: 'Campania dairy',
    region: 'Italy',
    pickOffsetDays: 6,
    hubOffsetDays: 4,
    importOffsetDays: 3,
    warehouseOffsetDays: 1,
    dispatchOffsetHours: 6,
  },
  Spinach: {
    origin: 'Essex farms',
    region: 'East of England, UK',
    pickOffsetDays: 2,
    hubOffsetDays: 1.5,
    importOffsetDays: 1,
    warehouseOffsetDays: 0.5,
    dispatchOffsetHours: 4,
  },
  Garlic: {
    origin: 'Castile growers',
    region: 'Central Spain',
    pickOffsetDays: 8,
    hubOffsetDays: 6,
    importOffsetDays: 4,
    warehouseOffsetDays: 1.5,
    dispatchOffsetHours: 8,
  },
};

const DEFAULT_SOURCE: SupplySource = {
  origin: 'Regional supplier network',
  region: 'UK & EU',
  pickOffsetDays: 4,
  hubOffsetDays: 3,
  importOffsetDays: 2,
  warehouseOffsetDays: 1,
  dispatchOffsetHours: 6,
};

function subtractDays(date: Date, days: number): Date {
  return new Date(date.getTime() - days * 24 * 60 * 60 * 1000);
}

function subtractHours(date: Date, hours: number): Date {
  return new Date(date.getTime() - hours * 60 * 60 * 1000);
}

function formatTimestamp(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function buildSupplyTimeline(
  ingredient: string,
  deliveryDateIso: string,
  deliveryAddress: string
): TimelineStep[] {
  const deliveryDate = new Date(deliveryDateIso);
  const source = SUPPLY_SOURCES[ingredient] ?? DEFAULT_SOURCE;

  const pickedAt = subtractDays(deliveryDate, source.pickOffsetDays);
  const regionalHubAt = subtractDays(deliveryDate, source.hubOffsetDays);
  const importAt = subtractDays(deliveryDate, source.importOffsetDays);
  const warehouseAt = subtractDays(deliveryDate, source.warehouseOffsetDays);
  const dispatchAt = subtractHours(deliveryDate, source.dispatchOffsetHours);

  return [
    {
      id: 'picked',
      title: 'Picked & packed',
      location: source.origin,
      timestamp: formatTimestamp(subtractHours(pickedAt, 4)),
      description: 'Cold-chain packing within two hours of harvest.',
    },
    {
      id: 'source',
      title: 'Produce sourced',
      location: `${source.origin}, ${source.region}`,
      timestamp: formatTimestamp(pickedAt),
      description: `${ingredient} harvested and quality-checked at the farm gate.`,
    },
    {
      id: 'stored-regional',
      title: 'Stored at regional hub',
      location: 'Birmingham consolidation centre',
      timestamp: formatTimestamp(regionalHubAt),
      description: 'Temperature-controlled storage before onward distribution.',
    },
    {
      id: 'delivered-hub',
      title: 'Delivered to national hub',
      location: 'London distribution park',
      timestamp: formatTimestamp(importAt),
      description: 'Inbound logistics completed and intake scan recorded.',
    },
    {
      id: 'stored-warehouse',
      title: 'Stored at fulfilment warehouse',
      location: 'Thames Gateway cold store',
      timestamp: formatTimestamp(warehouseAt),
      description: 'Held in bonded storage pending kitchen dispatch slot.',
    },
    {
      id: 'out-for-delivery',
      title: 'Out for delivery',
      location: 'Thames Gateway cold store',
      timestamp: formatTimestamp(dispatchAt),
      description: 'Loaded onto refrigerated van for final mile routing.',
    },
    {
      id: 'delivered-customer',
      title: 'Delivered to customer',
      location: deliveryAddress || 'Kitchen delivery address',
      timestamp: formatTimestamp(deliveryDate),
      description: 'Signed delivery to kitchen receiving bay.',
    },
  ];
}
