// Every Font Awesome icon the site uses, once: Base.astro writes them as <symbol>s at the top of the
// body and Fa.astro points at them with <use>. One definition per page instead of one per icon shown
// (the home page showed 97 of them). An icon missing here still renders: Fa.astro inlines its path.
import { faFlagCheckered, faLanguage, faVideo, faUsers, faShieldHalved, faPlay, faPause, faPaperPlane, faLock, faExpand, faCheck, faCar, faCamera } from '@fortawesome/free-solid-svg-icons';
import { faYoutube, faInstagram, faFacebookF, faFlickr } from '@fortawesome/free-brands-svg-icons';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

export const spriteIcons: IconDefinition[] = [
  faFlagCheckered, faLanguage, faVideo, faUsers, faShieldHalved, faPlay, faPause, faPaperPlane, faLock, faExpand, faCheck, faCar, faCamera,
  faYoutube, faInstagram, faFacebookF, faFlickr,
];
export const symbolId = (icon: IconDefinition) => `fa-${icon.prefix}-${icon.iconName}`;
export const inSprite = (icon: IconDefinition) => spriteIcons.some((i) => i.prefix === icon.prefix && i.iconName === icon.iconName);
