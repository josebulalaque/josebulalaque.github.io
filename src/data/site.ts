// Everything about you that appears across the site lives here.
// Replace the TODO values; nothing else needs to change.

export const site = {
  name: 'Jose Bulalaque',
  // TODO: one line that sits under your name on the home page.
  role: 'Systems engineer and server administrator',
  // TODO: used for search results and link previews. Keep it under ~160 characters.
  description:
    'Jose Bulalaque is a systems engineer and server administrator who builds, runs and automates the Linux and Windows servers that services depend on.',
  url: 'https://josebulalaque.github.io',
  locale: 'en-AU',
  links: {
    github: 'https://github.com/josebulalaque',
    // TODO: add your LinkedIn URL, or leave it empty to hide it.
    linkedin: '',
  },
};

// The four sections, mounted as servers in the home page rack, top to bottom.
export const sections = [
  { href: '/#about', label: 'About' },
  { href: '/projects/', label: 'Projects' },
  { href: '/blog/', label: 'Writing' },
  { href: '/cv/', label: 'CV' },
] as const;
