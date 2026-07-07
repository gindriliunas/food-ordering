<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { calculateOrderTotals, formatGbp, unitPriceLabel } from '../lib/pricing';
import type { CreateOrderPayload, OrderItem, OrderUnit } from '../types/order';

const emit = defineEmits<{
  submit: [payload: CreateOrderPayload];
  previewChange: [payload: CreateOrderPayload];
}>();

const ingredients = [
  'Tomatoes',
  'Potatoes',
  'Onions',
  'Chicken breast',
  'Basmati rice',
  'Olive oil',
  'Fresh basil',
  'Mozzarella',
  'Spinach',
  'Garlic',
] as const;

const units: OrderUnit[] = ['g', 'kg', 'items'];

const item = reactive<OrderItem>({
  name: ingredients[0],
  quantity: 10,
  unit: 'kg',
});

const deliveryDate = ref(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16));
const deliveryAddress = ref('12 Kitchen Lane, London, E1 6AN');

const previewPayload = computed<CreateOrderPayload>(() => ({
  items: [
    {
      name: item.name,
      quantity: Number(item.quantity),
      unit: item.unit,
    },
  ],
  deliveryDate: new Date(deliveryDate.value).toISOString(),
  deliveryAddress: deliveryAddress.value.trim(),
}));

const totals = computed(() => calculateOrderTotals(item));
const unitLabel = computed(() => unitPriceLabel(item.name, item.unit));

function submitOrder() {
  emit('submit', previewPayload.value);
}

watch(
  previewPayload,
  (payload) => {
    emit('previewChange', payload);
  },
  { immediate: true, deep: true }
);
</script>

<template>
  <form class="card order-form" @submit.prevent="submitOrder">
    <div>
      <p class="eyebrow">Create order</p>
      <h2>Ingredient request</h2>
    </div>

    <label>
      Ingredient
      <select v-model="item.name" class="field-control" required>
        <option v-for="ingredient in ingredients" :key="ingredient" :value="ingredient">
          {{ ingredient }}
        </option>
      </select>
    </label>

    <div class="row">
      <label>
        Quantity
        <input v-model.number="item.quantity" class="field-control" required type="number" min="1" step="1" />
      </label>

      <label>
        Unit
        <select v-model="item.unit" class="field-control" required>
          <option v-for="unit in units" :key="unit" :value="unit">
            {{ unit }}
          </option>
        </select>
      </label>
    </div>

    <label>
      Delivery address
      <input
        v-model="deliveryAddress"
        class="field-control"
        required
        type="text"
        placeholder="Street, city, postcode"
        autocomplete="street-address"
      />
    </label>

    <label>
      Delivery date
      <input v-model="deliveryDate" class="field-control" required type="datetime-local" />
    </label>

    <section class="pricing-summary" aria-label="Approximate order pricing">
      <div class="pricing-row">
        <span>Unit price</span>
        <span>{{ unitLabel }}</span>
      </div>
      <div class="pricing-row">
        <span>Line total</span>
        <span>{{ formatGbp(totals.subtotal) }}</span>
      </div>
      <div class="pricing-row">
        <span>Delivery</span>
        <span>{{ formatGbp(totals.delivery) }}</span>
      </div>
      <div class="pricing-row">
        <span>VAT (20%)</span>
        <span>{{ formatGbp(totals.vat) }}</span>
      </div>
      <div class="pricing-row pricing-total">
        <span>Estimated total</span>
        <strong>{{ formatGbp(totals.total) }}</strong>
      </div>
      <p class="pricing-note muted">Approximate pricing for planning. Final invoice may vary.</p>
    </section>

    <button type="submit">Place order</button>
  </form>
</template>
