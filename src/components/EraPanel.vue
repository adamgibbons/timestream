<script setup lang="ts">
import type { Panel } from '../data/eras'

defineProps<{
  panel: Panel
  side: 'left' | 'right'
}>()
</script>

<template>
  <article class="panel" :class="`panel--${side}`" :style="{ '--civ': `var(--civ-${panel.civ})` }">
    <figure class="panel__image">
      <figcaption>{{ panel.imageAlt }}</figcaption>
    </figure>
    <p class="panel__years">{{ panel.years }}</p>
    <h2 class="panel__title">{{ panel.title }}</h2>
    <p class="panel__text">{{ panel.text }}</p>
  </article>
</template>

<style scoped>
.panel {
  max-width: 340px;
  padding: 0 clamp(16px, 3vw, 40px);
}

.panel--left {
  justify-self: end;
  text-align: right;
}

.panel--right {
  justify-self: start;
}

/* Placeholder until real images exist: a hatched plate tinted with the civilization's color */
.panel__image {
  margin: 0 0 16px;
  aspect-ratio: 4 / 3;
  display: flex;
  align-items: flex-end;
  padding: 10px 12px;
  border: 1px solid color-mix(in srgb, var(--civ) 60%, var(--ink));
  background:
    repeating-linear-gradient(
      -45deg,
      color-mix(in srgb, var(--civ) 22%, transparent) 0 2px,
      transparent 2px 9px
    ),
    color-mix(in srgb, var(--civ) 14%, var(--parchment));
  box-shadow: 0 1px 0 var(--parchment-deep);
}

.panel--left .panel__image {
  justify-content: flex-end;
}

.panel__image figcaption {
  font-style: italic;
  font-size: 0.8rem;
  color: var(--ink-soft);
}

.panel__years {
  font-size: 0.8rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--civ);
}

.panel__title {
  font-size: 1.6rem;
  margin: 2px 0 8px;
}

.panel__text {
  color: var(--ink-soft);
}
</style>
