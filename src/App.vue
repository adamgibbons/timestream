<script setup lang="ts">
import StreamTimeline from './components/StreamTimeline.vue'
</script>

<template>
  <header class="intro">
    <p class="intro__kicker">A stream of time</p>
    <h1 class="intro__title">Timestream</h1>
    <p class="intro__lede">
      History drawn as a river: civilizations rise as channels, branch apart, and flow back together.
    </p>
    <p class="intro__hint">Scroll to begin <span aria-hidden="true">↓</span></p>
  </header>

  <main>
    <StreamTimeline />
  </main>

  <footer class="outro">
    <p>…and the stream flows on.</p>
  </footer>
</template>

<style scoped>
.intro {
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 0 16px;
  text-align: center;
}

.intro__kicker {
  font-size: 0.85rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ink-soft);
}

.intro__title {
  font-size: clamp(3rem, 9vw, 6rem);
  font-weight: 400;
}

.intro__lede {
  max-width: 34ch;
  font-size: 1.2rem;
  font-style: italic;
  color: var(--ink-soft);
}

.intro__hint {
  margin-top: 40px;
  font-size: 0.9rem;
  color: var(--ink-soft);
}

.intro__hint span {
  display: inline-block;
  animation: nudge 1.6s ease-in-out infinite;
}

@keyframes nudge {
  50% {
    transform: translateY(6px);
  }
}

.outro {
  min-height: 60svh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  font-style: italic;
  font-size: 1.3rem;
  color: var(--ink-soft);
}

@media (prefers-reduced-motion: reduce) {
  .intro__hint span {
    animation: none;
  }
}
</style>
