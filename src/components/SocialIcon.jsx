// Social media logos from Hugeicons (free Stroke Rounded style).
import { HugeiconsIcon } from '@hugeicons/react';
import { Facebook01Icon, InstagramIcon, Linkedin01Icon, NewTwitterIcon } from '@hugeicons/core-free-icons';

const marks = {
  linkedin: Linkedin01Icon,
  x: NewTwitterIcon,
  facebook: Facebook01Icon,
  instagram: InstagramIcon,
};

export default function SocialIcon({ name, size = 18 }) {
  const icon = marks[name];
  if (!icon) return null;
  return <HugeiconsIcon icon={icon} size={size} aria-hidden="true" focusable="false" />;
}
