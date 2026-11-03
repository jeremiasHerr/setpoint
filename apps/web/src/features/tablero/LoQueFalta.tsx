import type { PartidoDelTablero, Tablero } from '@setpoint/shared';
import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Numero } from '../../components/Numero';
import { Tarjeta } from '../../components/Tarjeta';
import { urlDeWhatsApp } from '../padron/linkPersonal';
import { TextoConNumeros } from '../resultados/AlGuardar';
import { dondeSeJuega, mensajeParaCoordinar, nombresDelPartido, textoDeLosDias } from './tablero';

const accion = 'inline-flex h-9 items-center rounded-[9px] px-[13px] text-[13px] font-medium';

// "Escribirles" abre, debajo de la fila, el WhatsApp de cada jugador con el mensaje listo
// (decisión 062). Sin teléfono en el padrón, ese jugador no tiene enlace.
function Escribirles({ partido, tablero }: { partido: PartidoDelTablero; tablero: Tablero }) {
  return (
    <ul className={`flex flex-wrap gap-2 px-5 pb-4 ${tablero.fase === 'grupos' ? 'md:pl-[98px]' : 'md:pl-[186px]'}`}>
      {(['A', 'B'] as const).map((lado) => {
        const jugador = lado === 'A' ? partido.jugadorA! : partido.jugadorB!;
        return (
          <li key={lado}>
            {jugador.telefono ? (
              <a
                href={urlDeWhatsApp(jugador.telefono, mensajeParaCoordinar(partido, lado, tablero))}
                target="_blank"
                rel="noreferrer"
                className={`${accion} border border-linea hover:bg-fondo`}
              >
                WhatsApp a {jugador.apellido}
              </a>
            ) : (
              <span className={`${accion} border border-linea text-gris-400`}>{jugador.apellido} no tiene teléfono en el padrón</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function Fila({ partido, tablero, resolver }: { partido: PartidoDelTablero; tablero: Tablero; resolver: boolean }) {
  const [escribiendo, setEscribiendo] = useState(false);
  const vencido = partido.situacion === 'vencido';

  return (
    <li className="border-b border-linea-suave last:border-b-0">
      {/* En los cuadros, la primera columna tiene que entrar "cuartos · consuelo". */}
      <div
        className={`grid gap-x-4 gap-y-2 px-5 py-3.5 md:min-h-16 md:items-center md:py-2 ${
          tablero.fase === 'grupos' ? 'md:grid-cols-[62px_minmax(0,1fr)_170px_auto]' : 'md:grid-cols-[150px_minmax(0,1fr)_170px_auto]'
        }`}
      >
        <Numero className="text-[13px] text-gris-500">{dondeSeJuega(partido, tablero)}</Numero>
        <span className={`text-base ${vencido ? 'font-semibold' : ''}`}>{nombresDelPartido(partido)}</span>
        <Numero className={`text-sm ${vencido ? 'text-rojo-texto' : 'text-gris-500'}`}>{textoDeLosDias(partido.dias)}</Numero>
        <div className="flex gap-2 md:justify-end">
          <button
            type="button"
            aria-expanded={escribiendo}
            onClick={() => setEscribiendo(!escribiendo)}
            className={`${accion} border border-linea hover:bg-fondo`}
          >
            Escribirles
          </button>
          {resolver && (
            // Resolver es cargarlo como W.O.: la pantalla de carga abre con el W.O. elegido (decisión 062).
            <Link to={`/torneos/${tablero.torneoId}/resultados/${partido.id}?tipo=walkover`} className={`${accion} bg-negro font-semibold text-white`}>
              Resolver
            </Link>
          )}
        </div>
      </div>
      {escribiendo && <Escribirles partido={partido} tablero={tablero} />}
    </li>
  );
}

function Encabezado({ rojo = false, titulo, cantidad, children }: { rojo?: boolean; titulo: string; cantidad: number; children: ReactNode }) {
  return (
    <div
      className={`flex flex-wrap items-center gap-x-[9px] gap-y-1 border-b px-5 py-[11px] ${
        rojo ? 'border-rojo-linea bg-rojo-fondo' : 'border-linea bg-fondo-tabla'
      }`}
    >
      <span className={`size-2 rounded-[2px] ${rojo ? 'bg-rojo' : 'bg-linea'}`} />
      <h3 className={`text-sm font-semibold ${rojo ? 'text-rojo-texto' : ''}`}>
        {titulo} · <Numero>{cantidad}</Numero>
      </h3>
      <p className={`text-sm ${rojo ? 'text-rojo-texto/80' : 'text-gris-500'}`}>{children}</p>
    </div>
  );
}

// La lista de trabajo, ordenada por urgencia: primero los vencidos, que resuelve la organización
// (02-dominio.md §8.4), y después los que nadie coordinó.
export function LoQueFalta({ tablero }: { tablero: Tablero }) {
  const { vencidos, sinCoordinar, totales } = tablero;
  const nada = vencidos.length === 0 && sinCoordinar.length === 0;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-[-0.025em]">Lo que falta</h2>
        {!nada && <p className="text-sm text-gris-500">Ordenado por urgencia</p>}
      </div>

      <Tarjeta className="overflow-hidden">
        {vencidos.length > 0 && (
          <>
            <Encabezado rojo titulo="Vencidos sin jugarse" cantidad={vencidos.length}>
              Los resolvés vos: cargá el W.O. que corresponda
            </Encabezado>
            <ul>
              {vencidos.map((partido) => (
                <Fila key={partido.id} partido={partido} tablero={tablero} resolver />
              ))}
            </ul>
          </>
        )}

        {sinCoordinar.length > 0 && (
          <>
            <Encabezado titulo="Sin coordinar" cantidad={sinCoordinar.length}>
              Nadie anotó fecha todavía
            </Encabezado>
            <ul>
              {sinCoordinar.map((partido) => (
                <Fila key={partido.id} partido={partido} tablero={tablero} resolver={false} />
              ))}
            </ul>
          </>
        )}

        {nada && <p className="px-5 py-5 text-[15px] text-gris-500">No hay partidos vencidos ni sin coordinar.</p>}

        {totales.conFecha > 0 && (
          <p className="border-t border-linea bg-fondo-tabla px-5 py-3.5 text-sm text-gris-500">
            <TextoConNumeros
              frase={
                totales.conFecha === 1
                  ? ['También hay ', 1, ' partido con fecha acordada que todavía no se jugó.']
                  : ['También hay ', totales.conFecha, ' partidos con fecha acordada que todavía no se jugaron.']
              }
            />
          </p>
        )}
      </Tarjeta>
    </section>
  );
}
