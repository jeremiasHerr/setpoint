type Props = {
  sobreNoche?: boolean;
  // El de la landing, en la barra y el pie.
  grande?: boolean;
};

// Las marcas de una zona: tres partidos jugados y el último, levantado, es el set point (decisión
// 104). Sobre noche, las barras van en blanco y la levantada en pelota; sobre claro, en noche y lona,
// porque la pelota no se ve sobre el papel.
//
// Con el mouse encima, el verde arranca en la primera barra y recorre las cuatro hasta volver a la
// última: es la única animación del logo, y solo responde al mouse (design.md §6, Logo).
export function Logo({ sobreNoche = false, grande = false }: Props) {
  return (
    <span
      className={`group inline-flex items-baseline gap-[0.38em] font-display font-semibold tracking-[-0.02em] ${
        grande ? 'text-2xl' : 'text-lg'
      } ${sobreNoche ? 'text-white [--logo-acento:var(--color-pelota)]' : 'text-noche [--logo-acento:var(--color-lona)]'}`}
    >
      {/* El ícono, un poco más alto que las mayúsculas: se lee como marca y no como una letra más. */}
      <svg viewBox="0 0 63 53" className="h-[1.1em] w-[1.31em] shrink-0" aria-hidden="true" focusable="false">
        <rect x="0" y="12" width="11" height="41" rx="2" fill="currentColor" className="motion-safe:group-hover:animate-logo-1" />
        <rect x="17" y="12" width="11" height="41" rx="2" fill="currentColor" className="motion-safe:group-hover:animate-logo-2" />
        <rect x="34" y="12" width="11" height="41" rx="2" fill="currentColor" className="motion-safe:group-hover:animate-logo-3" />
        <rect x="52" y="0" width="11" height="41" rx="2" className="fill-(--logo-acento) motion-safe:group-hover:animate-logo-4" />
      </svg>
      Setpoint
    </span>
  );
}
