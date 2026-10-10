import { Fragment, type ReactNode } from 'react';

// Lightweight, dependency-free, XSS-safe markdown renderer
const inline = (s: string): ReactNode[] =>
  s.split(/(\*\*[^*]+\*\*|`[^`]+`|_[^_]+_|\*[^*]+\*)/g).filter(Boolean).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded-md bg-stellar-card border border-stellar-border text-stellar-cyan font-mono text-xs">
          {part.slice(1, -1)}
        </code>
      );
    }
    if ((part.startsWith('_') && part.endsWith('_')) || (part.startsWith('*') && part.endsWith('*'))) {
      return <em key={i} className="text-stellar-secondary italic">{part.slice(1, -1)}</em>;
    }
    return <Fragment key={i}>{part}</Fragment>;
  });

export const Md = ({ text }: { text: string }) => {
  const out: ReactNode[] = [];
  let list: string[] = [];
  let inCode = false;
  let codeLines: string[] = [];

  const flushList = () => {
    if (list.length) {
      out.push(
        <ul key={`list-${out.length}`} className="list-disc pl-5 space-y-1 text-stellar-text/90 my-2">
          {list.map((item, idx) => (
            <li key={idx} className="leading-relaxed">{inline(item)}</li>
          ))}
        </ul>
      );
      list = [];
    }
  };

  const flushCode = () => {
    if (codeLines.length) {
      out.push(
        <pre key={`code-${out.length}`} className="p-3.5 my-2.5 rounded-xl bg-[#060810] border border-stellar-border font-mono text-xs text-stellar-cyan overflow-x-auto leading-relaxed">
          <code>{codeLines.join('\n')}</code>
        </pre>
      );
      codeLines = [];
    }
  };

  const lines = text.split('\n');

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    // Code block toggle
    if (trimmed.startsWith('```')) {
      if (inCode) {
        flushCode();
        inCode = false;
      } else {
        flushList();
        inCode = true;
      }
      return;
    }

    if (inCode) {
      codeLines.push(line);
      return;
    }

    // List item
    if (/^[-*•]\s+/.test(trimmed)) {
      list.push(trimmed.replace(/^[-*•]\s+/, ''));
      return;
    }
    flushList();

    if (!trimmed) return;

    // Blockquote
    if (trimmed.startsWith('> ')) {
      out.push(
        <blockquote key={`quote-${i}`} className="border-l-2 border-stellar-cyan pl-3.5 py-1 my-2 text-stellar-secondary italic">
          {inline(trimmed.slice(2))}
        </blockquote>
      );
      return;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      out.push(
        <h4 key={`h4-${i}`} className="text-white font-semibold text-base mt-3 mb-1 tracking-tight">
          {inline(trimmed.slice(4))}
        </h4>
      );
    } else if (trimmed.startsWith('## ')) {
      out.push(
        <h3 key={`h3-${i}`} className="text-white font-bold text-lg mt-3 mb-1 tracking-tight">
          {inline(trimmed.slice(3))}
        </h3>
      );
    } else if (trimmed.startsWith('# ')) {
      out.push(
        <h2 key={`h2-${i}`} className="text-white font-extrabold text-xl mt-4 mb-2 tracking-tight">
          {inline(trimmed.slice(2))}
        </h2>
      );
    } else {
      out.push(
        <p key={`p-${i}`} className="text-stellar-text/90 leading-relaxed my-1">
          {inline(trimmed)}
        </p>
      );
    }
  });

  flushList();
  flushCode();

  return <div className="space-y-1.5 leading-relaxed text-sm md:text-base">{out}</div>;
};
