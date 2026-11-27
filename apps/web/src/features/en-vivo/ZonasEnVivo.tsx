import { alConsuelo, type PartidoEnVivo, type TorneoEnVivo, type ZonaEnVivo } from '@setpoint/shared';
import { Link } from 'react-router-dom';
import { ConCifras, Numero } from '../../components/Numero';
import { Tarjeta } from '../../components/Tarjeta';
import { estadoParaLaFicha, type VueltaDeLaFicha } from '../ficha/vuelta';
import { NOMBRE_DEL_PRINCIPAL, PLAZO_CUMPLIDO } from '../cuadros/cuadro';
import { DesempateDeLaZona } from '../tablero/DesempateDeLaZona';
import { comoVieneLaZona, marcadorDesde } from '../tablero/tablero';
import { laHora, elDia, tieneResultado } from './enVivo';

const rotulo = 'text-[12.5px] font-medium text-noche';

// La tabla de una zona: quién clasifica a cada cuadro se ve con el punto verde y la negrita,
// como en el tablero y en Mi zona. Cada nombre lleva a la ficha del jugador (decisión 074), que
// vuelve a las zonas (decisión 102). Debajo, los partidos de la zona con su resultado o su fecha.
function TablaDeZona({ zona, slug, vuelta, consuelo, usaRanking }: { zona: ZonaEnVivo; slug: string; vuelta: VueltaDeLaFicha; consuelo: string; usaRanking: boolean }) {
  // En el celular las columnas de números se angostan para dejarle el lugar al nombre.
  const grilla = 'grid grid-cols-[minmax(0,1fr)_28px_40px_56px] items-center sm:grid-cols-[minmax(0,1fr)_36px_52px_64px]';
  return (
    <Tarjeta className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-linea px-4 py-3">
        <h3 className="text-[17px] font-semibold tracking-[-0.02em]">Zona {zona.grupo}</h3>
        <span className="text-xs text-pizarra-500">
          <Numero>{zona.partidos.filter(tieneResultado).length}</Numero> de <Numero>{zona.partidos.length}</Numero> jugados
        </span>
      </div>

      <div className={`${grilla} border-b border-linea bg-niebla`}>
        <span className="px-4 py-2 text-xs text-pizarra-500">jugador</span>
        <span className={`py-2 text-center ${rotulo}`}>pg</span>
        <span className={`py-2 text-center ${rotulo}`}>sets</span>
        <span className={`py-2 pr-4 text-right ${rotulo}`}>games</span>
      </div>
      {zona.filas.map((fila) => {
        const clasifica = fila.destino === 'campeonato';
        return (
          <div key={fila.jugadorId} className={`${grilla} min-h-[46px] border-b border-linea-suave py-1`}>
            <div className="flex min-w-0 items-center gap-2.5 px-4">
              <Numero className={`text-xs ${clasifica ? 'text-pizarra-500' : 'text-pizarra-450'}`}>{fila.posicion}</Numero>
              <span className={`size-1.5 shrink-0 rounded-full ${clasifica ? 'bg-lona-texto' : 'bg-linea'}`} />
              <Link
                to={`/c/${slug}/jugadores/${fila.jugadorId}`}
                state={estadoParaLaFicha(vuelta)}
                // Si el nombre igual no entra, sigue en una segunda línea en lugar de cortarse.
                className={`line-clamp-2 text-[15px] leading-tight break-words hover:underline ${clasifica ? 'font-semibold' : 'font-medium text-pizarra-700'}`}
              >
                {fila.nombre} {fila.apellido}
              </Link>
            </div>
            <Numero className={`text-center text-[15px] font-semibold ${clasifica ? '' : 'text-pizarra-700'}`}>{fila.partidosGanados}</Numero>
            <Numero className="text-center text-[13px] text-pizarra-500">
              {fila.setsGanados}-{fila.setsPerdidos}
            </Numero>
            <Numero className="pr-4 text-right text-[13px] text-pizarra-500">
              {fila.gamesGanados}-{fila.gamesPerdidos}
            </Numero>
          </div>
        );
      })}

      <div className="flex items-start gap-2.5 bg-niebla px-4 py-3">
        <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-lona-texto" />
        <div className="flex flex-col gap-1">
          <p className="text-[13px] text-pizarra-500">{comoVieneLaZona(zona.filas, consuelo)}</p>
          <DesempateDeLaZona filas={zona.filas} usaRanking={usaRanking} />
        </div>
      </div>

      <ul className="flex flex-col px-4 py-2">
        {zona.partidos.map((partido) => (
          <PartidoDeZona key={partido.id} partido={partido} />
        ))}
      </ul>
    </Tarjeta>
  );
}

