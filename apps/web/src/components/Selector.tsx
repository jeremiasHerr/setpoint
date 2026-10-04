import type { SelectHTMLAttributes } from 'react';

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  id: string;
  rotulo: string;
};

// <select> nativo con el mismo aspecto que Campo. Las opciones van como hijos.
export function Selector({ id, rotulo, className = '', children, ...props }: Props) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={id} className="text-[13px] font-semibold text-gris-500">
        {rotulo}
      </label>
      <div className="relative flex flex-col">
        <select
          id={id}
          className="h-12 appearance-none rounded-control border border-gris-300 bg-white pr-10 pl-3.5 text-[15px] text-negro outline-none focus:border-2 focus:border-negro focus:pl-[13px]"
          {...props}
        >
          {children}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          className="pointer-events-none absolute top-1/2 right-3.5 size-[13px] -translate-y-1/2 stroke-[2.4] text-gris-500"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </div>
  );
}
