<script setup lang="ts">
import { onMounted, onUnmounted, useTemplateRef } from 'vue'
import { gsap } from 'gsap'
import EraPanel from './EraPanel.vue'
import { eras, type CivId } from '../data/eras'

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
const revealHead = useTemplateRef<SVGGElement>('revealHead')

let mm: gsap.MatchMedia | undefined

onMounted(() => {
  if (!root.value) return
  const timeline = root.value

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

onUnmounted(() => mm?.revert())
</script>

<template>
  <section ref="root" class="timeline">
    <div class="timeline__stream" aria-hidden="true">
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
              <rect x="-10" :y="-(STREAM_HEIGHT + 20)" width="120" :height="STREAM_HEIGHT + 20 - REVEAL_FADE" fill="white" />
              <rect x="-10" :y="-REVEAL_FADE" width="120" :height="REVEAL_FADE" fill="url(#ts-fade)" />
            </g>
          </mask>

          <!-- Slight wobble so the banks read as hand-inked rather than vector-perfect -->
          <filter id="ts-ink" x="-10%" y="-2%" width="120%" height="104%" color-interpolation-filters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.035 0.05" numOctaves="2" seed="7" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" xChannelSelector="R" yChannelSelector="G" result="wobbly" />
            <feDropShadow in="wobbly" dx="0.6" dy="0" stdDeviation="0.5 1" flood-color="#3b2f22" flood-opacity="0.25" />
          </filter>
        </defs>

        <g mask="url(#ts-reveal)">
          <g filter="url(#ts-ink)">
            <!-- Civ 3: born at the confluence, drawn underneath both branches so their ends overlap it -->
            <path
              fill="url(#ts-civ-3)"
              d="M 32 212 L 70 212 L 70 216 C 70 236, 74 246, 74 262 C 74 282, 71 292, 71 302
                 L 31 302 C 31 292, 28 282, 28 262 C 28 246, 32 236, 32 216 Z"
            />
            <!-- Civ 2: splits off Civ 1's right bank, then curves back in -->
            <path
              fill="url(#ts-civ-2)"
              d="M 55 90 C 58 114, 65 128, 65 152 C 65 176, 56 200, 50 216
                 L 70 216 C 70 196, 85 176, 85 152 C 85 124, 66 108, 57 90 Z"
            />
            <!-- Civ 1: the original stream, drifting left once Civ 2 branches away -->
            <path
              fill="url(#ts-civ-1)"
              d="M 41 -2 C 39 30, 44 65, 41 100 C 38 122, 15 128, 15 152 C 15 176, 32 196, 32 216
                 L 52 216 C 44 198, 35 176, 35 152 C 35 132, 54 122, 59 100 C 62 66, 57 30, 59 -2 Z"
            />
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
