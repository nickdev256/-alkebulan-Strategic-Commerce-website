// The site menu. The header, footer and page tabs all read from this list.
// `icon` and `note` are shown in the header dropdown panels.
export const navigation = [
  { label: 'Home', path: '/' },
  {
    label: 'About',
    path: '/about',
    children: [
      { label: 'Company Snapshot', path: '/about/company-snapshot', icon: 'globe', note: 'Our company and strategic purpose' },
      { label: 'Who We Are', path: '/about/who-we-are', icon: 'users', note: 'Our identity and how we work' },
      { label: 'Strategic Partners', path: '/about/strategic-partners', icon: 'handshake', note: 'Our partnership network' },
      { label: 'What Sets Alkebulan Global Apart', path: '/about/what-sets-us-apart', icon: 'target', note: 'Our competitive advantages' },
    ],
  },
  {
    label: 'Expertise',
    path: '/services',
    children: [
      { label: 'Core Sectors', path: '/services/sectors', icon: 'bolt', note: 'Energy, mining, industry, food and more' },
      { label: 'Core Services', path: '/services/core-services', icon: 'chart', note: 'Intelligence, compliance and partnerships' },
    ],
  },
  { label: 'Projects', path: '/portfolio' },
  { label: 'Responsibility', path: '/csr' },
];

export const subPages = (label) =>
  navigation.find((item) => item.label === label).children;
