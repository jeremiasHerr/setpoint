import type { Tablero } from '@setpoint/shared';
import { useState, type ReactNode } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Boton } from '../components/Boton';
import { Confirmacion } from '../components/Confirmacion';
import { Numero } from '../components/Numero';
import { Tarjeta } from '../components/Tarjeta';
import { leerSesion, type Sesion } from '../features/auth/sesion';
import { useSesionInvalida } from '../features/auth/useSesionInvalida';
import { NOMBRE_DEL_CUADRO } from '../features/cuadros/cuadro';
import { BotonCopiarLink } from '../features/inicio/BotonCopiarLink';
import { BarrasDelTorneo } from '../features/tablero/BarrasDelTorneo';
import { LoQueFalta } from '../features/tablero/LoQueFalta';
import { ResumenPlazo } from '../features/tablero/ResumenPlazo';
import { elDia } from '../features/tablero/tablero';
import { useCerrarZonas, useTablero } from '../features/tablero/useTablero';
import { EncabezadoDelTorneo } from '../features/torneos/EncabezadoDelTorneo';
import { ZonaPorZona } from '../features/tablero/ZonaPorZona';
import { Esqueleto } from '../components/Esqueleto';

// Tablero del torneo (F15). Es la página del torneo mientras se juega: se llega desde el Sorteo
// confirmado, y Cargar resultado y el Cierre vuelven acá (decisión 063).
export function TableroPage() {
  const sesion = leerSesion();
  const { id } = useParams();
  if (!sesion) return <Navigate to="/ingresar" replace />;
  return <TableroDelTorneo sesion={sesion} torneoId={Number(id)} />;
}

function Marco({ sesion, torneoId, children }: { sesion: Sesion; torneoId: number; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-negro">
      <EncabezadoDelTorneo sesion={sesion} torneoId={torneoId} actual="tablero" />
      {children}
    </div>
  );
}

const ERRORES: Record<string, string> = {
  TORNEO_NO_ENCONTRADO: 'No encontramos ese torneo.',
  TABLERO_NO_DISPONIBLE: 'Este torneo todavía no tiene las zonas confirmadas: el tablero aparece después del sorteo.',
  SIN_CONEXION: 'No hay conexión. Probá de nuevo.',
};

function TableroDelTorneo({ sesion, torneoId }: { sesion: Sesion; torneoId: number }) {
  const tablero = useTablero(sesion.organizacion.slug, torneoId);
  const sesionInvalida = useSesionInvalida(tablero.error);
  const navegar = useNavigate();

  if (tablero.data) return <Contenido sesion={sesion} tablero={tablero.data} />;

  const codigo = tablero.error?.message ?? '';
  return (
    <Marco sesion={sesion} torneoId={torneoId}>
      <div className="flex flex-col items-start gap-3 px-7 pt-[34px]">
        {tablero.error && !sesionInvalida ? (
          <>
            <p className="text-[15px] text-gris-500">{ERRORES[codigo] ?? 'No pudimos cargar el tablero.'}</p>
            {codigo === 'TABLERO_NO_DISPONIBLE' ? (
              <Boton onClick={() => navegar(`/torneos/${torneoId}/sorteo`)}>Ir al sorteo</Boton>
            ) : codigo === 'TORNEO_NO_ENCONTRADO' ? (
              <Boton onClick={() => navegar('/inicio')}>Volver al inicio</Boton>
            ) : (
              <Boton onClick={() => void tablero.refetch()}>Probar de nuevo</Boton>
            )}
          </>
        ) : (
          <Esqueleto forma="pagina" />
        )}
      </div>
    </Marco>
  );
}

// "8 zonas de 4 · terminan el sábado 20". Con zonas de 3 y de 4, dice las dos.
function bajada(tablero: Tablero): string {
  const vence = tablero.plazo && tablero.plazo.dias >= 0 ? elDia(tablero.plazo.fechaLimite) : null;
  if (tablero.fase === 'terminado') return 'El torneo está cerrado y los puntos ya están en el ranking.';
  if (tablero.fase === 'cuadros') {
    const cuadros = tablero.tieneComplementaria
      ? `${NOMBRE_DEL_CUADRO.campeonato} y ${NOMBRE_DEL_CUADRO.complementaria.toLowerCase()}`
      : NOMBRE_DEL_CUADRO.campeonato;
    return vence ? `${cuadros} · la ronda en curso termina el ${vence}` : cuadros;
  }
  const tamanos = [...new Set(tablero.zonas.map((z) => z.filas.length))].sort((a, b) => b - a);
  const zonas = `${tablero.zonas.length} ${tablero.zonas.length === 1 ? 'zona' : 'zonas'} de ${tamanos.join(' y ')}`;
  return vence ? `${zonas} · terminan el ${vence}` : zonas;
}

