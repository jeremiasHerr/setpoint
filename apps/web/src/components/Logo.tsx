type Props = {
  sobreNoche?: boolean;
  // El de la landing, en la barra y el pie.
  grande?: boolean;
};

// Las marcas de una zona: tres partidos jugados y el último, levantado, es el set point (decisión
// 105). Sobre noche, las barras van en blanco y la levantada en pelota; sobre claro, en noche y lona,
// porque la pelota no se ve sobre el papel.
export function Logo({ sobreNoche = false, grande = false }: Props) {
  return (
    <span
      className={`inline-flex items-baseline gap-[0.4em] font-display font-semibold tracking-[-0.02em] ${
        grande ? 'text-xl' : 'text-base'
      } ${sobreNoche ? 'text-white' : 'text-noche'}`}
    >
      <svg viewBox="0 0 63 53" className="h-[0.9em] w-[1.07em] shrink-0" aria-hidden="true" focusable="false">
        <rect x="0" y="12" width="11" height="41" rx="2" fill="currentColor" />
        <rect x="17" y="12" width="11" height="41" rx="2" fill="currentColor" />
        <rect x="34" y="12" width="11" height="41" rx="2" fill="currentColor" />
        <rect x="52" y="0" width="11" height="41" rx="2" className={sobreNoche ? 'fill-pelota' : 'fill-lona'} />
      </svg>
      SetPoint
    </span>
  );
}
