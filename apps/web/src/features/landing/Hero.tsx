import { BotonCrearCircuito } from './BotonCrearCircuito';
import { Demo } from './demo/Demo';

// El único lugar con atmósfera (design.md, Hero de la landing): un marco con la pintura del club de
// noche, el titular sobre el cielo y, debajo, el demo del producto. El cielo de la pintura es más claro
// que la pared, para que el marco se despegue de la página (decisión 145).
export function Hero() {
  return (
    <>
      {/* El marco nunca es más ancho que alto: la pintura, cuadrada y anclada abajo, se ve entera. */}
      <div className="relative isolate mx-auto min-h-[min(calc(100vw-48px),1600px)] w-[min(calc(100%-32px),1600px)] overflow-hidden rounded-superficie bg-noche px-6 pt-12 pb-32 max-[859px]:w-[calc(100%-16px)] max-[859px]:rounded-[14px] max-[859px]:px-4 max-[859px]:pt-14 max-[859px]:pb-[72px]">
        <picture>
          <source media="(max-width: 859px)" srcSet="/pinturas/cancha-noche-celu.jpg" />
          <img
            src="/pinturas/cancha-noche-2400.jpg"
            srcSet="/pinturas/cancha-noche-1800.jpg 1800w, /pinturas/cancha-noche-2400.jpg 2400w"
            sizes="min(100vw, 1600px)"
            alt=""
            aria-hidden="true"
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 -z-20 block size-full object-cover object-[50%_100%]"
          />
        </picture>
        {/* Sin velo arriba: un velo oscuro emparejaba el cielo con la pared y el marco desaparecía. En el
            celular el texto baja hasta la cancha, así que lleva un velo solo detrás de la bajada y el
            botón, transparente arriba para no tapar el borde. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 hidden h-[460px] bg-linear-to-b from-transparent from-20% via-noche-900/55 via-55% to-transparent max-[859px]:block" />
        <span className="pointer-events-none absolute inset-0 z-3 rounded-[inherit] ring-1 ring-cal/20 ring-inset" />

        <h1 className="mx-auto max-w-[820px] text-center font-serif text-[clamp(36px,4.72vw,68px)] leading-[1.04] font-medium tracking-[-0.028em] text-balance text-white [font-variation-settings:'opsz'_72] max-[859px]:text-[36px] max-[859px]:leading-[37.4px]">
          Tu circuito de tenis, sin planillas ni comprobantes.
        </h1>
        <p className="mx-auto mt-5 max-w-[560px] text-center text-[clamp(16px,1.32vw,19px)] leading-[1.53] text-cal max-[859px]:mt-4 max-[859px]:text-[16px] max-[859px]:leading-6">
          Inscripciones con Mercado Pago, zonas, cuadros y ranking que se calculan solos. Vos cargás el resultado; lo demás ya está hecho.
        </p>
        {/* El texto sube y el botón no: entre los dos se ve la cancha de atrás. */}
        <div className="mt-[68px] flex justify-center max-[859px]:mt-6 max-[859px]:flex-col max-[859px]:items-stretch">
          <BotonCrearCircuito className="max-[859px]:h-14" />
        </div>

        <Demo />
      </div>
    </>
  );
}
