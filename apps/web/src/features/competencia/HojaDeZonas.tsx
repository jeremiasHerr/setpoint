import type { ZonaSorteada } from '@setpoint/shared';
import type { ReactNode } from 'react';
import { Numero } from '../../components/Numero';
import { Tarjeta } from '../../components/Tarjeta';
import { sumaDeSiembra } from './zonas';

// Hasta cuatro zonas por fila, repartidas parejo: 6 zonas van en dos filas de 3, no en una de 4 y otra de 2.
const GRILLA = ['', 'grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4'];

function columnasPara(zonas: number) {
  return Math.ceil(zonas / Math.ceil(zonas / 4));
}

// Las zonas se separan con líneas finas: a la izquierda, salvo la primera de cada fila, y arriba, desde la segunda fila.
function celdaDeZona(i: number, columnas: number) {
  return `flex min-w-0 flex-col border-linea ${i % columnas ? 'border-l' : ''} ${i >= columnas ? 'border-t' : ''}`;
}

const filaDeJugador = 'grid h-14 grid-cols-[32px_minmax(0,1fr)] items-center border-t border-linea-suave first:border-t-0';

function Encabezado({ titulo, aclaracion, resumen }: { titulo: string; aclaracion?: string; resumen?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-linea px-6 py-[15px]">
      <h2 className="text-lg font-semibold tracking-[-0.02em]">
        {titulo}
        {aclaracion && <span className="ml-2.5 text-sm font-normal text-pizarra-500">{aclaracion}</span>}
      </h2>
      {resumen}
    </div>
  );
}

// La hoja de las zonas desde lg; en el celular siguen las tarjetas (decisión 111).
export function HojaDeZonas({
  titulo,
  aclaracion,
  resumen,
  zonas,
}: {
  titulo: string;
  aclaracion?: string;
  resumen?: ReactNode;
  zonas: ZonaSorteada[];
}) {
  const columnas = columnasPara(zonas.length);
  return (
    <Tarjeta className="overflow-hidden">
      <Encabezado titulo={titulo} aclaracion={aclaracion} resumen={resumen} />

      <div className={`grid ${GRILLA[columnas]}`}>
        {zonas.map((zona, i) => {
          // No se asume el orden de la lista: la cabeza de serie es quien tiene la siembra más baja.
          const cabezaDeSerie = Math.min(...zona.integrantes.map((j) => j.posicionSiembra));
          return (
            <section key={zona.grupo} className={celdaDeZona(i, columnas)}>
              <div className="flex items-baseline justify-between gap-3 px-6 pt-[22px] pb-2.5">
                <h3 className="font-display text-[22px] font-semibold tracking-[-0.02em]">Zona {zona.grupo}</h3>
                <p className="flex items-baseline gap-[7px]">
                  <Numero className="text-xs text-pizarra-500">suma</Numero>
                  <Numero className="text-[22px] font-medium tracking-[-0.02em]">{sumaDeSiembra(zona)}</Numero>
                </p>
              </div>

              <ul className="px-6 pb-4">
                {/* Al sortear de nuevo, la animación deja ver quién cambió de zona. */}
                {zona.integrantes.map(({ jugadorId, posicionSiembra, nombre, apellido }) => (
                  <li key={jugadorId} className={`${filaDeJugador} motion-safe:animate-aparecer`}>
                    <Numero
                      className={
                        posicionSiembra === cabezaDeSerie ? 'text-sm font-semibold text-noche' : 'text-sm text-pizarra-500'
                      }
                    >
                      {String(posicionSiembra).padStart(2, '0')}
                    </Numero>
                    <span className="truncate text-[17px] text-pizarra-700">
                      {nombre} <span className="font-semibold text-noche">{apellido}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </Tarjeta>
  );
}

// Las zonas antes del primer sorteo: el lugar de cada jugador, todavía vacío.
export function HojaDeZonasVacia({
  titulo,
  grupos,
  lugares,
  sorteando,
}: {
  titulo: string;
  grupos: string[];
  lugares: number;
  sorteando: boolean;
}) {
  const columnas = columnasPara(grupos.length);
  return (
    <Tarjeta className="overflow-hidden" aria-hidden="true">
      <Encabezado titulo={titulo} />

      <div className={`grid ${GRILLA[columnas]}`}>
        {grupos.map((grupo, i) => (
          <section key={grupo} className={celdaDeZona(i, columnas)}>
            <div className="flex items-baseline justify-between gap-3 px-6 pt-[22px] pb-2.5">
              <h3 className="font-display text-[22px] font-semibold tracking-[-0.02em] text-pizarra-400">Zona {grupo}</h3>
            </div>

            <ul className={`px-6 pb-4 ${sorteando ? 'motion-safe:animate-pulse' : ''}`}>
              {Array.from({ length: lugares }, (_, i) => (
                <li key={i} className={`${filaDeJugador} gap-0`}>
                  <span className="h-2.5 w-5 rounded-full bg-linea-suave" />
                  <span className="h-2.5 w-32 rounded-full bg-linea-suave" />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Tarjeta>
  );
}
