<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, useTemplateRef } from 'vue'
import { gsap } from 'gsap'
import EraPanel from './EraPanel.vue'
import { eras, type CivId } from '../data/eras'
import { riverPaths } from '../data/river'
import type { Scale } from '../geometry/coastline'

/**
 * The SVG uses a 100 × 300 viewBox stretched over the three era rows
 * (preserveAspectRatio="none"), so each era is 100 units tall and x is a
 * percentage of the stream column's width.
 */
const STREAM_HEIGHT = 300
const REVEAL_FADE = 10

// Labels are HTML (stretched SVG text would distort), placed in viewBox units
const labels: { civ: CivId; text: string; x: number; y: number }[] = [
  { civ: 1, text: 'Civilization 1', x: 50, y: 45 },
  { civ: 1, text: 'Civilization 1', x: 25, y: 152 },
  { civ: 2, text: 'Civilization 2', x: 75, y: 152 },
  { civ: 3, text: 'Civilization 3', x: 51, y: 262 },
]

const root = useTemplateRef<HTMLElement>('root')
const stream = useTemplateRef<HTMLElement>('stream')
const revealHead = useTemplateRef<SVGGElement>('revealHead')

// Coastline detail is generated in screen pixels, so regenerate whenever the stretched SVG changes size
const scale = ref<Scale>({ x: 3, y: 9 })
const paths = computed(() => riverPaths(scale.value))

let mm: gsap.MatchMedia | undefined
let resizeObserver: ResizeObserver | undefined

onMounted(() => {
  if (!root.value || !stream.value) return
  const timeline = root.value
  const streamColumn = stream.value

  resizeObserver = new ResizeObserver(() => {
    scale.value = { x: streamColumn.clientWidth / 100, y: streamColumn.clientHeight / STREAM_HEIGHT }
  })
  resizeObserver.observe(streamColumn)

  mm = gsap.matchMedia(timeline)
  mm.add(
    {
      wide: '(min-width: 901px)',
      animate: '(prefers-reduced-motion: no-preference)',
    },
    (context) => {
      const conditions = context.conditions
      if (!conditions?.animate) return

      // Slide the mask's leading edge down the river so it tracks the middle of the viewport
      gsap.fromTo(
        revealHead.value,
        { attr: { transform: 'translate(0 0)' } },
        {
          attr: { transform: `translate(0 ${STREAM_HEIGHT + REVEAL_FADE})` },
          ease: 'none',
          scrollTrigger: {
            trigger: timeline,
            start: 'top center',
            end: 'bottom center',
            scrub: 0.6,
          },
        },
      )

      for (const label of gsap.utils.toArray<HTMLElement>('.stream-label')) {
        gsap.from(label, {
          autoAlpha: 0,
          duration: 0.6,
          scrollTrigger: {
            trigger: label,
            // Wait until the river's leading edge has passed the whole label
            start: 'bottom 45%',
            toggleActions: 'play none none reverse',
          },
        })
      }

      // Right panels are hidden on narrow screens, so only animate them when wide
      const panels = gsap.utils.toArray<HTMLElement>(conditions.wide ?'.timeline__left, .timeline__right' : '.timeline__left')
      for (const panel of panels) {
        gsap.from(panel, {
          autoAlpha: 0,
          x: panel.classList.contains('timeline__left') ? -60 : 60,
          duration: 0.9,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: panel,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        })
      }
    },
  )
})

onUnmounted(() => {
  mm?.revert()
  resizeObserver?.disconnect()
})
</script>

