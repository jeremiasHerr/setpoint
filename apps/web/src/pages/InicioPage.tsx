import { useNavigate, useSearchParams } from 'react-router-dom';
import { BarraProgreso } from '../components/BarraProgreso';
import { Boton } from '../components/Boton';
import { EncabezadoOrganizador } from '../components/EncabezadoOrganizador';
import { Etiqueta } from '../components/Etiqueta';
import { Numero } from '../components/Numero';
import { Tarjeta } from '../components/Tarjeta';
import { organizacionEjemplo, torneosEjemplo, type TorneosDeInicio } from '../features/inicio/torneosEjemplo';

const navegacion = [
  { etiqueta: 'Inicio', href: '/inicio' },
  { etiqueta: 'Circuito', href: '/circuito' },
];

const pasos = [
  { titulo: 'Formato', detalle: 'Zonas y cuadros, con cuántos jugadores' },
  { titulo: 'Inscripción', detalle: 'Precio, cupo y hasta cuándo se anotan' },
  { titulo: 'Link', detalle: 'Lo pasás por el grupo y se anotan pagando' },
];

function IconoMas({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" aria-hidden="true" className={className}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function primerNombre(nombre: string) {
  return nombre.trim().split(/\s+/)[0];
}

function iniciales(nombre: string) {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((palabra) => palabra[0]?.toUpperCase() ?? '')
    .join('');
}

export function InicioPage() {
  const [parametros] = useSearchParams();
  const conTorneos = parametros.has('ejemplo');
  const { nombre, usuario, jugadores, usaRanking } = organizacionEjemplo;

  return (
    <div className="min-h-screen bg-white text-negro">
      <EncabezadoOrganizador organizacion={nombre} navegacion={navegacion} activo="Inicio" iniciales={iniciales(usuario)} />
      {conTorneos ? (
        <InicioConTorneos torneos={torneosEjemplo} />
      ) : (
        <InicioSinTorneos nombre={primerNombre(usuario)} jugadores={jugadores} usaRanking={usaRanking} />
      )}
    </div>
  );
}

function InicioSinTorneos({ nombre, jugadores, usaRanking }: { nombre: string; jugadores: number; usaRanking: boolean }) {
  const navegar = useNavigate();

  return (
    <>
      <div className="flex flex-col gap-[7px] px-7 pt-[26px] pb-[22px]">
        <h1 className="text-[30px] font-semibold tracking-[-0.035em]">Hola, {nombre}</h1>
        <p className="text-[15px] text-gris-500">Todavía no tenés torneos. Empezá por uno: no hace falta configurar nada antes.</p>
      </div>

      <main className="grid items-start gap-[22px] px-7 pb-7 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-4">
          <section className="flex flex-col gap-[22px] rounded-superficie border-2 border-negro p-7">
            <div className="flex items-start justify-between gap-5">
              <div className="flex flex-col gap-[9px]">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-[22px] font-semibold tracking-[-0.025em]">Crear un torneo</h2>
                  <Etiqueta>Lo más rápido</Etiqueta>
                </div>
                <p className="max-w-[520px] text-[15px] leading-normal text-gris-500">
                  Elegís el formato, la fecha y el precio, y compartís el link de inscripción. Al terminar tenés la tabla de
                  posiciones del torneo.
                </p>
              </div>
              <div className="flex size-[52px] shrink-0 items-center justify-center rounded-tarjeta bg-lima">
                <IconoMas className="size-[22px] stroke-[2.4]" />
              </div>
            </div>

            <ol className="grid gap-3 sm:grid-cols-3">
              {pasos.map(({ titulo, detalle }, i) => (
                <li key={titulo} className="flex flex-col gap-1.5 rounded-xl bg-fondo p-3.5">
                  <Numero className="text-xs text-gris-500">{i + 1}</Numero>
                  <span className="text-sm font-semibold">{titulo}</span>
                  <span className="text-[13px] text-gris-500">{detalle}</span>
                </li>
              ))}
            </ol>

            <div className="flex flex-wrap items-center gap-3.5">
              {/* Se conecta cuando exista la pantalla de nuevo torneo. */}
              <Boton variante="organizador" grande>
                Crear mi primer torneo
              </Boton>
              <span className="text-sm text-gris-500">
                Te lleva <Numero>2 minutos</Numero>
              </span>
            </div>
          </section>

          <Tarjeta className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:gap-6">
            <div className="flex flex-col gap-1.5">
              <h2 className="text-[17px] font-semibold">¿Organizás un circuito con ranking anual?</h2>
              <p className="max-w-[560px] text-sm leading-normal text-gris-500">
                Cargá tus categorías, etapas y la tabla de puntos. Los torneos van sumando y el ranking se arma solo. Podés
                hacerlo ahora o después de tu primer torneo.
              </p>
            </div>
            <Boton className="shrink-0" onClick={() => navegar('/circuito')}>
              Configurar mi circuito
            </Boton>
          </Tarjeta>
        </div>

        <aside className="flex flex-col gap-4">
          <ResumenOrganizacion
            titulo="Tu organización"
            filas={[
              { rotulo: 'Torneos', valor: 0 },
              { rotulo: 'Jugadores en el padrón', valor: jugadores },
              { rotulo: 'Ranking anual', valor: usaRanking ? 'activo' : 'sin activar', variante: 'texto' },
            ]}
          />

          <Tarjeta className="flex flex-col gap-[9px] bg-fondo p-[18px]">
            <h2 className="text-sm font-semibold">¿Ya tenés tus jugadores en un Excel?</h2>
            <p className="text-sm leading-normal text-gris-500">
              Subilo y los cargamos al padrón, con sus puntos si los tiene. Revisás todo antes de guardar.
            </p>
            {/* Se conecta cuando exista la pantalla de importar padrón. */}
            <button type="button" className="mt-0.5 self-start text-sm font-medium hover:text-gris-500">
              Importar padrón →
            </button>
          </Tarjeta>
        </aside>
      </main>
    </>
  );
}

function InicioConTorneos({ torneos }: { torneos: TorneosDeInicio }) {
  const { enJuego, conInscripcionAbierta, terminados, totalTerminados, avisos } = torneos;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-6 px-7 pt-[26px] pb-[22px]">
        <div className="flex flex-col gap-[7px]">
          <h1 className="text-[30px] font-semibold tracking-[-0.035em]">Torneos</h1>
          <p className="text-[15px] text-gris-500">
            <Numero>{enJuego.length}</Numero> en juego · <Numero>{conInscripcionAbierta.length}</Numero> con la inscripción
            abierta
          </p>
        </div>
        {/* Se conecta cuando exista la pantalla de nuevo torneo. */}
        <Boton variante="organizador">
          <IconoMas className="size-[13px] stroke-[2.6]" />
          Nuevo torneo
        </Boton>
      </div>

      <main className="grid items-start gap-[22px] px-7 pb-7 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-[22px]">
          {enJuego.length > 0 && (
            <section className="flex flex-col gap-[11px]">
              <h2 className="text-[13px] font-semibold text-gris-500">En juego</h2>
              {enJuego.map((torneo) => (
                <Tarjeta
                  key={torneo.id}
                  className="grid items-center gap-4 p-5 xl:grid-cols-[minmax(0,1fr)_260px_120px] xl:gap-6"
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-lg font-semibold tracking-[-0.02em]">{torneo.nombre}</h3>
                      <Etiqueta variante="negra">{torneo.fase}</Etiqueta>
                    </div>
                    <p className="text-sm text-gris-500">{torneo.detalle}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[13px] text-gris-500">Partidos jugados</span>
                      <Numero className="text-sm font-medium">
                        {torneo.partidosJugados} <span className="text-gris-400">/ {torneo.partidosTotales}</span>
                      </Numero>
                    </div>
                    <BarraProgreso valor={torneo.partidosJugados} total={torneo.partidosTotales} rotulo="Partidos jugados" />
                    {torneo.partidosVencidos > 0 && (
                      <p className="text-[13px] text-rojo-texto">
                        <Numero>{torneo.partidosVencidos}</Numero> vencidos sin resultado
                      </p>
                    )}
                  </div>
                  {/* Se conecta cuando exista el tablero del torneo. */}
                  <Boton>Ver tablero</Boton>
                </Tarjeta>
              ))}
            </section>
          )}

          {conInscripcionAbierta.length > 0 && (
            <section className="flex flex-col gap-[11px]">
              <h2 className="text-[13px] font-semibold text-gris-500">Inscripción abierta</h2>
              <div className="grid gap-3.5 md:grid-cols-2">
                {conInscripcionAbierta.map((torneo) => (
                  <Tarjeta key={torneo.id} className="flex flex-col gap-4 p-5">
                    <div className="flex flex-col gap-[5px]">
                      <h3 className="text-[17px] font-semibold tracking-[-0.02em]">{torneo.nombre}</h3>
                      <p className="text-sm text-gris-500">{torneo.detalle}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[13px] text-gris-500">Inscriptos que pagaron</span>
                        <Numero className="text-sm font-medium">
                          {torneo.pagaron} <span className="text-gris-400">/ {torneo.cupo}</span>
                        </Numero>
                      </div>
                      <BarraProgreso valor={torneo.pagaron} total={torneo.cupo} color="lima" rotulo="Inscriptos que pagaron" />
                    </div>
                    {/* Se conectan cuando exista la pantalla de inscripciones. */}
                    <div className="flex gap-[9px]">
                      <Boton className="grow">Inscripciones</Boton>
                      <Boton>Copiar link</Boton>
                    </div>
                  </Tarjeta>
                ))}
              </div>
            </section>
          )}

          {terminados.length > 0 && (
            <section className="flex flex-col gap-[11px]">
              <h2 className="text-[13px] font-semibold text-gris-500">Terminados</h2>
              <Tarjeta className="overflow-hidden">
                <table className="w-full table-fixed text-left text-[15px]">
                  <thead className="bg-fondo-tabla text-[13px] text-gris-500">
                    <tr>
                      <th className="py-[11px] pr-2 pl-5 font-semibold">Torneo</th>
                      <th className="w-[150px] px-2 py-[11px] font-semibold">Terminó</th>
                      <th className="w-[190px] px-2 py-[11px] font-semibold">Campeón</th>
                      <th className="w-[110px] py-[11px] pr-5 pl-2 text-right font-semibold">Jugadores</th>
                    </tr>
                  </thead>
                  <tbody>
                    {terminados.map((torneo) => (
                      <tr key={torneo.id} className="border-t border-linea-suave">
                        <td className="truncate py-[13px] pr-2 pl-5 font-medium">{torneo.nombre}</td>
                        <td className="px-2 py-[13px]">
                          <Numero className="text-sm text-gris-500">{torneo.termino}</Numero>
                        </td>
                        <td className="truncate px-2 py-[13px]">{torneo.campeon}</td>
                        <td className="py-[13px] pr-5 pl-2 text-right">
                          <Numero className="text-sm">{torneo.jugadores}</Numero>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {totalTerminados > terminados.length && (
                  <div className="border-t border-linea-suave px-5 py-[13px]">
                    {/* Se conecta cuando exista el listado de torneos. */}
                    <button type="button" className="text-sm font-medium hover:text-gris-500">
                      Ver los <Numero>{totalTerminados}</Numero> torneos terminados →
                    </button>
                  </div>
                )}
              </Tarjeta>
            </section>
          )}
        </div>

        <aside className="flex flex-col gap-4">
          {avisos.length > 0 && (
            <section className="flex flex-col gap-3 rounded-tarjeta border border-rojo-linea bg-rojo-fondo p-[18px]">
              <h2 className="text-[15px] font-semibold">Necesita tu atención</h2>
              <ul className="flex flex-col gap-2.5">
                {avisos.map((aviso, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-[7px] size-[7px] shrink-0 rounded-full bg-rojo" />
                    {/* Las acciones se conectan cuando existan el tablero y las inscripciones. */}
                    {aviso.tipo === 'partidos-vencidos' ? (
                      <p className="text-sm leading-[1.45]">
                        <Numero>{aviso.partidos}</Numero> partidos de {aviso.categoria} vencieron sin resultado.{' '}
                        <button type="button" className="font-medium underline hover:text-gris-500">
                          Resolver
                        </button>
                      </p>
                    ) : (
                      <p className="text-sm leading-[1.45]">
                        {aviso.torneo} tiene <Numero>{aviso.pagaron}</Numero> de <Numero>{aviso.cupo}</Numero> inscriptos y
                        cierra en {aviso.cierraEn}.{' '}
                        <button type="button" className="font-medium underline hover:text-gris-500">
                          Copiar link
                        </button>
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <ResumenOrganizacion
            titulo="Tu circuito"
            filas={[
              { rotulo: 'Jugadores', valor: torneos.jugadores },
              { rotulo: 'Categorías', valor: torneos.categorias, variante: 'acento' },
              {
                rotulo: 'Recaudado en inscripciones abiertas',
                valor: `$${torneos.recaudadoEnInscripcionesAbiertas.toLocaleString('es-AR')}`,
                variante: 'importe',
              },
            ]}
            nota={
              torneos.usaRanking
                ? 'Ranking activo. Se actualiza al cerrar cada torneo.'
                : 'Ranking anual sin activar. Cada torneo termina con su propia tabla de posiciones.'
            }
          />
        </aside>
      </main>
    </>
  );
}

type FilaResumen = {
  rotulo: string;
  valor: string | number;
  variante?: 'numero' | 'acento' | 'importe' | 'texto';
};

const estilosValor: Record<NonNullable<FilaResumen['variante']>, string> = {
  numero: 'font-mono text-2xl font-medium tracking-[-0.02em] text-white tabular-nums',
  acento: 'font-mono text-2xl font-medium tracking-[-0.02em] text-lima tabular-nums',
  importe: 'font-mono text-lg font-medium tracking-[-0.02em] text-white tabular-nums',
  texto: 'text-sm font-medium text-gris-400',
};

function ResumenOrganizacion({ titulo, filas, nota }: { titulo: string; filas: FilaResumen[]; nota?: string }) {
  return (
    <Tarjeta variante="negra" className="flex flex-col gap-4">
      <h2 className="text-[15px] font-semibold">{titulo}</h2>

      <dl className="flex flex-col gap-[13px]">
        {filas.map(({ rotulo, valor, variante = 'numero' }, i) => (
          <div
            key={rotulo}
            className={`flex items-baseline justify-between gap-3 ${i > 0 ? 'border-t border-borde-oscuro pt-[13px]' : ''}`}
          >
            <dt className="text-sm text-gris-400">{rotulo}</dt>
            <dd className={`shrink-0 ${estilosValor[variante]}`}>{valor}</dd>
          </div>
        ))}
      </dl>

      {nota && <p className="text-[13px] leading-[1.45] text-gris-400">{nota}</p>}
    </Tarjeta>
  );
}
