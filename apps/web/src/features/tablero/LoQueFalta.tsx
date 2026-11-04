import type { PartidoDelTablero, Tablero } from '@setpoint/shared';
import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Numero } from '../../components/Numero';
import { Tarjeta } from '../../components/Tarjeta';
import { urlDeWhatsApp } from '../padron/linkPersonal';
import { TextoConNumeros } from '../resultados/AlGuardar';
import { AnotarFecha } from './AnotarFecha';
import { dondeSeJuega, elDiaYHora, mensajeParaCoordinar, nombresDelPartido, partidosConFecha, textoDeLosDias } from './tablero';

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

type Abierto = 'escribirles' | 'anotar' | null;

// En qué lista está la fila: los vencidos se resuelven; los sin coordinar y los con fecha se anotan.
type Lista = 'vencidos' | 'sin_coordinar' | 'con_fecha';

// Anotada por un jugador y sin confirmar: si el rival no tiene la app, la confirma la organización.
const textoDeAnotar = (lista: Lista, partido: PartidoDelTablero) =>
  lista === 'sin_coordinar' ? 'Anotar fecha' : partido.estado === 'anotada' ? 'Confirmar o cambiar' : 'Cambiar fecha';

function Fila({ slug, partido, tablero, lista }: { slug: string; partido: PartidoDelTablero; tablero: Tablero; lista: Lista }) {
  const resolver = lista === 'vencidos';
  // Escribirles y Anotar fecha se abren debajo de la fila, de a uno.
  const [abierto, setAbierto] = useState<Abierto>(null);
  const alternar = (que: Abierto) => setAbierto(abierto === que ? null : que);
  const sangria = tablero.fase === 'grupos' ? 'md:pl-[98px]' : 'md:pl-[186px]';
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
        {lista === 'con_fecha' && partido.fechaAcordada ? (
          <span className="flex flex-col">
            <Numero className="text-sm">{elDiaYHora(partido.fechaAcordada)}</Numero>
            <span className="text-[13px] text-gris-500">{partido.estado === 'anotada' ? 'falta que confirme el rival' : 'confirmada'}</span>
          </span>
        ) : (
          <Numero className={`text-sm ${vencido ? 'text-rojo-texto' : 'text-gris-500'}`}>{textoDeLosDias(partido.dias)}</Numero>
        )}
        <div className="flex gap-2 md:justify-end">
          <button
            type="button"
            aria-expanded={abierto === 'escribirles'}
            onClick={() => alternar('escribirles')}
            className={`${accion} border border-linea hover:bg-fondo`}
          >
            Escribirles
          </button>
          {/* La organización la carga en nombre de los dos y queda confirmada (F14, decisiones 062 y 064). */}
          {!resolver && (
            <button
              type="button"
              aria-expanded={abierto === 'anotar'}
              onClick={() => alternar('anotar')}
              className={`${accion} border border-linea hover:bg-fondo`}
            >
              {textoDeAnotar(lista, partido)}
            </button>
          )}
          {resolver && (
            // Resolver es cargarlo como W.O.: la pantalla de carga abre con el W.O. elegido (decisión 062).
            <Link to={`/torneos/${tablero.torneoId}/resultados/${partido.id}?tipo=walkover`} className={`${accion} bg-negro font-semibold text-white`}>
              Resolver
            </Link>
          )}
        </div>
      </div>
      {abierto === 'escribirles' && <Escribirles partido={partido} tablero={tablero} />}
      {abierto === 'anotar' && (
        <AnotarFecha slug={slug} torneoId={tablero.torneoId} partidoId={partido.id} sangria={sangria} onCerrar={() => setAbierto(null)} />
      )}
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
export function LoQueFalta({ slug, tablero }: { slug: string; tablero: Tablero }) {
  const { vencidos, sinCoordinar, totales } = tablero;
  const nada = vencidos.length === 0 && sinCoordinar.length === 0;
  // Los con fecha no son urgentes: se despliegan desde el pie, para cambiarlos o confirmarlos (F14).
  const [verConFecha, setVerConFecha] = useState(false);
  const conFecha = partidosConFecha(tablero);

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
                <Fila key={partido.id} slug={slug} partido={partido} tablero={tablero} lista="vencidos" />
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
                <Fila key={partido.id} slug={slug} partido={partido} tablero={tablero} lista="sin_coordinar" />
              ))}
            </ul>
          </>
        )}

        {nada && <p className="px-5 py-5 text-[15px] text-gris-500">No hay partidos vencidos ni sin coordinar.</p>}

        {totales.conFecha > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-linea bg-fondo-tabla px-5 py-3.5">
            <p className="text-sm text-gris-500">
              <TextoConNumeros
                frase={
                  totales.conFecha === 1
                    ? ['También hay ', 1, ' partido con fecha acordada que todavía no se jugó.']
                    : ['También hay ', totales.conFecha, ' partidos con fecha acordada que todavía no se jugaron.']
                }
              />
            </p>
            <button
              type="button"
              aria-expanded={verConFecha}
              onClick={() => setVerConFecha(!verConFecha)}
              className={`${accion} border border-linea bg-white hover:bg-fondo`}
            >
              {verConFecha ? 'Ocultar' : totales.conFecha === 1 ? 'Verlo' : 'Verlos'}
            </button>
          </div>
        )}

        {verConFecha && conFecha.length > 0 && (
          <>
            <Encabezado titulo="Con fecha" cantidad={conFecha.length}>
              Si uno no tiene la app, confirmala vos
            </Encabezado>
            <ul>
              {conFecha.map((partido) => (
                <Fila key={partido.id} slug={slug} partido={partido} tablero={tablero} lista="con_fecha" />
              ))}
            </ul>
          </>
        )}
      </Tarjeta>
    </section>
  );
}
