// Active projects shown on the Projects page (Our Work → Active Projects).
//
// To add a project, copy one entry and change its details:
//   id       a short unique name, e.g. 'mz-solar-1'
//   sector   one of the keys in `projectSectors` below
//   country  the country name shown on the card
//   code     the two-letter country code used for the flag (e.g. 'mz', 'na', 'ug')
//   title    the project name
//   status   e.g. 'Active', 'In development', 'Seeking partners'
//   summary  one or two sentences about the project
//
// Sector counts, filters and the "View active projects" buttons update
// automatically from this list.

export const projectSectors = [
  { key: 'energy', label: 'Energy', icon: 'bolt' },
  { key: 'minerals', label: 'Critical Minerals', icon: 'mountain' },
  { key: 'manufacturing', label: 'Manufacturing', icon: 'factory' },
  { key: 'agriculture', label: 'Agriculture', icon: 'wheat' },
  { key: 'precious-metals', label: 'Precious Metals', icon: 'gem' },
  { key: 'trade-finance', label: 'Trade Finance', icon: 'coins' },
];

export const activeProjects = [
  {
    id: 'mz-energy',
    sector: 'energy',
    country: 'Mozambique',
    code: 'mz',
    title: 'Energy Project, Mozambique',
    status: 'Active',
    summary: 'An energy development opportunity in Mozambique. Full details are shared with qualified partners on request.',
  },
  {
    id: 'na-mining',
    sector: 'minerals',
    country: 'Namibia',
    code: 'na',
    title: 'Mining Project, Namibia',
    status: 'Active',
    summary: 'A mining and mineral resources opportunity in Namibia. Full details are shared with qualified partners on request.',
  },
  {
    id: 'ug-agriculture',
    sector: 'agriculture',
    country: 'Uganda',
    code: 'ug',
    title: 'Agriculture Project, Uganda',
    status: 'Active',
    summary: 'An agriculture and agribusiness opportunity in Uganda. Full details are shared with qualified partners on request.',
  },
];
