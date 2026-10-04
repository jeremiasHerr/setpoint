import type { DatosCrearJugador, JugadorPadron } from '@setpoint/shared';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Boton } from '../components/Boton';
import { EncabezadoOrganizador } from '../components/EncabezadoOrganizador';
import { IconoMas } from '../components/IconoMas';
import { leerSesion, type Sesion } from '../features/auth/sesion';
import { useCerrarSesion } from '../features/auth/useCerrarSesion';
import { useSesionInvalida } from '../features/auth/useSesionInvalida';
import { useCircuito } from '../features/circuito/useCircuito';
import { iniciales, navegacionOrganizador } from '../features/organizador/encabezado';
import { PanelJugador, type ErroresJugador } from '../features/padron/PanelJugador';
import { TablaPadron } from '../features/padron/TablaPadron';
import { useCrearJugador, useEditarJugador, usePadron } from '../features/padron/usePadron';
import { ErrorApi } from '../lib/api';

function erroresDe(error: Error | null): ErroresJugador {
  if (!error) return {};
  if (!(error instanceof ErrorApi)) return { general: 'Algo salió mal. Probá de nuevo.' };

  switch (error.codigo) {
    case 'DATOS_INVALIDOS':
      return error.campos._ ? { general: error.campos._ } : { campos: error.campos };
    case 'CATEGORIA_NO_ENCONTRADA':
      return { campos: { categoria: 'Esa categoría ya no existe en tu circuito. Recargá la página.' } };
    case 'JUGADOR_NO_ENCONTRADO':
      return { general: 'Ese jugador ya no está en el padrón. Recargá la página.' };
    case 'SIN_CONEXION':
      return { general: 'No pudimos conectarnos. Revisá tu conexión y probá de nuevo.' };
    default:
      return { general: 'No pudimos guardar los cambios. Probá de nuevo en unos minutos.' };
  }
}

export function PadronPage() {
  const sesion = leerSesion();
  if (!sesion) return <Navigate to="/ingresar" replace />;
  return <Padron sesion={sesion} />;
}

function Padron({ sesion }: { sesion: Sesion }) {
  const { slug } = sesion.organizacion;
  const circuito = useCircuito(slug);
  const padron = usePadron(slug);
  const crear = useCrearJugador(slug);
  const editar = useEditarJugador(slug);
  const cerrarSesion = useCerrarSesion();

  const [editando, setEditando] = useState<JugadorPadron | null>(null);
  // Cambia después de cada alta para vaciar el formulario.
  const [altas, setAltas] = useState(0);

  const sesionInvalida = useSesionInvalida(circuito.error ?? padron.error ?? crear.error ?? editar.error);
  const mutacion = editando ? editar : crear;

  function elegir(jugador: JugadorPadron | null) {
    crear.reset();
    editar.reset();
    setEditando(jugador);
  }

  function agregarJugador() {
    elegir(null);
    document.getElementById('jugador-nombre')?.focus();
  }

  function guardar(datos: DatosCrearJugador) {
    if (editando) {
      editar.mutate({ id: editando.id, datos }, { onSuccess: () => setEditando(null) });
    } else {
      crear.mutate(datos, { onSuccess: () => setAltas((n) => n + 1) });
    }
  }

  function cambiarActivo(activo: boolean) {
    if (!editando) return;
    // El panel sigue abierto con el jugador actualizado, para poder deshacerlo.
    editar.mutate({ id: editando.id, datos: { activo } }, { onSuccess: (fila) => setEditando(fila) });
  }

  const cargando = !circuito.data || !padron.data;
  const error = circuito.error ?? padron.error;

  return (
    <div className="min-h-screen bg-white text-negro">
      <EncabezadoOrganizador
        organizacion={circuito.data?.nombre ?? sesion.organizacion.nombre}
        navegacion={navegacionOrganizador}
        activo="Padrón"
        iniciales={iniciales(sesion.usuario.nombre)}
        alSalir={cerrarSesion}
      />

      <div className="flex flex-wrap items-end justify-between gap-6 px-7 pt-[26px] pb-[18px]">
        <div className="flex flex-col gap-[7px]">
          <h1 className="text-[30px] font-semibold tracking-[-0.035em]">Padrón</h1>
          <p className="text-[15px] text-gris-500">
            Los jugadores de tu circuito. De acá salen las inscripciones, el ranking y el historial.
          </p>
        </div>
        {!cargando && (
          <div className="flex items-center gap-2.5">
            {/* Se habilita con la pantalla de importar padrón (F03). */}
            <Boton disabled>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-[15px]" aria-hidden="true">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <path d="M7 10l5 5 5-5" />
                <path d="M12 15V3" />
              </svg>
              Importar planilla
            </Boton>
            <Boton variante="organizador" onClick={agregarJugador}>
              <IconoMas className="size-[15px] stroke-[2.2]" />
              Agregar jugador
            </Boton>
          </div>
        )}
      </div>

      {cargando ? (
        <div className="flex flex-col items-start gap-3 px-7">
          {error && !sesionInvalida ? (
            <>
              <p className="text-[15px] text-gris-500">No pudimos cargar el padrón.</p>
              <Boton
                onClick={() => {
                  void circuito.refetch();
                  void padron.refetch();
                }}
              >
                Probar de nuevo
              </Boton>
            </>
          ) : (
            <p className="text-[15px] text-gris-500">Cargando el padrón…</p>
          )}
        </div>
      ) : (
        <main className="grid items-start gap-[22px] px-7 pb-7 lg:grid-cols-[minmax(0,1fr)_340px]">
          <TablaPadron
            jugadores={padron.data}
            categorias={circuito.data.categorias}
            conRanking={circuito.data.usaRanking}
            seleccionadoId={editando?.id ?? null}
            alEditar={elegir}
          />

          <aside className="flex flex-col gap-4">
            <PanelJugador
              key={editando ? `jugador-${editando.id}` : `alta-${altas}`}
              categorias={circuito.data.categorias}
              conRanking={circuito.data.usaRanking}
              jugador={editando ?? undefined}
              enviando={mutacion.isPending}
              errores={erroresDe(mutacion.error)}
              alGuardar={guardar}
              alCambiarActivo={cambiarActivo}
              alCancelar={() => elegir(null)}
            />

            {/* Sin Tarjeta: su bg-white le gana a bg-fondo. */}
            <div className="flex flex-col gap-[9px] rounded-tarjeta border border-linea bg-fondo p-[18px]">
              <h2 className="text-sm font-semibold">¿Son muchos?</h2>
              <p className="text-sm leading-normal text-gris-500">
                Subí la planilla que ya usás y se cargan todos de una vez, con sus puntos históricos.
              </p>
            </div>
          </aside>
        </main>
      )}
    </div>
  );
}
