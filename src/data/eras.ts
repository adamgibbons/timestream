export type CivId = 1 | 2 | 3

export interface Panel {
  civ: CivId
  title: string
  years: string
  text: string
  imageAlt: string
}

export interface Era {
  id: string
  /** Label for the era boundary rule drawn across the page */
  startYear: string
  left: Panel
  right: Panel
}

export const eras: Era[] = [
  {
    id: 'era-1',
    startYear: '3000 BCE',
    left: {
      civ: 1,
      title: 'Civilization 1',
      years: '3000 – 2000 BCE',
      text: 'A single people settles the floodplain. Villages grow into towns along one great channel, and the first records are pressed into clay.',
      imageAlt: 'Settlement on the floodplain',
    },
    right: {
      civ: 1,
      title: 'First works',
      years: '2600 BCE',
      text: 'Canals, granaries and a shared calendar bind the river towns together. For a thousand years the stream runs as one.',
      imageAlt: 'Clay tablet with early script',
    },
  },
  {
    id: 'era-2',
    startYear: '2000 BCE',
    left: {
      civ: 1,
      title: 'Civilization 1 · Late period',
      years: '2000 – 1000 BCE',
      text: 'The old heartland turns inward. Its courts grow ornate and its borders harden, even as part of its population drifts away.',
      imageAlt: 'Palace relief from the late period',
    },
    right: {
      civ: 2,
      title: 'Civilization 2',
      years: '1900 – 1000 BCE',
      text: 'Settlers who left the heartland found a new state downstream. They keep the old script, but write a new language with it.',
      imageAlt: 'Harbor of the new downstream state',
    },
  },
  {
    id: 'era-3',
    startYear: '1000 BCE',
    left: {
      civ: 3,
      title: 'Civilization 3',
      years: '1000 BCE – 200 CE',
      text: 'Trade and marriage draw the two channels back together. The merged realm inherits the laws of the first and the ships of the second.',
      imageAlt: 'Coin struck under the united realm',
    },
    right: {
      civ: 3,
      title: 'A shared inheritance',
      years: '600 BCE',
      text: 'Scholars of the united realm compile both histories into a single chronicle, the first to picture time itself as a river.',
      imageAlt: 'Page from the united chronicle',
    },
  },
]
