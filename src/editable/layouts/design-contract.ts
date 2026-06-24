import type { CSSProperties } from 'react'

/**
 * Adox-inspired studio theme for the Media Distribution platform.
 * Dark canvas, oversized display type, molten-orange accent, sharp grids.
 * All tokens below are injected onto <body> so every editable surface inherits them.
 */
export const editableRootStyle = {
  '--slot4-page-bg': '#070707',
  '--slot4-page-text': '#f3f0ea',
  '--slot4-panel-bg': '#0e0e0e',
  '--slot4-surface-bg': '#0b0b0b',
  '--slot4-muted-text': '#b6b1a9',
  '--slot4-soft-muted-text': '#827d75',
  '--slot4-accent': '#ff5a1f',
  '--slot4-accent-fill': '#ff5a1f',
  '--slot4-accent-2': '#ff8a3d',
  '--slot4-accent-soft': 'rgba(255, 90, 31, 0.14)',
  '--slot4-dark-bg': '#000000',
  '--slot4-dark-text': '#ffffff',
  '--slot4-media-bg': '#141414',
  '--slot4-cream': '#070707',
  '--slot4-warm': '#0b0b0b',
  '--slot4-lavender': '#ff5a1f',
  '--slot4-gray': '#111111',
  '--slot4-line': 'rgba(255, 255, 255, 0.12)',
  '--slot4-body-gradient': 'radial-gradient(circle at 12% -10%, rgba(255,90,31,0.14), transparent 42%), #070707',
  // Previously-undefined container/border tokens — defining them fixes the stretched full-width layout.
  '--editable-container': '1320px',
  '--editable-border': 'rgba(255, 255, 255, 0.12)',
  '--editable-page-bg': '#070707',
  '--editable-page-text': '#f3f0ea',
} as CSSProperties

export const editablePalette = {
  pageBg: 'bg-[var(--slot4-page-bg)]',
  pageText: 'text-[var(--slot4-page-text)]',
  panelBg: 'bg-[var(--slot4-panel-bg)]',
  panelText: 'text-[var(--slot4-page-text)]',
  surfaceBg: 'bg-[var(--slot4-surface-bg)]',
  surfaceText: 'text-[var(--slot4-page-text)]',
  mutedText: 'text-[var(--slot4-muted-text)]',
  softMutedText: 'text-[var(--slot4-soft-muted-text)]',
  accentText: 'text-[var(--slot4-accent)]',
  accentBg: 'bg-[var(--slot4-accent-fill)]',
  accentSoftBg: 'bg-[var(--slot4-accent-soft)]',
  accentSoftText: 'text-[var(--slot4-accent-soft)]',
  darkBg: 'bg-[var(--slot4-dark-bg)]',
  darkText: 'text-[var(--slot4-dark-text)]',
  mediaBg: 'bg-[var(--slot4-media-bg)]',
  creamBg: 'bg-[var(--slot4-cream)]',
  warmBg: 'bg-[var(--slot4-warm)]',
  lavenderBg: 'bg-[var(--slot4-lavender)]',
  grayBg: 'bg-[var(--slot4-gray)]',
  border: 'border-white/12',
  darkBorder: 'border-white/12',
  shadow: 'shadow-[0_18px_50px_rgba(0,0,0,0.5)]',
  shadowStrong: 'shadow-[0_30px_90px_rgba(0,0,0,0.6)]',
  overlay: 'bg-[linear-gradient(180deg,rgba(0,0,0,0.05),rgba(0,0,0,0.85))]',
} as const

export const editableDesignContract = {
  shell: {
    page: `min-h-screen ${editablePalette.pageBg} ${editablePalette.pageText}`,
    section: 'mx-auto w-full max-w-[var(--editable-container)] px-5 sm:px-8 lg:px-12',
    sectionY: 'py-16 sm:py-20 lg:py-28',
  },
  layout: {
    safeGrid: 'grid gap-px bg-white/10 md:grid-cols-2 xl:grid-cols-3',
    featureGrid: 'grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start',
    rail: 'flex snap-x gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
    minRailCard: 'w-[260px] shrink-0 snap-start sm:w-[300px]',
  },
  type: {
    eyebrow: 'mono-label text-[11px] font-bold uppercase tracking-[0.28em]',
    heroTitle: 'text-[15vw] font-black uppercase leading-[0.82] tracking-[-0.04em] sm:text-[12vw] lg:text-[10.5rem]',
    sectionTitle: 'text-4xl font-black uppercase leading-[0.9] tracking-[-0.045em] sm:text-6xl lg:text-7xl',
    body: 'text-base leading-8',
  },
  surface: {
    card: `border ${editablePalette.border} ${editablePalette.surfaceBg}`,
    soft: `border ${editablePalette.border} ${editablePalette.panelBg}`,
    dark: `${editablePalette.darkBg} ${editablePalette.darkText}`,
  },
  button: {
    primary:
      'inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-black transition-colors duration-300 hover:bg-[var(--slot4-accent-fill)] hover:text-white',
    secondary:
      'inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-transparent px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white transition-colors duration-300 hover:bg-white hover:text-black',
    accent:
      'inline-flex items-center justify-center gap-2 rounded-full bg-[var(--slot4-accent-fill)] px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white transition-colors duration-300 hover:bg-white hover:text-black',
  },
  media: {
    frame: `relative overflow-hidden ${editablePalette.mediaBg}`,
    ratio: 'aspect-[4/3]',
  },
  motion: {
    lift: 'transition duration-500 hover:-translate-y-1.5 hover:border-white/30',
    fade: 'transition duration-300 hover:opacity-75',
  },
} as const

export const aiLayoutRules = [
  'All visible layout decisions belong inside src/editable; keep data, SEO, API, and route logic untouched.',
  'Use a dark studio canvas, oversized uppercase display type, molten-orange accents, mono micro-labels, and sharp media grids.',
  'Keep dynamic post fetching intact and never replace backend posts with mock arrays.',
  'Use postHref() for all post links so route aliases and task-specific detail pages remain functional.',
  'Branding must remain dynamic from SITE_CONFIG; never hardcode a reference studio name or logo.',
] as const