<template>
  <section ref="root" class="timeline">
    <div ref="stream" class="timeline__stream" aria-hidden="true">
      <svg class="stream" :viewBox="`0 0 100 ${STREAM_HEIGHT}`" preserveAspectRatio="none">
        <defs>
          <!-- Both branches fade into Civ 3's color as they reach the confluence -->
          <linearGradient id="ts-civ-1" gradientUnits="userSpaceOnUse" x1="0" y1="185" x2="0" y2="212">
            <stop offset="0" style="stop-color: var(--civ-1)" />
            <stop offset="1" style="stop-color: var(--civ-3)" />
          </linearGradient>
          <linearGradient id="ts-civ-2" gradientUnits="userSpaceOnUse" x1="0" y1="185" x2="0" y2="212">
            <stop offset="0" style="stop-color: var(--civ-2)" />
            <stop offset="1" style="stop-color: var(--civ-3)" />
          </linearGradient>
          <!-- Civ 3 trails off at the bottom: the stream continues past this page -->
          <linearGradient id="ts-civ-3" gradientUnits="userSpaceOnUse" x1="0" y1="270" x2="0" y2="300">
            <stop offset="0" style="stop-color: var(--civ-3)" />
            <stop offset="1" style="stop-color: var(--civ-3); stop-opacity: 0" />
          </linearGradient>

          <linearGradient id="ts-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="white" />
            <stop offset="1" stop-color="white" stop-opacity="0" />
          </linearGradient>

          <!-- Scroll-driven reveal: everything above the head is visible, with a soft leading edge -->
          <mask id="ts-reveal" maskUnits="userSpaceOnUse" x="-10" y="-10" width="120" :height="STREAM_HEIGHT + 20">
            <g ref="revealHead" :transform="`translate(0 ${STREAM_HEIGHT + REVEAL_FADE})`">
              <!-- Overlaps the fade by a unit so no anti-aliased seam shows where they meet -->
              <rect x="-10" :y="-(STREAM_HEIGHT + 20)" width="120" :height="STREAM_HEIGHT + 21 - REVEAL_FADE" fill="white" />
              <rect x="-10" :y="-REVEAL_FADE" width="120" :height="REVEAL_FADE" fill="url(#ts-fade)" />
            </g>
          </mask>

          <filter id="ts-shadow" x="-10%" y="-2%" width="120%" height="104%" color-interpolation-filters="sRGB">
            <feDropShadow dx="0.6" dy="0" stdDeviation="0.5 1" flood-color="#3b2f22" flood-opacity="0.25" />
          </filter>
        </defs>

        <g mask="url(#ts-reveal)">
          <!-- Civ 3 is drawn underneath both branches so their ends overlap it at the confluence -->
          <g filter="url(#ts-shadow)">
            <path fill="url(#ts-civ-3)" :d="paths.civ3" />
            <path fill="url(#ts-civ-2)" :d="paths.civ2" />
            <path fill="url(#ts-civ-1)" :d="paths.civ1" />
          </g>
        </g>
      </svg>

      <span
        v-for="label in labels"
        :key="`${label.text}-${label.y}`"
        class="stream-label"
        :style="{ left: `${label.x}%`, top: `${(label.y / STREAM_HEIGHT) * 100}%` }"
      >
        {{ label.text }}
      </span>
    </div>

    <template v-for="(era, i) in eras" :key="era.id">
      <div class="era-rule" :style="{ gridRow: i + 1 }">
        <span>{{ era.startYear }}</span>
      </div>
      <EraPanel class="timeline__left" :style="{ gridRow: i + 1 }" :panel="era.left" side="left" />
      <EraPanel class="timeline__right" :style="{ gridRow: i + 1 }" :panel="era.right" side="right" />
    </template>
  </section>
</template>

<style scoped>
.timeline {
  display: grid;
  grid-template-columns: 1fr clamp(140px, 22vw, 320px) 1fr;
  /* Equal rows keep each era aligned with its 100-unit slice of the SVG */
  grid-template-rows: repeat(3, minmax(100svh, 1fr));
  align-items: center;
}

.timeline__stream {
  grid-column: 2;
  grid-row: 1 / -1;
  align-self: stretch;
  position: relative;
  z-index: 1;
}

.stream {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.stream-label {
  position: absolute;
  transform: translate(-50%, -50%);
  writing-mode: vertical-rl;
  white-space: nowrap;
  font-size: 0.8rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--river-label);
  text-shadow: 0 0 4px rgb(59 47 34 / 0.35);
}

.era-rule {
  grid-column: 1 / -1;
  align-self: start;
  border-top: 1px dashed rgb(59 47 34 / 0.25);
  padding: 6px 16px;
}

.era-rule span {
  font-size: 0.75rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--ink-soft);
}

.timeline__left {
  grid-column: 1;
}

.timeline__right {
  grid-column: 3;
}

@media (max-width: 900px) {
  .timeline {
    grid-template-columns: 1fr 35vw;
  }

  .timeline__right {
    display: none;
  }
}
</style>
