import type { CasoDeRevision, ResolverRevision } from '@setpoint/shared';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Boton } from '../components/Boton';
import { EncabezadoOrganizador } from '../components/EncabezadoOrganizador';
import { leerSesion, type Sesion } from '../features/auth/sesion';
import { useCerrarSesion } from '../features/auth/useCerrarSesion';
import { useSesionInvalida } from '../features/auth/useSesionInvalida';
import { useCircuito } from '../features/circuito/useCircuito';
import { iniciales, navegacionOrganizador } from '../features/organizador/encabezado';
import { useGenerarLink } from '../features/padron/usePadron';
import { CasoHomonimo } from '../features/revisiones/CasoHomonimo';
import { CasoReclamo } from '../features/revisiones/CasoReclamo';
import { ColumnaRevisiones } from '../features/revisiones/ColumnaRevisiones';
import { LinkDespuesDeDesvincular } from '../features/revisiones/LinkDespuesDeDesvincular';
import { MarcaParaRevisar } from '../features/revisiones/piezas';
import { diaCorto } from '../features/revisiones/textos';
import { useCasoDeRevision, useResolverRevision, useRevisiones } from '../features/revisiones/useRevisiones';
import { ErrorApi } from '../lib/api';

function mensajeDeError(error: Error | null) {
  if (!error) return null;
  if (!(error instanceof ErrorApi)) return 'Algo salió mal. Probá de nuevo.';
  switch (error.codigo) {
    case 'PERFIL_VINCULADO':
      return 'Ese perfil ya tiene otra cuenta. Recargá la página.';
    case 'RECLAMANTE_CON_OTRO_PERFIL':
      return 'Quien reclama ya tiene otro perfil en tu circuito. Desvinculá ese primero desde el padrón.';
    case 'YA_INSCRIPTO':
      return 'Ese perfil ya está inscripto en el torneo. Revisalo en Inscripciones.';
    case 'CASO_NO_ENCONTRADO':
    case 'ACCION_NO_CORRESPONDE':
      return 'Este caso ya se resolvió. Recargá la página.';
    case 'SIN_CONEXION':
      return 'No pudimos conectarnos. Revisá tu conexión y probá de nuevo.';
    default:
      return 'No pudimos guardar la decisión. Probá de nuevo en unos minutos.';
  }
}

function subtitulo(caso: CasoDeRevision) {
  if (caso.motivo === 'homonimo') {
    const { inscripcion, elegido } = caso;
    const partes = [inscripcion?.torneo, elegido.categoria, inscripcion?.pagadoEn && `pagó el ${diaCorto(inscripcion.pagadoEn)}`];
    return partes.filter(Boolean).join(' · ');
  }
  const { perfil, reclamante } = caso;
  const partes = [`${perfil.nombre} ${perfil.apellido}`, perfil.categoria, reclamante.reclamadoEn && `reclamado el ${diaCorto(reclamante.reclamadoEn)}`];
  return partes.filter(Boolean).join(' · ');
}

// Revisar vinculación (docs/pantallas/organizador/revisar-vinculacion.html, decisión 051).
export function RevisarVinculacionPage() {
  const sesion = leerSesion();
  if (!sesion) return <Navigate to="/ingresar" replace />;
  return <Revisar sesion={sesion} />;
}

