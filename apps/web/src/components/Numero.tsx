import type { HTMLAttributes } from 'react';

export function Numero({ className = '', ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={`font-mono tabular-nums ${className}`} {...props} />;
}
