import type { FichaDelJugador, RecordDelJugador } from '@setpoint/shared';
import type { ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { EncabezadoPublico } from '../components/EncabezadoPublico';
import { Numero } from '../components/Numero';
import { Tarjeta } from '../components/Tarjeta';
import { BotonCompartir } from '../features/cuadros/BotonCompartir';
import { PartidosDeLaFicha } from '../features/ficha/PartidosDeLaFicha';
import { PuntosPorTorneo } from '../features/ficha/PuntosPorTorneo';
import { TorneosDeLaFicha } from '../features/ficha/TorneosDeLaFicha';
import { useFichaPublica } from '../features/ficha/useFichaPublica';
import { ErrorApi } from '../lib/api';
import { Esqueleto } from '../components/Esqueleto';

function mensajeDeError(error: Error) {
  if (error instanceof ErrorApi && (error.codigo === 'ORGANIZACION_NO_ENCONTRADA' || error.codigo === 'JUGADOR_NO_ENCONTRADO')) {
    return 'No encontramos a ese jugador. Revisá el enlace.';
  }
  if (error instanceof ErrorApi && error.codigo === 'SIN_CONEXION') return 'No pudimos conectarnos. Revisá tu conexión y probá de nuevo.';
  return 'No pudimos cargar la ficha. Probá de nuevo en unos minutos.';
}

// La ficha del jugador para cualquiera con el enlace, sin cuenta (F17): sus números, sus puntos por
// torneo del calendario, los torneos que jugó y sus partidos. Se llega desde el ranking y desde las
// zonas del torneo en vivo (decisión 074). Ningún dato de contacto.
export function FichaPublicaPage() {
  const { slug = '', id = '' } = useParams();
  const ficha = useFichaPublica(slug, id);

  return (
    <main className="mx-auto flex min-h-screen max-w-[480px] flex-col gap-[22px] px-4 pt-5 pb-7">
      {ficha.isPending && <Esqueleto forma="lista" />}
      {ficha.error && <p className="text-[15px] text-gris-700">{mensajeDeError(ficha.error)}</p>}
      {ficha.data && <Ficha ficha={ficha.data} />}
    </main>
  );
}

function Ficha({ ficha }: { ficha: FichaDelJugador }) {
  const nombre = `${ficha.nombre} ${ficha.apellido}`;
  const { ranking } = ficha;

  return (
    <>
      <title>{`${nombre} · ${ficha.organizacion}`}</title>
      {/* Compartir arriba, en la línea de la organización, como en la referencia: el nombre ocupa todo el ancho. */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <EncabezadoPublico organizacion={ficha.organizacion} />
        <BotonCompartir titulo={`${nombre} · ${ficha.organizacion}`} />
      </header>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[30px] leading-[1.1] font-semibold tracking-[-0.035em]">{nombre}</h1>
          {(ficha.categoria || ranking) && (
            <div className="flex flex-wrap items-center gap-[9px]">
              {ficha.categoria && <Pildora>{ficha.categoria}</Pildora>}
              {ranking && (
                <Pildora>
                  {ranking.puesto}º · {ranking.puntos} {ranking.puntos === 1 ? 'punto' : 'puntos'}
                </Pildora>
              )}
            </div>
          )}
        </div>
        <Record record={ficha.record} />
      </section>

      {ranking && <PuntosPorTorneo ranking={ranking} />}
      <TorneosDeLaFicha torneos={ficha.torneos} />
      {/* Sin torneos no hay partidos: con el aviso de Torneos alcanza. */}
      {ficha.torneos.length > 0 && <PartidosDeLaFicha partidos={ficha.partidos} />}

      <p className="text-sm leading-[1.42] text-gris-500">Ninguna pantalla pública muestra datos de contacto.</p>
    </>
  );
}

function Pildora({ children }: { children: ReactNode }) {
  return <Numero className="rounded-full border border-linea px-2.5 py-[5px] text-[13px] text-gris-500">{children}</Numero>;
}

// Jugados, ganados y perdidos. El W.O. no cuenta, porque no se jugó (decisión 073): se aclara para
// que no parezca que faltan partidos en la lista.
function Record({ record }: { record: RecordDelJugador }) {
  const numeros = [
    { valor: record.jugados, rotulo: 'jugados' },
    { valor: record.ganados, rotulo: 'ganados' },
    { valor: record.perdidos, rotulo: 'perdidos' },
  ];

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-2">
        {numeros.map(({ valor, rotulo }) => (
          <Tarjeta key={rotulo} className="flex flex-col gap-[3px] p-3">
            <Numero className="text-2xl font-medium">{valor}</Numero>
            <span className="text-[13px] text-gris-500">{rotulo}</span>
          </Tarjeta>
        ))}
      </div>
      {record.walkovers > 0 && (
        <p className="text-[13px] text-gris-500">
          {record.walkovers === 1 ? (
            'Sin contar un W.O., que no se jugó.'
          ) : (
            <>
              Sin contar <Numero>{record.walkovers}</Numero> W.O., que no se jugaron.
            </>
          )}
        </p>
      )}
    </div>
  );
}
