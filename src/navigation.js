// The site menu. The header, footer and page tabs all read from this list.
// `icon` and `note` are shown in the header dropdown panels;
// `short` is the label used in the page tabs on phones.
export const navigation = [
  { label: 'Home', path: '/' },
  {
    label: 'About',
    path: '/about',
    children: [
      { label: 'Company Snapshot', short: 'Snapshot', path: '/about/company-snapshot', icon: 'globe', note: 'Our company and strategic purpose' },
      { label: 'Who We Are', path: '/about/who-we-are', icon: 'users', note: 'Our reach across Africa and the world' },
      { label: 'Strategic Partners', short: 'Partners', path: '/about/strategic-partners', icon: 'handshake', note: 'Who we work with and how' },
      { label: 'What Sets Alkebulan Global Apart', short: 'Why Us', path: '/about/what-sets-us-apart', icon: 'target', note: 'Access, credibility, discretion, execution' },
      { label: 'Our Team', short: 'Team', path: '/about/our-team', icon: 'users', note: 'Leadership, team, and organization' },
    ],
  },
  {
    label: 'Expertise',
    path: '/services',
    children: [
      { label: 'Core Sectors', path: '/services/sectors', icon: 'bolt', note: 'Eight strategic industry sectors' },
      { label: 'Core Services', path: '/services/core-services', icon: 'chart', note: 'Six strategic service pillars' },
    ],
  },
  { label: 'Projects', path: '/portfolio' },
  { label: 'Responsibility', path: '/csr' },
];

export const subPages = (label) =>
  navigation.find((item) => item.label === label).children;