// "Pérez · Gómez   6-3 6-4", con el ganador en negrita. Sin resultado, la fecha, "a coordinar" o, con el plazo cumplido, el texto neutro (decisión 152).
function PartidoDeZona({ partido }: { partido: PartidoEnVivo }) {
  const { jugadorA, jugadorB } = partido;
  if (!jugadorA || !jugadorB) return null;
  const jugado = tieneResultado(partido);
  const dobleWo = partido.estado === 'doble_walkover';
  const ganador =
    jugado && !dobleWo && partido.ganadorId !== null
      ? partido.ganadorId === jugadorA.jugadorId
        ? jugadorA
        : jugadorB
      : null;
  const perdedor = ganador && (ganador === jugadorA ? jugadorB : jugadorA);

  return (
    <li className="flex h-[38px] items-center justify-between gap-3 border-b border-linea-suave text-sm last:border-b-0">
      {dobleWo ? (
        <>
          <span className="min-w-0 truncate text-pizarra-500">
            {jugadorA.apellido} · {jugadorB.apellido}
          </span>
          <span className="shrink-0 text-[13px] font-medium text-pizarra-500">W.O. doble</span>
        </>
      ) : ganador && perdedor ? (
        <>
          <span className="min-w-0 truncate">
            <span className="font-semibold">{ganador.apellido}</span>
            <span className="text-pizarra-450"> le ganó a </span>
            {perdedor.apellido}
          </span>
          <ConCifras className="shrink-0 text-[13px] font-semibold">{marcadorDesde(partido, ganador.jugadorId)}</ConCifras>
        </>
      ) : (
        <>
          <span className="min-w-0 truncate text-pizarra-700">
            {jugadorA.apellido} · {jugadorB.apellido}
          </span>
          {partido.plazoCumplido ? (
            <span className="shrink-0 text-[13px] text-pizarra-500">{PLAZO_CUMPLIDO}</span>
          ) : (
            <ConCifras className="shrink-0 text-[13px] text-pizarra-500">
              {partido.fechaAcordada ? `${elDia(partido.fechaAcordada)} · ${laHora(partido.fechaAcordada)}` : 'a coordinar'}
            </ConCifras>
          )}
        </>
      )}
    </li>
  );
}

// Cuántas columnas lleva la grilla para que las filas queden parejas y ninguna zona quede sola.
// La tabla de una zona necesita unos 300 px, así que cuatro columnas solo entran desde 2xl (1536 px);
// en xl (1280 px) cuatro zonas van de a dos. Con cantidad impar no hay dos columnas que cierren
// la fila, y la última queda sola en media fila; solo en el ancho mayor se completa con tres o cuatro columnas.
// Las clases van escritas enteras para que Tailwind las genere.
function columnasParaZonas(n: number): string {
  switch (n) {
    case 1:
      return 'max-w-[560px]';
    case 2:
      return 'md:grid-cols-2';
    case 3:
      return 'md:grid-cols-2 xl:grid-cols-3';
    case 4:
      return 'md:grid-cols-2 2xl:grid-cols-4';
    case 5:
      return 'md:grid-cols-2 xl:grid-cols-3';
    case 6:
      return 'md:grid-cols-2 xl:grid-cols-3';
    case 7:
      return 'md:grid-cols-2 2xl:grid-cols-4';
    case 8:
      return 'md:grid-cols-2 2xl:grid-cols-4';
    default:
      return 'md:grid-cols-2 xl:grid-cols-3';
  }
}

// Todas las zonas, una debajo de la otra en el celular y en columnas en escritorio.
export function ZonasEnVivo({ torneo, slug }: { torneo: TorneoEnVivo; slug: string }) {
  const consuelo = torneo.tieneComplementaria ? ` y el resto ${alConsuelo(torneo.nombreCuadroConsuelo)}` : '';
  const vuelta = { ruta: `/c/${slug}/torneos/${torneo.torneoId}/en-vivo?ver=zonas`, etiqueta: `${torneo.nombre} en vivo` };
  const primeros = torneo.clasificanPorGrupo === 1 ? 'El primero de cada zona va' : `Los ${torneo.clasificanPorGrupo} primeros de cada zona van`;
  return (
    <section className="flex flex-col gap-4">
      <p className="text-[15px] text-pizarra-500">
        {primeros} a {NOMBRE_DEL_PRINCIPAL}
        {consuelo}.{torneo.hayCuadros && ' Las zonas ya terminaron: así quedaron.'}
      </p>
      <div className={`grid gap-4 ${columnasParaZonas(torneo.zonas.length)}`}>
        {torneo.zonas.map((zona) => (
          <TablaDeZona key={zona.grupo} zona={zona} slug={slug} vuelta={vuelta} consuelo={torneo.nombreCuadroConsuelo} usaRanking={torneo.usaRanking} />
        ))}
      </div>
    </section>
  );
}
