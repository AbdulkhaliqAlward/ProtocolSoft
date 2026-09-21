/** Minimal lexical richtext renderer — renders only what public content uses
 *  (paragraphs, headings, bulleted/numbered lists, bold/italic/underline text,
 *  links). The web service has no payload dependencies (verify:no-db), so this
 *  replaces @payloadcms/richtext-lexical's React serializer. Unknown node types
 *  render their text content recursively — never raw JSON. */
import { Fragment, type ReactNode } from 'react';

type Node = Record<string, unknown>;

type Render = (node: Node, key: string) => ReactNode;

const textNode = (node: Node, key: string): ReactNode => {
  const text = typeof node.text === 'string' ? node.text : '';
  if (!text) return null;
  const format = typeof node.format === 'number' ? node.format : 0;
  let el: ReactNode = text;
  if (format & 1) el = <strong key={key}>{el}</strong>;
  else if (format & 2) el = <em key={key}>{el}</em>;
  else if (format & 8) el = (
    <span key={key} style={{ textDecoration: 'underline' }}>{el}</span>
  );
  else if (format & 16) el = <code key={key} className="mono">{el}</code>;
  else el = <Fragment key={key}>{el}</Fragment>;
  return el;
};

const linkNode = (node: Node, key: string, render: Render): ReactNode => {
  const url = typeof node.url === 'string' ? node.url : '';
  const external = /^https?:\/\//.test(url);
  return (
    <a
      key={key}
      href={url}
      className="inline-link"
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {node.children != null ? (node.children as Node[]).map((c, i) => render(c, `${key}.${i}`)) : null}
    </a>
  );
};

const lineDirection = (node: Node): 'rtl' | 'ltr' | undefined =>
  node.direction === 'rtl' || node.direction === 'ltr' ? node.direction : undefined;

const renderNode = (node: Node, key: string): ReactNode => {
  const type = typeof node.type === 'string' ? node.type : '';
  switch (type) {
    case 'text':
      return textNode(node, key);
    case 'link':
      return linkNode(node, key, renderNode);
    case 'linebreak':
    case 'tab':
      return <br key={key} />;
    case 'paragraph': {
      const children = (node.children as Node[] | undefined)?.map((c, i) => renderNode(c, `${key}.${i}`)) ?? null;
      const empty = (node.children as Node[] | undefined)?.length === 0;
      if (empty) return <br key={key} />;
      return <p key={key} dir={lineDirection(node)}>{children}</p>;
    }
    case 'heading': {
      const tag = (['h1', 'h2', 'h3', 'h4'].includes(String(node.tag)) ? node.tag : 'h3') as 'h1' | 'h2' | 'h3' | 'h4';
      const Tag = tag;
      return (
        <Tag key={key} dir={lineDirection(node)}>
          {(node.children as Node[] | undefined)?.map((c, i) => renderNode(c, `${key}.${i}`)) ?? null}
        </Tag>
      );
    }
    case 'list': {
      const items = (node.children as Node[] | undefined) ?? [];
      const Tag = node.listType === 'number' ? 'ol' : 'ul';
      return (
        <Tag key={key}>
          {items.map((c, i) => renderNode(c, `${key}.${i}`))}
        </Tag>
      );
    }
    case 'listitem':
      return (
        <li key={key}>
          {(node.children as Node[] | undefined)?.map((c, i) => renderNode(c, `${key}.${i}`)) ?? null}
        </li>
      );
    case 'quote':
      return <blockquote key={key}>{(node.children as Node[] | undefined)?.map((c, i) => renderNode(c, `${key}.${i}`)) ?? null}</blockquote>;
    default: {
      // Unknown node: recurse into children, surface plain text fields — never JSON.
      if (node.children != null) {
        return <Fragment key={key}>{(node.children as Node[]).map((c, i) => renderNode(c, `${key}.${i}`))}</Fragment>;
      }
      if (typeof node.text === 'string') return <Fragment key={key}>{node.text}</Fragment>;
      return null;
    }
  }
};

export const RichText = ({ data, className }: { data: unknown; className?: string }) => {
  if (data == null || typeof data !== 'object') return null;
  const root = (data as { root?: Node }).root;
  if (!root) return null;
  const children = (root.children as Node[] | undefined) ?? [];
  if (children.length === 0) return null;
  return <div className={className}>{children.map((c, i) => renderNode(c, `r.${i}`))}</div>;
};
