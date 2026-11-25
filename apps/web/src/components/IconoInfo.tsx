type Props = {
  // Tamaño, con clases: size-[15px].
  className?: string;
};

// Una "i" en un círculo: abre la explicación de un campo (decisión 150). No un "!", que se lee como
// error o advertencia.
export function IconoInfo({ className = '' }: Props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true" className={className}>
      <circle cx="10" cy="10" r="8" />
      <path d="M10 9v5" />
      <circle cx="10" cy="6.2" r="0.4" fill="currentColor" />
    </svg>
  );
}
