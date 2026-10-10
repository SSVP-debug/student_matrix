import { Fragment, type ReactNode } from 'react';

// Tiny, dependency-free, XSS-safe markdown renderer (headings, bullets, **bold**, _italic_, `code`).
const inline = (s: string): ReactNode[] =>
  s.split(/(\*\*[^*]+\*\*|`[^`]+`|_[^_]+_)/g).filter(Boolean).map((part, i) => {
    if (part.startsWith('**')) return <strong key={i} className="text-white">{part.slice(2, -2)}</strong>;
    if (part.startsWith('`')) return <code key={i} className="px-1 rounded bg-white/10 text-cyan-200">{part.slice(1, -1)}</code>;
    if (part.length > 2 && part.startsWith('_') && part.endsWith('_')) return <em key={i}>{part.slice(1, -1)}</em>;
    return <Fragment key={i}>{part}</Fragment>;
  });

export const Md = ({ text }: { text: string }) => {
  const out: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) { out.push(<ul key={`l${out.length}`} className="list-disc pl-5 space-y-1">{list.map((l, i) => <li key={i}>{inline(l)}</li>)}</ul>); list = []; }
  };
  text.split('\n').forEach((line, i) => {
    const t = line.trim();
    if (/^[-•*] /.test(t)) { list.push(t.slice(2)); return; }
    flush();
    if (!t) return;
    if (t.startsWith('## ')) out.push(<h3 key={i} className="text-white font-semibold text-lg mt-3">{inline(t.slice(3))}</h3>);
    else if (t.startsWith('# ')) out.push(<h2 key={i} className="text-white font-bold text-xl mt-3">{inline(t.slice(2))}</h2>);
    else out.push(<p key={i}>{inline(t)}</p>);
  });
  flush();
  return <div className="space-y-2 text-white/85 leading-relaxed">{out}</div>;
};
