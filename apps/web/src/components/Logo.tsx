type Props = {
  sobreNegro?: boolean;
  // El de la landing, en el encabezado y el pie.
  grande?: boolean;
};

// Las cuatro marcas del logo, en la grilla de 120 de docs/logos/marcas.svg: tres hechas y la que
// está en juego, en lima y levantada (decisión 104).
function Marcas() {
  return (
    <>
      {[22, 42, 62].map((x) => (
        <rect key={x} x={x} y={39} width={16} height={50} rx={4} className="fill-white" />
      ))}
      <rect x={82} y={27} width={16} height={50} rx={4} className="fill-lima" />
    </>
  );
}

export function Logo({ sobreNegro = false, grande = false }: Props) {
  return (
    <div
      className={`flex ${sobreNegro ? 'items-baseline' : 'items-center'} ${grande ? 'gap-2.5' : 'gap-[9px]'}`}
    >
      {sobreNegro ? (
        // Sobre negro las marcas van sueltas, apoyadas en la línea de base de la palabra.
        <svg
          viewBox="22 27 76 62"
          aria-hidden="true"
          className={`aspect-[76/62] shrink-0 ${grande ? 'h-[19px]' : 'h-3.5'}`}
        >
          <Marcas />
        </svg>
      ) : (
        <svg
          viewBox="0 0 120 120"
          aria-hidden="true"
          className={`shrink-0 ${grande ? 'size-[30px]' : 'size-6'}`}
        >
          <rect width={120} height={120} rx={28} className="fill-negro" />
          <Marcas />
        </svg>
      )}
      <span
        className={`font-semibold ${grande ? 'text-[21px] tracking-[-0.03em]' : 'text-base tracking-[-0.02em]'} ${sobreNegro ? 'text-white' : 'text-negro'}`}
      >
        SetPoint
      </span>
    </div>
  );
}
