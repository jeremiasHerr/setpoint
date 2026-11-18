import { useState } from 'react';

type Props = {
  sobreNoche?: boolean;
  // El de la landing, en la barra y el pie.
  grande?: boolean;
};

// Las marcas de una zona: tres partidos jugados y el último, levantado, es el set point (decisión
// 105). Sobre noche, las barras van en blanco y la levantada en pelota; sobre claro, en noche y lona,
// porque la pelota no se ve sobre el papel.
//
// Al pasar el mouse, el verde arranca en la primera barra y recorre las cuatro hasta volver a la
// última: es la única animación del logo, y solo responde al mouse (design.md §6, Logo). Corre
// completa aunque el mouse se vaya enseguida, y no vuelve a arrancar hasta terminar: atada al hover,
// se cortaba a la mitad al cruzar el logo rápido.
export function Logo({ sobreNoche = false, grande = false }: Props) {
  const [enJuego, setEnJuego] = useState(false);

  const alEntrar = () => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) setEnJuego(true);
  };

  return (
    <span
      onMouseEnter={alEntrar}
      className={`inline-flex items-baseline gap-[0.38em] font-display font-semibold tracking-[-0.02em] ${
        grande ? 'text-2xl' : 'text-lg'
      } ${sobreNoche ? 'text-white [--logo-acento:var(--color-pelota)]' : 'text-noche [--logo-acento:var(--color-lona)]'}`}
    >
      {/* El ícono, un poco más alto que las mayúsculas: se lee como marca y no como una letra más. */}
      <svg viewBox="0 0 63 53" className="h-[1.1em] w-[1.31em] shrink-0" aria-hidden="true" focusable="false">
        <rect x="0" y="12" width="11" height="41" rx="2" fill="currentColor" className={enJuego ? 'animate-logo-1' : undefined} />
        <rect x="17" y="12" width="11" height="41" rx="2" fill="currentColor" className={enJuego ? 'animate-logo-2' : undefined} />
        <rect x="34" y="12" width="11" height="41" rx="2" fill="currentColor" className={enJuego ? 'animate-logo-3' : undefined} />
        {/* La última termina junto con la tercera, a los 800 ms: ahí se apaga y queda lista para la próxima. */}
        <rect
          x="52"
          y="0"
          width="11"
          height="41"
          rx="2"
          className={`fill-(--logo-acento) ${enJuego ? 'animate-logo-4' : ''}`}
          onAnimationEnd={() => setEnJuego(false)}
        />
      </svg>
      Setpoint
    </span>
  );
}
