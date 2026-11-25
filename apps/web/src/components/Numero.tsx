import type { HTMLAttributes } from 'react';

export function Numero({ className = '', ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={`font-mono tabular-nums ${className}`} {...props} />;
}

// Un texto que mezcla palabras y cifras ("sáb 21 · 10:00", "5 días de atraso"): las palabras van en
// la sans y solo las cifras en mono (design.md §4, decisión 123).
const CIFRAS = /(\$?\d+(?:[.,:/-]\d+)*)/;

export function ConCifras({ children, className }: { children: string; className?: string }) {
  return (
    <span className={className}>
      {children.split(CIFRAS).map((parte, i) => (i % 2 === 1 ? <Numero key={i}>{parte}</Numero> : parte))}
    </span>
  );
}