// Lo que dice la confirmación de cerrar las zonas (decisión 096). Como arma la API los cuadros: los
// primeros de cada zona van al principal, y el resto, al consuelo si el torneo lo tiene.
function alCerrarLasZonas(tablero: Tablero): ReactNode[] {
  const { clasificanPorGrupo, tieneComplementaria, zonas } = tablero;
  const alPrincipal = zonas.reduce((suma, zona) => suma + Math.min(clasificanPorGrupo, zona.filas.length), 0);
  const alConsuelo = tieneComplementaria
    ? zonas.reduce((suma, zona) => suma + Math.max(0, zona.filas.length - clasificanPorGrupo), 0)
    : 0;
  return [
    alConsuelo > 0 ? (
      <>
        Se arman los cuadros: <Numero>{alPrincipal}</Numero> jugadores van a {NOMBRE_DEL_CUADRO.campeonato} y{' '}
        <Numero>{alConsuelo}</Numero> al {NOMBRE_DEL_CUADRO.complementaria.toLowerCase()}.
      </>
    ) : (
      <>
        Se arma el cuadro de {NOMBRE_DEL_CUADRO.campeonato} con <Numero>{alPrincipal}</Numero> jugadores.
      </>
    ),
    'Después, un resultado de zona solo se puede corregir si los cuadros quedan iguales.',
  ];
}

// Cuando lo que corresponde es pasar a la etapa siguiente: cerrar las zonas o cerrar el torneo.
function Siguiente({ titulo, texto, children }: { titulo: string; texto: string; children: ReactNode }) {
  return (
    <Tarjeta className="flex flex-wrap items-center justify-between gap-4 border-lima bg-lima-tenue px-5 py-4">
      <div className="flex flex-col gap-1">
        <p className="text-[15px] font-semibold">{titulo}</p>
        <p className="text-sm text-gris-700">{texto}</p>
      </div>
      <div className="flex flex-col items-end gap-1.5">{children}</div>
    </Tarjeta>
  );
}

function Contenido({ sesion, tablero }: { sesion: Sesion; tablero: Tablero }) {
  const slug = sesion.organizacion.slug;
  const { torneoId, fase } = tablero;
  const navegar = useNavigate();
  const cerrarZonas = useCerrarZonas(slug, torneoId);
  useSesionInvalida(cerrarZonas.error);
  const [cerrandoZonas, setCerrandoZonas] = useState(false);
  const enVivo = `/c/${slug}/torneos/${torneoId}/en-vivo`;

  const titulo = fase === 'grupos' ? 'Fase de grupos' : fase === 'cuadros' ? 'Cuadros' : 'Torneo cerrado';

  return (
    <Marco sesion={sesion} torneoId={torneoId}>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 px-7 pt-[26px] pb-5">
        <div className="flex flex-col gap-[7px]">
          <h1 className="text-[30px] font-semibold tracking-[-0.035em]">{titulo}</h1>
          <p className="text-[15px] text-gris-500">{bajada(tablero)}</p>
        </div>
        <div className="flex flex-wrap gap-[9px]">
          <BotonCopiarLink ruta={`/torneos/${torneoId}/en-vivo`} className="" />
          {/* En otra pestaña: la página pública no tiene menú, y así se vuelve al tablero cerrándola (decisión 084). */}
          <Boton onClick={() => window.open(enVivo, '_blank', 'noopener')}>Ver la página pública</Boton>
          {fase === 'terminado' ? (
            <Boton variante="organizador" className="font-semibold" onClick={() => navegar(`/torneos/${torneoId}/cierre`)}>
              Ver el cierre
            </Boton>
          ) : (
            <Boton variante="organizador" className="font-semibold" onClick={() => navegar(`/torneos/${torneoId}/resultados`)}>
              Cargar resultado
            </Boton>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-[26px] px-7 pb-7">
        {tablero.sePuedenCerrarLasZonas && (
          <Siguiente
            titulo="Todas las zonas tienen sus resultados"
            texto="Al cerrarlas se arman los cuadros con estas tablas. No se deshace."
          >
            <Boton variante="organizador" className="font-semibold" aria-haspopup="dialog" onClick={() => setCerrandoZonas(true)}>
              Cerrar zonas y armar los cuadros
            </Boton>
          </Siguiente>
        )}

        {tablero.sePuedeCerrarElTorneo && (
          <Siguiente titulo="Los campeones están definidos" texto="Revisá los puntos de cada jugador y cerrá el torneo.">
            <Boton variante="organizador" className="font-semibold" onClick={() => navegar(`/torneos/${torneoId}/cierre`)}>
              Cerrar el torneo
            </Boton>
          </Siguiente>
        )}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <BarrasDelTorneo tablero={tablero} />
          <ResumenPlazo tablero={tablero} />
        </div>

        {fase !== 'terminado' && <LoQueFalta slug={slug} tablero={tablero} />}
        {fase === 'grupos' && <ZonaPorZona tablero={tablero} />}
      </div>

      <Confirmacion
        abierta={cerrandoZonas}
        titulo="Cerrar las zonas"
        consecuencias={alCerrarLasZonas(tablero)}
        accion="Cerrar zonas y armar los cuadros"
        accionEnCurso="Cerrando…"
        enCurso={cerrarZonas.isPending}
        error={cerrarZonas.error && 'No se pudieron cerrar las zonas. Probá de nuevo.'}
        alCancelar={() => {
          cerrarZonas.reset();
          setCerrandoZonas(false);
        }}
        alConfirmar={() => cerrarZonas.mutate(undefined, { onSuccess: () => setCerrandoZonas(false) })}
      />
    </Marco>
  );
}
