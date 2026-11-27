import type { PartidoDelTablero, Tablero } from '@setpoint/shared';
import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ConCifras, Numero } from '../../components/Numero';
import { Pildora } from '../../components/Pildora';
import { Tarjeta } from '../../components/Tarjeta';
import { urlDeWhatsApp } from '../padron/linkPersonal';
import { TextoConNumeros } from '../resultados/AlGuardar';
import { elDiaCorto, elDiaYHora } from '../torneos/texto';
import { AnotarFecha } from './AnotarFecha';
import { MasAcciones } from './MasAcciones';
import {
  dondeSeJuega,
  mensajeParaCoordinar,
  nombresDelPartido,
  partidosConFecha,
  partidosConResultadoPropuesto,
  resultadoPropuestoEnPalabras,
  textoDeLosDias,
} from './tablero';
import { useConfirmarResultadoPropuesto } from './useTablero';
import { MensajeError } from '../../components/Aviso';

const accion = 'inline-flex h-8 items-center justify-center rounded-control px-3 text-[13px] font-medium';

// "Escribirles" abre, debajo de la fila, el WhatsApp de cada jugador con el mensaje listo
// (decisión 062). Sin teléfono en el padrón, ese jugador no tiene enlace.
function Escribirles({ partido, tablero }: { partido: PartidoDelTablero; tablero: Tablero }) {
  return (
    <ul className={`flex flex-wrap gap-2 px-5 pb-4 ${tablero.fase === 'grupos' ? 'md:pl-[108px]' : 'md:pl-[182px]'}`}>
      {(['A', 'B'] as const).map((lado) => {
        const jugador = lado === 'A' ? partido.jugadorA! : partido.jugadorB!;
        return (
          <li key={lado}>
            {jugador.telefono ? (
              <a
                href={urlDeWhatsApp(jugador.telefono, mensajeParaCoordinar(partido, lado, tablero))}
                target="_blank"
                rel="noreferrer"
                className={`${accion} border border-linea hover:bg-niebla`}
              >
                WhatsApp a {jugador.apellido}
              </a>
            ) : (
              <span className={`${accion} border border-linea text-pizarra-450`}>{jugador.apellido} no tiene teléfono en el padrón</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

type Abierto = 'escribirles' | 'anotar' | 'mas' | null;

// En qué lista está la fila: los vencidos se resuelven; los sin coordinar y los con fecha se anotan.
type Lista = 'vencidos' | 'falta_cargar' | 'sin_coordinar' | 'con_fecha';

// Anotada por un jugador y sin confirmar: si el rival no tiene la app, la confirma la organización.
const textoDeAnotar = (lista: Lista, partido: PartidoDelTablero) =>
  lista === 'sin_coordinar' ? 'Anotar fecha' : partido.estado === 'anotada' ? 'Confirmar o cambiar' : 'Cambiar fecha';

function Fila({ slug, partido, tablero, lista }: { slug: string; partido: PartidoDelTablero; tablero: Tablero; lista: Lista }) {
  const resolver = lista === 'vencidos';
  // Ya se jugaba: lo que falta es el resultado, que se carga (decisión 151).
  const cargar = lista === 'falta_cargar';
  // Escribirles, Anotar fecha y Más se abren debajo de la fila, de a uno.
  const [abierto, setAbierto] = useState<Abierto>(null);
  const alternar = (que: Abierto) => setAbierto(abierto === que ? null : que);
  const sangria = tablero.fase === 'grupos' ? 'md:pl-[108px]' : 'md:pl-[182px]';
  const vencido = partido.situacion === 'vencido';

  return (
    <li className="border-b border-linea-suave last:border-b-0">
      {/* En los cuadros, la primera columna tiene que entrar "cuartos · consuelo". */}
      <div
        className={`grid gap-x-3 gap-y-2 px-5 py-3.5 md:min-h-[52px] md:items-center md:py-2 ${
          tablero.fase === 'grupos' ? 'md:grid-cols-[76px_minmax(0,1fr)_300px_auto]' : 'md:grid-cols-[150px_minmax(0,1fr)_300px_auto]'
        }`}
      >
        {vencido ? (
          <span className="flex items-center gap-1.5 text-xs text-rojo-texto">
            <span className="size-1.5 shrink-0 rounded-full bg-rojo" />
            <ConCifras>{dondeSeJuega(partido, tablero)}</ConCifras>
          </span>
        ) : (
          <span className="text-[12.5px] font-medium text-noche">{dondeSeJuega(partido, tablero)}</span>
        )}
        <span className={`text-base font-semibold ${cargar ? 'md:col-span-2' : ''}`}>
          {cargar ? (
            <>
              {partido.jugadorA!.apellido} y {partido.jugadorB!.apellido} jugaban el <Numero>{elDiaCorto(partido.fechaAcordada!)}</Numero>.{' '}
              <span className="text-pizarra-500">Falta el resultado.</span>
            </>
          ) : (
            nombresDelPartido(partido)
          )}
        </span>
        <span className={`flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1 ${cargar ? 'hidden' : ''}`}>
          {lista === 'con_fecha' && partido.fechaAcordada ? (
            <>
              <Pildora tono="fecha">{elDiaYHora(partido.fechaAcordada)}</Pildora>
              <span className="text-[13px] text-pizarra-500">{partido.estado === 'anotada' ? 'falta que confirme el rival' : 'confirmada'}</span>
            </>
          ) : vencido ? (
            <ConCifras className="text-[13px] text-rojo-texto">{textoDeLosDias(partido.dias)}</ConCifras>
          ) : (
            <>
              <Pildora tono="sin-fecha" />
              <ConCifras className="text-[13px] text-pizarra-500">{textoDeLosDias(partido.dias)}</ConCifras>
            </>
          )}
        </span>
        {/* Dos columnas fijas: los botones quedan alineados en todas las filas. */}
        <div className="flex flex-wrap gap-2 md:grid md:grid-cols-[96px_148px_60px] md:justify-end">
          <button
            type="button"
            aria-expanded={abierto === 'escribirles'}
            onClick={() => alternar('escribirles')}
            className={`${accion} md:w-full border border-linea hover:bg-niebla`}
          >
            Escribirles
          </button>
          {/* La organización la carga en nombre de los dos y queda confirmada (F14, decisiones 062 y 064). */}
          {!resolver && !cargar && (
            <button
              type="button"
              aria-expanded={abierto === 'anotar'}
              onClick={() => alternar('anotar')}
              className={`${accion} md:w-full border border-linea hover:bg-niebla`}
            >
              {textoDeAnotar(lista, partido)}
            </button>
          )}
          {cargar && (
            <Link to={`/torneos/${tablero.torneoId}/resultados/${partido.id}`} className={`${accion} w-full bg-noche font-semibold text-white`}>
              Cargar resultado
            </Link>
          )}
          {resolver && (
            // Resolver es cargarlo como W.O.: la pantalla de carga abre con el W.O. elegido (decisión 062).
            <Link to={`/torneos/${tablero.torneoId}/resultados/${partido.id}?tipo=walkover`} className={`${accion} md:w-full bg-noche font-semibold text-white`}>
              Resolver
            </Link>
          )}
          {/* Extender el plazo, recordarles y el doble W.O. (decisión 135). */}
          <button
            type="button"
            aria-expanded={abierto === 'mas'}
            onClick={() => alternar('mas')}
            className={`${accion} md:w-full border border-linea hover:bg-niebla`}
          >
            Más
          </button>
        </div>
      </div>
      {abierto === 'escribirles' && <Escribirles partido={partido} tablero={tablero} />}
      {abierto === 'mas' && <MasAcciones slug={slug} tablero={tablero} partido={partido} sangria={sangria} />}
      {abierto === 'anotar' && (
        <AnotarFecha slug={slug} torneoId={tablero.torneoId} partidoId={partido.id} sangria={sangria} onCerrar={() => setAbierto(null)} />
      )}
    </li>
  );
}

// Un resultado que cargó un jugador desde la app (decisión 127). Pendiente, la organización lo
// confirma por el rival que no tiene la app o no contesta; rechazado, lo carga ella.
function FilaDelResultado({ slug, partido, tablero }: { slug: string; partido: PartidoDelTablero; tablero: Tablero }) {
  const confirmar = useConfirmarResultadoPropuesto(slug, tablero.torneoId);
  const { cargado, marcador, falta } = resultadoPropuestoEnPalabras(partido);
  const pendiente = partido.resultadoPropuesto!.estado === 'pendiente';

  return (
    <li className="border-b border-linea-suave last:border-b-0">
      <div
        className={`grid gap-x-3 gap-y-2 px-5 py-3.5 md:min-h-[52px] md:items-center md:py-2 ${
          tablero.fase === 'grupos' ? 'md:grid-cols-[76px_minmax(0,1fr)_300px_auto]' : 'md:grid-cols-[150px_minmax(0,1fr)_300px_auto]'
        }`}
      >
        <span className="text-[12.5px] font-medium text-noche">{dondeSeJuega(partido, tablero)}</span>
        <span className="text-base font-semibold">{nombresDelPartido(partido)}</span>
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-[13px] text-noche">
            {cargado}
            {marcador && <Numero> {marcador}</Numero>}
          </span>
          <span className="text-[13px] text-pizarra-500">{falta}</span>
        </span>
        <div className="flex flex-wrap gap-2 md:grid md:grid-cols-[96px_148px_60px] md:justify-end">
          <span className="hidden md:block" />
          {pendiente ? (
            <button
              type="button"
              disabled={confirmar.isPending}
              onClick={() => confirmar.mutate(partido.id)}
              className={`${accion} md:w-full bg-noche font-semibold text-white disabled:opacity-60`}
            >
              {confirmar.isPending ? 'Confirmando…' : 'Confirmar el resultado'}
            </button>
          ) : (
            <Link to={`/torneos/${tablero.torneoId}/resultados/${partido.id}`} className={`${accion} md:w-full border border-linea hover:bg-niebla`}>
              Cargar el resultado
            </Link>
          )}
        </div>
      </div>
      {confirmar.error && (
        <div className="px-5 pb-4">
          <MensajeError>No pudimos confirmarlo: el resultado cambió mientras tanto o se cortó la conexión. Recargá el tablero.</MensajeError>
        </div>
      )}
    </li>
  );
}

function Encabezado({ rojo = false, titulo, cantidad, children }: { rojo?: boolean; titulo: string; cantidad: number; children: ReactNode }) {
  return (
    <div
      className={`flex flex-wrap items-center gap-x-[9px] gap-y-1 border-b px-5 py-[11px] ${
        rojo ? 'border-rojo-linea bg-rojo-fondo' : 'border-linea bg-niebla'
      }`}
    >
      <span className={`size-2 rounded-[2px] ${rojo ? 'bg-rojo' : 'bg-linea'}`} />
      <h3 className={`text-sm font-semibold ${rojo ? 'text-rojo-texto' : ''}`}>
        {titulo} · <Numero>{cantidad}</Numero>
      </h3>
      <p className={`text-sm ${rojo ? 'text-rojo-texto/80' : 'text-pizarra-500'}`}>{children}</p>
    </div>
  );
}

// La lista de trabajo, ordenada por urgencia: primero los vencidos, que resuelve la organización
// (02-dominio.md §8.4), y después los que nadie coordinó.
export function LoQueFalta({ slug, tablero }: { slug: string; tablero: Tablero }) {
  // Los que tienen un resultado cargado por un jugador ya se jugaron: van en su lista, no en las otras.
  const conResultado = partidosConResultadoPropuesto(tablero);
  const yaJugados = new Set(conResultado.map((p) => p.id));
  const vencidos = tablero.vencidos.filter((p) => !yaJugados.has(p.id));
  const faltaCargar = tablero.faltaCargar.filter((p) => !yaJugados.has(p.id));
  const sinCoordinar = tablero.sinCoordinar.filter((p) => !yaJugados.has(p.id));
  const nada = conResultado.length === 0 && vencidos.length === 0 && faltaCargar.length === 0 && sinCoordinar.length === 0;
  // Los con fecha no son urgentes: se despliegan desde el pie, para cambiarlos o confirmarlos (F14).
  const [verConFecha, setVerConFecha] = useState(false);
  const conFecha = partidosConFecha(tablero).filter((p) => !yaJugados.has(p.id));

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-[-0.025em]">Lo que falta</h2>
        {!nada && <p className="text-sm text-pizarra-500">Ordenado por urgencia</p>}
      </div>

      <Tarjeta className="overflow-hidden">
        {conResultado.length > 0 && (
          <>
            <Encabezado titulo="Resultados por confirmar" cantidad={conResultado.length}>
              Los cargó un jugador desde la app. Si el rival no tiene la app, confirmalo vos
            </Encabezado>
            <ul>
              {conResultado.map((partido) => (
                <FilaDelResultado key={partido.id} slug={slug} partido={partido} tablero={tablero} />
              ))}
            </ul>
          </>
        )}

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

        {faltaCargar.length > 0 && (
          <>
            <Encabezado titulo="Falta cargar el resultado" cantidad={faltaCargar.length}>
              Ya pasó el día que acordaron: pedíselo a los jugadores o cargalo
            </Encabezado>
            <ul>
              {faltaCargar.map((partido) => (
                <Fila key={partido.id} slug={slug} partido={partido} tablero={tablero} lista="falta_cargar" />
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

        {nada && <p className="px-5 py-5 text-[15px] text-pizarra-500">No hay partidos vencidos ni sin coordinar.</p>}

        {conFecha.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-linea bg-niebla px-5 py-3.5">
            <p className="text-sm text-pizarra-500">
              <TextoConNumeros
                frase={
                  conFecha.length === 1
                    ? ['También hay ', 1, ' partido con fecha acordada que todavía no se jugó.']
                    : ['También hay ', conFecha.length, ' partidos con fecha acordada que todavía no se jugaron.']
                }
              />
            </p>
            <button
              type="button"
              aria-expanded={verConFecha}
              onClick={() => setVerConFecha(!verConFecha)}
              className={`${accion} border border-linea bg-papel hover:bg-niebla`}
            >
              {verConFecha ? 'Ocultar' : conFecha.length === 1 ? 'Verlo' : 'Verlos'}
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
