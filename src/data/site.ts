// Everything about you that appears across the site lives here.
// Replace the TODO values; nothing else needs to change.

export const site = {
  name: 'Jose Bulalaque',
  // TODO: one line that sits under your name on the home page.
  role: 'Network and infrastructure engineer',
  // TODO: used for search results and link previews. Keep it under ~160 characters.
  description:
    'Jose Bulalaque is a network and infrastructure engineer working on automation, DevOps tooling and the networks underneath it all.',
  url: 'https://josebulalaque.github.io',
  locale: 'en-AU',
  links: {
    github: 'https://github.com/josebulalaque',
    // TODO: add your LinkedIn URL, or leave it empty to hide it.
    linkedin: '',
  },
};

// The four sections, each wired to one T568B pair colour.
export const sections = [
  { href: '/#about', label: 'About', color: 'orange' },
  { href: '/projects/', label: 'Projects', color: 'green' },
  { href: '/blog/', label: 'Writing', color: 'blue' },
  { href: '/cv/', label: 'CV', color: 'brown' },
] as const;

export type PairColor = (typeof sections)[number]['color'];
