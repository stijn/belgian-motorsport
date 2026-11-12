// The blurred thumbnails from src/data/lqip.json (tools/lqip.mjs), as an inline style for the box a
// photo loads into: the tiny WebP stretched over the box reads as a blur, and the photo fades in over it.
import lqip from '../data/lqip.json';

const map = lqip as Record<string, string>;

/** `blurStyle('gallery/foo.jpg')` → `background-image:url(data:...)`, or undefined when unknown. */
export const blurStyle = (key: string): string | undefined => (map[key] ? `background-image:url(${map[key]})` : undefined);