function Revisar({ sesion }: { sesion: Sesion }) {
  const { slug } = sesion.organizacion;
  const { jugadorId = '' } = useParams();
  const navegar = useNavigate();
  const circuito = useCircuito(slug);
  const revisiones = useRevisiones(slug);
  const caso = useCasoDeRevision(slug, jugadorId);
  const resolver = useResolverRevision(slug, Number(jugadorId));
  const generar = useGenerarLink(slug);
  const cerrarSesion = useCerrarSesion();
  const sesionInvalida = useSesionInvalida(circuito.error ?? revisiones.error ?? caso.error ?? resolver.error);

  const organizacion = circuito.data?.nombre ?? sesion.organizacion.nombre;
  const resuelto = resolver.isSuccess;
  const desvinculado = resuelto && resolver.variables?.accion === 'desvincular';

  const alResolver = (datos: ResolverRevision) =>
    resolver.mutate(datos, {
      onSuccess: (quedan) => {
        if (datos.accion === 'desvincular') {
          generar.mutate(Number(jugadorId));
          return;
        }
        // Sigue con el próximo caso; si no queda ninguno, se queda en el "listo".
        const proximo = quedan.casos[0];
        if (proximo) {
          resolver.reset();
          navegar(`/padron/revisar/${proximo.jugadorId}`);
        }
      },
    });

  const noEncontrado = caso.error instanceof ErrorApi && caso.error.codigo === 'CASO_NO_ENCONTRADO';

  return (
    <div className="min-h-screen bg-white text-negro">
      <EncabezadoOrganizador
        organizacion={organizacion}
        navegacion={navegacionOrganizador}
        activo="Padrón"
        iniciales={iniciales(sesion.usuario.nombre)}
        alSalir={cerrarSesion}
      />

      <div className="flex flex-col gap-[7px] px-7 pt-6 pb-5">
        <Link to="/padron" className="self-start text-sm text-gris-500 hover:text-negro">
          Padrón · para revisar
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-[30px] font-semibold tracking-[-0.035em]">Revisar vinculación</h1>
          {caso.data && !resuelto && <MarcaParaRevisar />}
        </div>
        {caso.data && <p className="text-[15px] text-gris-500">{subtitulo(caso.data)}</p>}
      </div>

      <div className="grid items-start gap-[22px] px-7 pb-7 lg:grid-cols-[minmax(0,1fr)_320px]">
        <main className="flex min-w-0 flex-col gap-[18px]">
          {caso.isPending && <p className="text-[15px] text-gris-500">Cargando el caso…</p>}
          {caso.error && !sesionInvalida && (
            <div className="flex flex-col items-start gap-3">
              <p className="text-[15px] text-gris-500">
                {noEncontrado ? 'Este caso ya no está para revisar: se resolvió o el perfil se desvinculó.' : 'No pudimos cargar el caso.'}
              </p>
              <Boton onClick={() => navegar('/padron')}>Volver al padrón</Boton>
            </div>
          )}

          {desvinculado ? (
            <LinkDespuesDeDesvincular organizacion={organizacion} jugador={generar.data} fallo={generar.isError} />
          ) : resuelto ? (
            <section className="flex flex-col items-start gap-3 rounded-[16px] border border-linea px-6 py-[22px]">
              <h2 className="text-xl font-semibold tracking-[-0.02em]">Listo, no queda nada para revisar</h2>
              <p className="text-[15px] text-gris-500">Las vinculaciones nuevas se siguen guardando solas.</p>
              <Boton onClick={() => navegar('/padron')}>Volver al padrón</Boton>
            </section>
          ) : (
            caso.data && (
              <>
                {caso.data.motivo === 'homonimo' ? (
                  <CasoHomonimo caso={caso.data} enviando={resolver.isPending} alResolver={alResolver} />
                ) : (
                  <CasoReclamo caso={caso.data} enviando={resolver.isPending} alResolver={alResolver} />
                )}
                {resolver.error && (
                  <p role="alert" className="rounded-control bg-fondo px-3.5 py-3 text-[15px] font-medium text-gris-700">
                    {mensajeDeError(resolver.error)}
                  </p>
                )}
              </>
            )
          )}
        </main>

        {revisiones.data && (
          <div className="flex flex-col gap-4">
            <ColumnaRevisiones revisiones={revisiones.data} actual={resuelto ? null : Number(jugadorId)} />
            {caso.data?.motivo === 'homonimo' && !resuelto && (
              <section className="flex flex-col gap-[9px] rounded-tarjeta border border-linea bg-fondo p-[18px]">
                <h2 className="text-sm font-semibold">¿No sabés cuál es?</h2>
                <p className="text-sm leading-normal text-gris-500">
                  Llamalos: el teléfono de cada perfil está en su tarjeta. Mientras tanto, la inscripción sigue confirmada.
                </p>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
