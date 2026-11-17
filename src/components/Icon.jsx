// Site icons from Hugeicons (free Stroke Rounded style).
// Usage: <Icon name="globe" /> or <Icon name="globe" size={18} />
// To add an icon, find its export name at https://hugeicons.com/icons
// (or with the Hugeicons MCP server) and add it to the map below.
import { HugeiconsIcon } from '@hugeicons/react';
import {
  AnalyticsUpIcon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  BubbleChatIcon,
  CallIcon,
  Cancel01Icon,
  Coins01Icon,
  CpuIcon,
  Diamond02Icon,
  EnergyIcon,
  FactoryIcon,
  File01Icon,
  Globe02Icon,
  HandshakeIcon,
  Home01Icon,
  JusticeScale01Icon,
  Leaf01Icon,
  Link01Icon,
  Mail01Icon,
  Mortarboard01Icon,
  MountainIcon,
  PackageIcon,
  PinLocation02Icon,
  Recycle01Icon,
  Search01Icon,
  Shield01Icon,
  Target02Icon,
  Tick02Icon,
  UserGroupIcon,
  WavesIcon,
  WhatsappIcon,
  WheatIcon,
} from '@hugeicons/core-free-icons';

const icons = {
  phone: CallIcon,
  bolt: EnergyIcon,
  recycle: Recycle01Icon,
  mountain: MountainIcon,
  gem: Diamond02Icon,
  box: PackageIcon,
  globe: Globe02Icon,
  chart: AnalyticsUpIcon,
  shield: Shield01Icon,
  handshake: HandshakeIcon,
  file: File01Icon,
  users: UserGroupIcon,
  leaf: Leaf01Icon,
  graduation: Mortarboard01Icon,
  link: Link01Icon,
  scale: JusticeScale01Icon,
  factory: FactoryIcon,
  wheat: WheatIcon,
  coins: Coins01Icon,
  mail: Mail01Icon,
  target: Target02Icon,
  chat: BubbleChatIcon,
  whatsapp: WhatsappIcon,
  pin: PinLocation02Icon,
  check: Tick02Icon,
  wave: WavesIcon,
  home: Home01Icon,
  chip: CpuIcon,
  search: Search01Icon,
  'chevron-up': ArrowUp01Icon,
  'chevron-down': ArrowDown01Icon,
  'chevron-left': ArrowLeft01Icon,
  'chevron-right': ArrowRight01Icon,
  close: Cancel01Icon,
};

export default function Icon({ name, size = 22 }) {
  const icon = icons[name];
  if (!icon) return null;
  return <HugeiconsIcon icon={icon} size={size} aria-hidden="true" focusable="false" />;
}
