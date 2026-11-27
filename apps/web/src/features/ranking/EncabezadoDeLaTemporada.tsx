import { rutaDelTorneo, type CategoriaDeRanking, type TorneoDelCalendario } from '@setpoint/shared';
import { Link } from 'react-router-dom';
import { ConCifras, Numero } from '../../components/Numero';
import { diaLargo } from '../torneo-publico/convocatoria';
import { abreviarTorneo } from './casilleros';

type Props = {
  slug: string;
  categoria: CategoriaDeRanking;
  torneosDelCalendario: TorneoDelCalendario[];
};

// Arriba del ranking, lo que pasa en la temporada de la categoría (decisión 159): los torneos del
// calendario como marcas, quién va primero y el próximo torneo con la inscripción abierta. En el
// celular, sin el primero, que ya es la primera fila de la tabla.
export function EncabezadoDeLaTemporada({ slug, categoria, torneosDelCalendario }: Props) {
  const [primero, segundo] = categoria.filas;
  const hayPrimero = primero !== undefined && primero.puntos > 0;
  const abierta = categoria.inscripcionAbierta;

  if (torneosDelCalendario.length === 0 && !hayPrimero && !abierta) return null;

  return (
    <div className="flex flex-col gap-2.5 lg:flex-row">
      {torneosDelCalendario.length > 0 && (
        <Temporada categoria={categoria} torneosDelCalendario={torneosDelCalendario} />
      )}

      {hayPrimero && (
        <section className="hidden flex-1 flex-col gap-1.5 rounded-[14px] border border-linea bg-papel px-[18px] py-4 lg:flex">
          <h2 className="text-[13px] font-medium text-pizarra-500">Primero</h2>
          <Numero className="text-[34px] leading-none font-medium tracking-[-0.03em]">{primero.puntos}</Numero>
          <p className="text-[15px] font-semibold">
            {primero.nombre} {primero.apellido}
          </p>
          {segundo && (
            <p className="text-[13px] text-pizarra-500">
              {segundo.puntos === primero.puntos ? (
                `Empatado con ${segundo.apellido}`
              ) : (
                <>
                  <Numero>{primero.puntos - segundo.puntos}</Numero> puntos sobre el segundo
                </>
              )}
            </p>
          )}
        </section>
      )}

      {abierta && (
        <section className="flex flex-1 flex-col gap-1.5 rounded-[14px] border border-linea bg-papel px-[18px] py-4">
          <h2 className="flex items-center gap-2 text-[13px] font-medium text-pizarra-500">
            <span className="size-[7px] rounded-full bg-lona-texto" aria-hidden />
            Inscripción abierta
          </h2>
          <p className="text-[17px] font-semibold tracking-[-0.01em]">{abierta.nombre}</p>
          {abierta.cierreInscripcion && (
            <ConCifras className="text-[13px] text-pizarra-500">{`Cierra el ${diaLargo(abierta.cierreInscripcion)}`}</ConCifras>
          )}
          <Link to={rutaDelTorneo(slug, abierta)} className="mt-auto self-start pt-1 text-[15px] font-semibold underline underline-offset-4 hover:text-pizarra-700">
            Ver el torneo
          </Link>
        </section>
      )}
    </div>
  );
}

// Una marca por torneo del calendario, como la barra del logo: la que está en juego va levantada
// (decisión 104). Sin años: los puntos importados llevan el 1° de enero del año del casillero
// (decisión 008), así que el año no siempre es el de la edición anterior.
function Temporada({ categoria, torneosDelCalendario }: Omit<Props, 'slug'>) {
  const enJuego = categoria.enJuego;
  // Con puntos en la categoría: ese torneo ya se jugó alguna vez.
  const conPuntos = new Set(categoria.filas.flatMap((f) => f.casilleros.map((c) => c.etapaId)));
  const delEnJuego = enJuego ? torneosDelCalendario.find((t) => t.id === enJuego.etapaId) : undefined;

  return (
    <section className="flex flex-col gap-3 rounded-[14px] bg-noche px-[18px] py-4 text-white lg:flex-[1.4]">
      <h2 className="text-[13px] font-medium text-pizarra-400">Los torneos del calendario</h2>
      <ol className="flex items-end gap-[5px] pt-2">
        {torneosDelCalendario.map((t) => {
          const esElEnJuego = t.id === enJuego?.etapaId;
          return (
            <li
              key={t.id}
              title={t.nombre}
              className={`flex flex-1 flex-col items-center justify-end gap-0.5 rounded-[4px] pb-1.5 ${
                esElEnJuego ? 'h-[52px] bg-azul-claro text-noche-900' : conPuntos.has(t.id) ? 'h-11 bg-white text-noche-900' : 'h-11 bg-noche-2 text-pizarra-400'
              }`}
            >
              <span className="text-[13px] font-medium">{abreviarTorneo(t.nombre)}</span>
              {esElEnJuego && <span className="text-[11px] font-medium">en juego</span>}
            </li>
          );
        })}
      </ol>
      <p className="text-[13px] leading-[1.4] text-pizarra-400">
        {enJuego && delEnJuego ? (
          <>
            <span className="text-white">{enJuego.nombre}</span> se está jugando. Cuando cierre, sus puntos reemplazan a los
            que hoy da {delEnJuego.nombre}.
          </>
        ) : (
          'Cada torneo reemplaza los puntos del mismo torneo del año anterior.'
        )}
      </p>
    </section>
  );
}
