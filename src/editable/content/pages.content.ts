import { slot4BrandConfig } from '@/editable/theme/brand.config'

const brand = slot4BrandConfig.siteName

export const pagesContent = {
  home: {
    metadata: {
      title: 'News, media, and public updates',
      description: 'Explore announcements, newsroom updates, media coverage, and dynamic categories through a clean distribution experience.',
      openGraphTitle: 'News, media, and public updates',
      openGraphDescription: 'Discover press releases, newsroom updates, and connected media through a fast, category-led distribution surface.',
      keywords: ['media distribution', 'press release', 'newsroom', 'public updates', 'content discovery'],
    },
    hero: {
      badge: 'Newsroom · Press · Public updates',
      location: 'Global Newswire',
      title: ['Media', 'Distribution'],
      description: 'We integrate brand, press, and public reach — moving announcements and newsroom updates to the right audience with clarity and impact.',
      note: `Built as a modern distribution surface, ${brand} connects brands, journalists, and the public through one clean, category-led media stream.`,
      services: ['Press Releases', 'News Media', 'Public Relations', 'Business Updates', 'Newsroom Wire'],
      primaryCta: { label: 'Browse latest updates', href: '/updates' },
      secondaryCta: { label: 'Submit an update', href: '/contact' },
      searchPlaceholder: 'Search news, companies, categories, and updates',
    },
    intro: {
      badge: 'About the platform',
      title: 'Built to move announcements, press, and public updates further.',
      paragraphs: [
        `${brand} brings press releases, newsroom updates, and business announcements together into one clean, category-led distribution surface.`,
        'Instead of scattering stories across disconnected channels, every update stays structured, discoverable, and easy to follow for readers, press, and search alike.',
        'Whether a story starts as a release, a media update, or a public announcement, it is built to travel further and stay visible longer.',
      ],
    },
    process: {
      badge: 'How distribution works',
      tag: '[Just 3 Steps]',
      note: 'Updates we publish, stories we amplify, audiences we reach.',
      steps: [
        { step: 'Step One', title: 'Submit', description: 'Share your announcement, press release, or update with the details and sources that matter.' },
        { step: 'Step Two', title: 'Distribute', description: 'We structure and route it across the right categories and discovery surfaces with precision.' },
        { step: 'Step Three', title: 'Amplify', description: 'Your update reaches readers, press, and search with lasting, measurable visibility.' },
      ],
    },
    projects: {
      badge: 'Our curated wire',
      label: 'Updates',
      heading: 'Latest',
    },
    blog: {
      badge: 'Newsroom & insights',
      tag: '[Latest]',
      note: "What we're publishing, what's moving, and what most wires won't tell you.",
    },
    cta: {
      badge: 'Start distributing',
      title: 'The stories shaping what comes next.',
      description: 'Fresh releases, media updates, newsroom perspectives, and useful public information in one focused distribution surface.',
      primaryCta: { label: 'Browse updates', href: '/updates' },
      secondaryCta: { label: 'Contact the desk', href: '/contact' },
    },
    taskSection: {
      heading: 'Latest {label}',
      descriptionSuffix: 'Browse the newest posts in this section.',
    },
  },
  about: {
    badge: 'Our Story',
    title: 'Media built for clear, fast, far-reaching distribution.',
    description: `${brand} is a media distribution studio built to move announcements, press, and public updates with clarity, structure, and reach.`,
    paragraphs: [
      'Instead of scattering stories across disconnected channels, we keep distribution organized, category-led, and easy to discover for readers, press, and search alike.',
      'Whether it starts as a press release, a newsroom update, or a business announcement, every story is structured to travel further and stay visible longer.',
    ],
    stats: [
      { value: '2020', label: 'Distributing since' },
      { value: '12+', label: 'Media categories' },
      { value: '24/7', label: 'Newswire uptime' },
    ],
    values: [
      { title: 'Distribution-first', description: 'We prioritize speed, structure, and reach so every update lands with the right audience at the right moment.' },
      { title: 'Connected media surfaces', description: 'Press releases, news media, public relations, and business updates stay connected so discovery feels effortless.' },
      { title: 'Clear and trustworthy', description: 'We focus on clean structure and honest sourcing to help readers and press find credible updates faster.' },
    ],
  },
  contact: {
    eyebrow: `Contact ${brand}`,
    title: 'A desk that routes your update to the right lane.',
    description: 'Tell us what you are trying to publish, announce, or distribute. We will route it through the right channel instead of forcing every request into one bucket.',
    formTitle: 'Send a message',
  },
  search: {
    metadata: {
      title: 'Search',
      description: 'Search press releases, updates, categories, and media across the wire.',
    },
    hero: {
      badge: 'Search the wire',
      title: 'Find updates, releases, and media faster.',
      description: 'Use keywords, categories, and content types to discover posts from every active section of the distribution wire.',
      placeholder: 'Search by keyword, topic, category, or title',
    },
    resultsTitle: 'Latest searchable updates',
  },
  create: {
    metadata: {
      title: 'Create',
      description: 'Create and submit new updates for distribution.',
    },
    locked: {
      badge: 'Publisher access',
      title: 'Login to submit an update.',
      description: 'Use your account to open the publishing workspace and prepare updates for distribution across the wire.',
    },
    hero: {
      badge: 'Publishing workspace',
      title: 'Create an update for distribution.',
      description: 'Choose the content type, add details, and prepare a clean, distribution-ready update with sources, links, and summary.',
    },
    formTitle: 'Update details',
    submitLabel: 'Submit for distribution',
    successTitle: 'Update submitted successfully.',
  },
  auth: {
    login: {
      metadataDescription: 'Login to the distribution workspace.',
      badge: 'Member access',
      title: 'Welcome back to the wire.',
      description: 'Login to continue browsing, managing submissions, and distributing new updates from your account.',
      formTitle: 'Login',
      submitLabel: 'Continue',
      noAccount: 'No account matched these details. Create an account first, then login.',
      success: 'Login successful. Redirecting...',
      createCta: 'Create an account',
    },
    signup: {
      metadataDescription: 'Create a distribution account.',
      badge: 'Wire access',
      title: 'Create your account and start distributing.',
      description: 'Create an account to access the publishing workspace, save details, and submit updates to the wire.',
      formTitle: 'Create account',
      submitLabel: 'Create account',
      passwordShort: 'Use at least 4 characters for the password.',
      success: 'Account created successfully. Redirecting...',
      loginCta: 'Login',
    },
  },
  detailPages: {
    article: { relatedTitle: 'Related updates', fallbackTitle: 'Update details' },
    listing: { relatedTitle: 'Related listings', fallbackTitle: 'Listing details' },
    image: { relatedTitle: 'Related visuals', fallbackTitle: 'Image details' },
    profile: { relatedTitle: 'Suggested updates', fallbackDescription: 'Profile details will appear here once available.', visitButton: 'Visit Official Site' },
  },
} as const
