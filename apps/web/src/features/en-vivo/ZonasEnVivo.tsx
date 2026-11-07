import type { PartidoEnVivo, TorneoEnVivo, ZonaEnVivo } from '@setpoint/shared';
import { Link } from 'react-router-dom';
import { Numero } from '../../components/Numero';
import { Tarjeta } from '../../components/Tarjeta';
import { NOMBRE_DEL_CUADRO } from '../cuadros/cuadro';
import { comoVieneLaZona, marcadorDesde } from '../tablero/tablero';
import { laHora, elDia, tieneResultado } from './enVivo';

const rotulo = 'font-mono text-[11px] text-gris-500';

// La tabla de una zona: quién clasifica a cada cuadro se ve con el punto lima y la negrita,
// como en el tablero y en Mi zona. Cada nombre lleva a la ficha del jugador (decisión 074).
// Debajo, los partidos de la zona con su resultado o su fecha.
function TablaDeZona({ zona, slug }: { zona: ZonaEnVivo; slug: string }) {
  const grilla = 'grid grid-cols-[minmax(0,1fr)_36px_52px_64px] items-center';
  return (
    <Tarjeta className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-linea px-4 py-3">
        <h3 className="text-[17px] font-semibold tracking-[-0.02em]">Zona {zona.grupo}</h3>
        <Numero className="text-xs text-gris-500">
          {zona.partidos.filter(tieneResultado).length} de {zona.partidos.length} jugados
        </Numero>
      </div>

      <div className={`${grilla} border-b border-linea bg-fondo-tabla`}>
        <span className="px-4 py-2 text-xs text-gris-500">jugador</span>
        <span className={`py-2 text-center ${rotulo}`}>pg</span>
        <span className={`py-2 text-center ${rotulo}`}>sets</span>
        <span className={`py-2 pr-4 text-right ${rotulo}`}>games</span>
      </div>
      {zona.filas.map((fila) => {
        const clasifica = fila.destino === 'campeonato';
        return (
          <div key={fila.jugadorId} className={`${grilla} h-[46px] border-b border-linea-suave`}>
            <div className="flex min-w-0 items-center gap-2.5 px-4">
              <Numero className={`text-xs ${clasifica ? 'text-gris-500' : 'text-gris-400'}`}>{fila.posicion}</Numero>
              <span className={`size-1.5 shrink-0 rounded-full ${clasifica ? 'bg-lima' : 'bg-linea'}`} />
              <Link
                to={`/c/${slug}/jugadores/${fila.jugadorId}`}
                className={`truncate text-[15px] hover:underline ${clasifica ? 'font-semibold' : 'font-medium text-gris-700'}`}
              >
                {fila.nombre} {fila.apellido}
              </Link>
            </div>
            <Numero className={`text-center text-[15px] font-semibold ${clasifica ? '' : 'text-gris-700'}`}>{fila.partidosGanados}</Numero>
            <Numero className="text-center text-[13px] text-gris-500">
              {fila.setsGanados}-{fila.setsPerdidos}
            </Numero>
            <Numero className="pr-4 text-right text-[13px] text-gris-500">
              {fila.gamesGanados}-{fila.gamesPerdidos}
            </Numero>
          </div>
        );
      })}

      <div className="flex items-start gap-2.5 bg-fondo-tabla px-4 py-3">
        <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-lima" />
        <p className="text-[13px] text-gris-500">{comoVieneLaZona(zona.filas)}</p>
      </div>

      <ul className="flex flex-col px-4 py-2">
        {zona.partidos.map((partido) => (
          <PartidoDeZona key={partido.id} partido={partido} />
        ))}
      </ul>
    </Tarjeta>
  );
}

// "Pérez · Gómez   6-3 6-4", con el ganador en negrita. Sin resultado, la fecha o "a coordinar".
function PartidoDeZona({ partido }: { partido: PartidoEnVivo }) {
  const { jugadorA, jugadorB } = partido;
  if (!jugadorA || !jugadorB) return null;
  const jugado = tieneResultado(partido);
  const ganador = jugado ? (partido.ganadorId === jugadorA.jugadorId ? jugadorA : jugadorB) : null;
  const perdedor = ganador && (ganador === jugadorA ? jugadorB : jugadorA);

  return (
    <li className="flex h-[38px] items-center justify-between gap-3 border-b border-linea-suave text-sm last:border-b-0">
      {ganador && perdedor ? (
        <>
          <span className="min-w-0 truncate">
            <span className="font-semibold">{ganador.apellido}</span>
            <span className="text-gris-400"> le ganó a </span>
            {perdedor.apellido}
          </span>
          <Numero className="shrink-0 text-[13px] font-semibold">{marcadorDesde(partido, ganador.jugadorId)}</Numero>
        </>
      ) : (
        <>
          <span className="min-w-0 truncate text-gris-700">
            {jugadorA.apellido} · {jugadorB.apellido}
          </span>
          <Numero className="shrink-0 text-[13px] text-gris-500">
            {partido.fechaAcordada ? `${elDia(partido.fechaAcordada)} · ${laHora(partido.fechaAcordada)}` : 'a coordinar'}
          </Numero>
        </>
      )}
    </li>
  );
}

// Todas las zonas, una debajo de la otra en el celular y en columnas en escritorio.
export function ZonasEnVivo({ torneo, slug }: { torneo: TorneoEnVivo; slug: string }) {
  const consuelo = torneo.tieneComplementaria ? ` y el resto al ${NOMBRE_DEL_CUADRO.complementaria.toLowerCase()}` : '';
  const primeros = torneo.clasificanPorGrupo === 1 ? 'El primero de cada zona va' : `Los ${torneo.clasificanPorGrupo} primeros de cada zona van`;
  return (
    <section className="flex flex-col gap-4">
      <p className="text-[15px] text-gris-500">
        {primeros} a {NOMBRE_DEL_CUADRO.campeonato}
        {consuelo}.{torneo.hayCuadros && ' Las zonas ya terminaron: así quedaron.'}
      </p>
      <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
        {torneo.zonas.map((zona) => (
          <TablaDeZona key={zona.grupo} zona={zona} slug={slug} />
        ))}
      </div>
    </section>
  );
}
