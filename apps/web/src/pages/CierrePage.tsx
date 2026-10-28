import type { CierreDelTorneo } from '@setpoint/shared';
import type { ReactNode } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Boton } from '../components/Boton';
import { EncabezadoOrganizador } from '../components/EncabezadoOrganizador';
import { Numero } from '../components/Numero';
import { leerSesion, type Sesion } from '../features/auth/sesion';
import { useCerrarSesion } from '../features/auth/useCerrarSesion';
import { useSesionInvalida } from '../features/auth/useSesionInvalida';
import { ResumenCierre } from '../features/cierre/ResumenCierre';
import { TablaPuntosAOtorgar } from '../features/cierre/TablaPuntosAOtorgar';
import { TarjetaCampeon } from '../features/cierre/TarjetaCampeon';
import { useCerrarTorneo, useCierre } from '../features/cierre/useCierre';
import { iniciales, navegacionOrganizador } from '../features/organizador/encabezado';

// Cerrar el torneo (F16). Se llega desde Cargar resultado, con las finales cargadas (decisión 058).
export function CierrePage() {
  const sesion = leerSesion();
  const { id } = useParams();
  if (!sesion) return <Navigate to="/ingresar" replace />;
  return <Cierre sesion={sesion} torneoId={Number(id)} />;
}

function Marco({ sesion, children }: { sesion: Sesion; children: ReactNode }) {
  const cerrarSesion = useCerrarSesion();
  return (
    <div className="min-h-screen bg-white text-negro">
      <EncabezadoOrganizador
        organizacion={sesion.organizacion.nombre}
        navegacion={navegacionOrganizador}
        iniciales={iniciales(sesion.usuario.nombre)}
        alSalir={cerrarSesion}
      />
      {children}
    </div>
  );
}

const ERRORES: Record<string, string> = {
  TORNEO_NO_ENCONTRADO: 'No encontramos ese torneo.',
  TORNEO_NO_CERRABLE: 'Este torneo todavía no llegó a los cuadros: se cierra cuando se definen los campeones.',
  CUADROS_INCOMPLETOS: 'Todavía faltan resultados de los cuadros. Cargalos y volvé a cerrar el torneo.',
  SIN_CONEXION: 'No hay conexión. Probá de nuevo.',
};

function Cierre({ sesion, torneoId }: { sesion: Sesion; torneoId: number }) {
  const slug = sesion.organizacion.slug;
  const cierre = useCierre(slug, torneoId);
  const sesionInvalida = useSesionInvalida(cierre.error);
  const navegar = useNavigate();

  if (cierre.data) return <VistaDelCierre sesion={sesion} cierre={cierre.data} />;

  const codigo = cierre.error?.message ?? '';
  return (
    <Marco sesion={sesion}>
      <div className="flex flex-col items-start gap-3 px-7 pt-[34px]">
        {cierre.error && !sesionInvalida ? (
          <>
            <p className="text-[15px] text-gris-500">{ERRORES[codigo] ?? 'No pudimos cargar el cierre del torneo.'}</p>
            {codigo === 'CUADROS_INCOMPLETOS' ? (
              <Boton onClick={() => navegar(`/torneos/${torneoId}/resultados`)}>Cargar resultados</Boton>
            ) : codigo === 'TORNEO_NO_ENCONTRADO' || codigo === 'TORNEO_NO_CERRABLE' ? (
              <Boton onClick={() => navegar('/inicio')}>Volver al inicio</Boton>
            ) : (
              <Boton onClick={() => void cierre.refetch()}>Probar de nuevo</Boton>
            )}
          </>
        ) : (
          <p className="text-[15px] text-gris-500">Cargando…</p>
        )}
      </div>
    </Marco>
  );
}

function Subtitulo({ cierre }: { cierre: CierreDelTorneo }) {
  const partidos = (
    <>
      Los <Numero>{cierre.partidosJugados}</Numero> partidos están cargados.
    </>
  );
  if (cierre.cerrado) {
    return cierre.torneoDelCalendario
      ? <>Los puntos ya están en el ranking. Si corregís un resultado, se recalculan solos.</>
      : <>El torneo quedó con sus posiciones finales.</>;
  }
  return cierre.torneoDelCalendario ? (
    <>
      {partidos} Revisá los puntos antes de confirmar: después del cierre, corregir un resultado recalcula el ranking.
    </>
  ) : (
    <>{partidos} Este torneo no da puntos de ranking: al cerrarlo quedan sus posiciones finales.</>
  );
}

