<script setup lang="ts">
import { computed } from 'vue';
import { buildSupplyTimeline } from '../lib/supplyTimeline';

const props = defineProps<{
  ingredient: string;
  deliveryDate: string;
  deliveryAddress: string;
}>();

const steps = computed(() =>
  buildSupplyTimeline(props.ingredient, props.deliveryDate, props.deliveryAddress)
);
</script>

<template>
  <section class="card timeline-card">
    <div class="section-heading">
      <div>
        <p class="eyebrow">Supply chain</p>
        <h2>Produce journey</h2>
        <p class="muted timeline-intro">
          Approximate route for <strong>{{ ingredient }}</strong> from farm to kitchen.
        </p>
      </div>
    </div>

    <ol class="timeline">
      <li v-for="(step, index) in steps" :key="step.id" class="timeline-step">
        <div class="timeline-marker">
          <span class="timeline-dot" />
          <span v-if="index < steps.length - 1" class="timeline-line" />
        </div>
        <div class="timeline-content">
          <div class="timeline-header">
            <strong>{{ step.title }}</strong>
            <time>{{ step.timestamp }}</time>
          </div>
          <p class="timeline-location">{{ step.location }}</p>
          <p class="timeline-description">{{ step.description }}</p>
        </div>
      </li>
    </ol>
  </section>
</template>
