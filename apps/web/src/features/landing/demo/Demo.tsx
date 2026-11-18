import { useRef } from 'react';
import { CargaDelDemo } from './CargaDelDemo';
import { CelularDelDemo } from './CelularDelDemo';
import { useRegistro } from './registro';
import { TableroDelDemo } from './TableroDelDemo';
import { useEscala } from './useEscala';
import { useLineaDeTiempo } from './useLineaDeTiempo';

const TEXTOS_DE_LA_LEYENDA = [
  'Bustos y Millán ya jugaron. Falta cargarlo.',
  'Elegís el partido y cargás el marcador.',
  'Antes de guardar, ves cómo queda la zona.',
  'Lo demás se actualiza solo.',
];

// El demo del hero: una foto animada del producto, con datos fijos. Recorre Tablero, Cargar resultado y
// vuelta al Tablero. Es el único movimiento de la landing; se puede pausar y con "reducir movimiento"
// queda quieto en la vista previa de la zona.
export function Demo() {
  const esc = useRegistro();
  const cel = useRegistro();
  const grupoRef = useRef<HTMLDivElement>(null);
  const progresoRef = useRef<HTMLSpanElement>(null);
  const d = useLineaDeTiempo({ grupoRef, progresoRef, esc, cel });
  const [refEsc, escalaEsc] = useEscala(1280);
  const [refCel, escalaCel] = useEscala(360);
  const { banderas } = d;

  return (
    <div
      ref={grupoRef}
      role="group"
      aria-label="Demostración: desde el Tablero se abre Cargar resultado, se elige Bustos – Millán en la zona G y se carga 6-3 4-6 10-7. Antes de guardar se ve cómo queda la zona, y de vuelta en el Tablero hay 32 de 48 partidos jugados."
      className={`relative mx-auto mt-16 w-[min(1240px,max(calc(100%-200px),880px))] max-[1023px]:w-[min(100%,440px)] max-[859px]:mt-10 ${
        d.sinTransicion ? '[&_*]:transition-none!' : ''
      }`}
    >
      {/* La ventana de la compu: un lienzo de 1280 × 820 achicado al ancho disponible. */}
      <div
        ref={refEsc}
        aria-hidden="true"
        className="pointer-events-none relative isolate aspect-[1280/820] overflow-hidden rounded-tarjeta bg-niebla shadow-demo max-[1023px]:hidden"
      >
        <div
          ref={esc.reg('lienzo')}
          className="absolute top-0 left-0 h-[820px] w-[1280px] origin-top-left overflow-hidden"
          style={{ transform: `scale(${escalaEsc})` }}
        >
          <TableroDelDemo banderas={banderas} apretado={d.apretado === 'cargar'} reg={esc.reg} />
          <CargaDelDemo
            banderas={banderas}
            foco={d.foco}
            apretado={d.apretado}
            desplazo={d.desplazo.esc}
            reg={esc.reg}
          />
          <div
            className="pointer-events-none absolute top-0 left-0 z-5"
            style={{
              transform: `translate(${d.cursor.x}px, ${d.cursor.y}px)`,
              opacity: banderas.has('cur') ? 1 : 0,
              transition: `transform ${d.cursor.ms}ms cubic-bezier(.4,0,.2,1), opacity ${d.cursor.sale ? 600 : 300}ms`,
            }}
          >
            <svg
              viewBox="0 0 18 22"
              className={`block h-[22px] w-[18px] origin-[1px_1px] transition-transform duration-[120ms] ${
                banderas.has('clic') ? 'scale-[.85]' : ''
              }`}
            >
              <path
                d="M1 1 L1 17 L5.5 13 L8.5 20 L11 19 L8 12 L14 12 Z"
                className="fill-noche stroke-white"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div
            className={`pointer-events-none absolute inset-x-0 top-[139px] bottom-0 z-4 bg-niebla transition-opacity duration-250 ${
              banderas.has('velado') ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>
        <span className="pointer-events-none absolute inset-0 z-6 rounded-[inherit] border border-white/14" />
      </div>

      {/* Por debajo de 1024 px, el recorte del celular: el tablero de 1280 quedaría a la mitad. */}
      <div
        ref={refCel}
        aria-hidden="true"
        className="pointer-events-none relative isolate hidden aspect-[360/480] w-full overflow-hidden rounded-[10px] bg-niebla shadow-demo max-[1023px]:block"
      >
        <div
          ref={cel.reg('lienzo')}
          className="absolute top-0 left-0 h-[480px] w-[360px] origin-top-left overflow-hidden bg-niebla font-sans text-noche"
          style={{ transform: `scale(${escalaCel})` }}
        >
          <CelularDelDemo
            banderas={banderas}
            foco={d.foco}
            apretado={d.apretado}
            toque={d.toque}
            desplazo={d.desplazo.cel}
            reg={cel.reg}
          />
        </div>
        <span className="pointer-events-none absolute inset-0 z-6 rounded-[inherit] border border-white/14" />
      </div>

      <div
        className="absolute -bottom-4 left-1/2 z-2 flex h-10 min-w-[340px] -translate-x-1/2 items-center gap-2.5 overflow-hidden rounded-[10px] border border-borde-noche bg-noche-900 pr-1.5 pl-3.5 max-[1023px]:static max-[1023px]:mt-2.5 max-[1023px]:h-11 max-[1023px]:w-full max-[1023px]:min-w-0 max-[1023px]:translate-x-0"
      >
        <span className="grid min-w-0 flex-1 text-[14px] leading-5 font-medium whitespace-nowrap text-cal max-[1023px]:text-[13px] max-[1023px]:leading-[18px] max-[1023px]:whitespace-normal">
          {TEXTOS_DE_LA_LEYENDA.map((texto, i) => (
            <span
              key={texto}
              aria-hidden={d.paso !== i + 1}
              className={`col-start-1 row-start-1 transition-opacity duration-200 motion-reduce:transition-none ${
                d.paso === i + 1 ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {texto}
            </span>
          ))}
        </span>
        <span
          ref={progresoRef}
          aria-hidden="true"
          className={`absolute inset-x-0 bottom-0 h-0.5 origin-left bg-lona [transform:scaleX(0)] ${d.corriendo ? '' : 'hidden'}`}
        />
        {d.corriendo && (
          <button
            type="button"
            onClick={d.alternarPausa}
            aria-label={d.pausado ? 'Reanudar la demostración' : 'Pausar la demostración'}
            className="pointer-events-auto grid size-7 flex-none place-items-center rounded-md p-0 text-cal hover:bg-noche-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white max-[1023px]:size-11"
          >
            <svg
              viewBox="0 0 14 14"
              className="size-3.5 fill-none stroke-current stroke-[1.7]"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {d.pausado ? <path d="M4 2.5l7.5 4.5L4 11.5z" /> : <path d="M4.5 2.5v9M9.5 2.5v9" />}
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