// Quienes no pasaron al cuadro principal suman participación, y reemplazan su casillero.
function AvisoParticipacion({ cierre }: { cierre: CierreDelTorneo }) {
  const participacion = cierre.filas.filter((f) => f.instancia === 'participacion');
  const puntos = participacion[0]?.ranking?.puntos;
  if (cierre.cerrado || puntos === undefined) return null;
  return (
    <div className="flex items-start gap-[11px] rounded-tarjeta border border-linea bg-fondo px-[18px] py-4">
      <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" className="mt-px shrink-0 text-gris-500">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v5M12 16v.01" />
      </svg>
      <p className="text-sm leading-normal text-gris-500">
        Los <Numero>{participacion.length}</Numero> jugadores de participación reciben{' '}
        <Numero className="text-negro">{puntos}</Numero> puntos de participación. Cada uno reemplaza lo que tenía en el casillero
        de {cierre.torneoDelCalendario}, no se suma encima.
      </p>
    </div>
  );
}

function VistaDelCierre({ sesion, cierre }: { sesion: Sesion; cierre: CierreDelTorneo }) {
  const slug = sesion.organizacion.slug;
  const { torneoId } = cierre;
  const cerrar = useCerrarTorneo(slug, torneoId);
  useSesionInvalida(cerrar.error);
  const navegar = useNavigate();
  const conRanking = cierre.torneoDelCalendario !== null;

  return (
    <Marco sesion={sesion}>
      <div className="flex flex-col gap-[7px] px-7 pt-[26px] pb-5">
        <nav aria-label="Migas" className="flex flex-wrap items-center gap-[9px] text-sm">
          <Link to={`/torneos/${torneoId}/resultados`} className="text-gris-500 hover:text-negro">
            <Numero>{cierre.nombre}</Numero>
          </Link>
          <span aria-hidden="true" className="text-gris-300">
            /
          </span>
          <span aria-current="page" className="font-semibold">
            Cierre
          </span>
        </nav>
        <h1 className="text-[30px] font-semibold tracking-[-0.035em]">{cierre.cerrado ? 'Torneo cerrado' : 'Cerrar el torneo'}</h1>
        <p className="text-[15px] text-gris-500">
          <Subtitulo cierre={cierre} />
        </p>
      </div>

      <div className="grid items-start gap-[22px] px-7 pb-7 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            {cierre.campeones.map((campeon) => (
              <TarjetaCampeon key={campeon.cuadro} campeon={campeon} />
            ))}
          </div>
          <TablaPuntosAOtorgar cierre={cierre} />
          <AvisoParticipacion cierre={cierre} />
        </div>

        <div className="flex flex-col gap-4">
          {cierre.resumen && <ResumenCierre resumen={cierre.resumen} cerrado={cierre.cerrado} />}
          {cierre.cerrado ? (
            <div className="flex flex-col gap-2.5">
              {conRanking && (
                <Boton variante="organizador" grande onClick={() => navegar(`/c/${slug}/ranking`)}>
                  Ver el ranking
                </Boton>
              )}
              <Boton onClick={() => navegar(`/torneos/${torneoId}/resultados`)}>Ver los resultados</Boton>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {cerrar.error && (
                <p className="text-sm text-rojo-texto">{ERRORES[cerrar.error.message] ?? 'No se pudo cerrar el torneo. Probá de nuevo.'}</p>
              )}
              <Boton variante="organizador" grande disabled={cerrar.isPending} onClick={() => cerrar.mutate()}>
                {cerrar.isPending ? 'Cerrando…' : conRanking ? 'Cerrar y actualizar el ranking' : 'Cerrar el torneo'}
              </Boton>
              <Boton onClick={() => navegar(`/torneos/${torneoId}/resultados`)}>Volver a los resultados</Boton>
            </div>
          )}
        </div>
      </div>
    </Marco>
  );
}
