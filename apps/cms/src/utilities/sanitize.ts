/**
 * Sanitizers (Phase 2 §12/§13): error summaries stored in audit/backup records are
 * stripped of paths, hosts, credentials, and stack traces; SVG uploads (logos only)
 * are sanitized before storage.
 */
import sanitizeHtml from 'sanitize-html';

export const sanitizeErrorSummary = (input: string, maxLength = 500): string =>
  input
    // stack-trace frames and absolute paths
    .replace(/\s+at\s+.*\(?.*:[0-9]+:[0-9]+\)?/g, ' [frame]')
    .replace(/(?:[A-Za-z]:)?(?:\/|\\)[^\s'",;)]{6,}/g, '[path]')
    // URLs with credentials / internal hosts
    .replace(/\w+:\/\/[^\s'"]+@[^\s'"]+/g, '[url-with-credentials]')
    .replace(/postgres(ql)?:\/\/[^\s'"]+/gi, '[db-uri]')
    .replace(/https?:\/\/(?!protosoftdev\.com)[^\s'"]+/gi, '[url]')
    // obvious secret assignments
    .replace(/((?:api[_-]?key|token|secret|password|authorization)['"]?\s*[:=]\s*)\S+/gi, '$1[redacted]')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);

const SVG_ALLOWED_TAGS = ['svg', 'g', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse', 'defs', 'title', 'desc', 'use', 'linearGradient', 'radialGradient', 'stop'];
const SVG_ALLOWED_ATTRS = ['id', 'class', 'd', 'fill', 'stroke', 'stroke-width', 'viewBox', 'xmlns', 'width', 'height', 'x', 'y', 'x1', 'x2', 'y1', 'y2', 'cx', 'cy', 'r', 'rx', 'ry', 'points', 'offset', 'stop-color', 'stop-opacity', 'fill-opacity', 'stroke-opacity', 'transform', 'aria-hidden'];

/** Strip scripts, event handlers, foreignObject, and external references from an SVG string. */
export const sanitizeSvg = (svg: string): string => {
  if (/<script/i.test(svg) || /on[a-z]+\s*=/i.test(svg) || /<foreignObject/i.test(svg)) {
    // Obvious dangerous content: run through the strict sanitizer below anyway.
  }
  return sanitizeHtml(svg, {
    allowedTags: SVG_ALLOWED_TAGS,
    allowedAttributes: Object.fromEntries(SVG_ALLOWED_TAGS.map((t) => [t, SVG_ALLOWED_ATTRS])),
    allowedSchemes: [],
    allowProtocolRelative: false,
    disallowedTagsMode: 'discard',
  });
};
