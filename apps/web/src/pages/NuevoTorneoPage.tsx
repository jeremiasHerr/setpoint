import {
  calcularFormato,
  convocatoriaInicial,
  JUGADORES_POR_GRUPO,
  type Circuito,
  type Convocatoria,
  type DatosConvocatoria,
} from '@setpoint/shared';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Boton } from '../components/Boton';
import { EncabezadoOrganizador } from '../components/EncabezadoOrganizador';
import { Tarjeta } from '../components/Tarjeta';
import { leerSesion, type Sesion } from '../features/auth/sesion';
import { useCerrarSesion } from '../features/auth/useCerrarSesion';
import { useSesionInvalida } from '../features/auth/useSesionInvalida';
import { useCircuito } from '../features/circuito/useCircuito';
import { iniciales, navegacionOrganizador } from '../features/organizador/encabezado';
import { publicarConvocatoria } from '../features/torneos/api';
import { PanelComoQueda } from '../features/torneos/PanelComoQueda';
import { SeccionBasico } from '../features/torneos/SeccionBasico';
import { SeccionFormato } from '../features/torneos/SeccionFormato';
import { SeccionInscripcion } from '../features/torneos/SeccionInscripcion';
import { SeccionPlazos } from '../features/torneos/SeccionPlazos';
import { SeccionSedes } from '../features/torneos/SeccionSedes';
import { SeccionSistemaJuego } from '../features/torneos/SeccionSistemaJuego';
import {
  claveConvocatoria,
  useAutoguardadoConvocatoria,
  useConvocatoria,
  type ErroresConvocatoria,
  type EstadoGuardado,
} from '../features/torneos/useConvocatoria';
import { ErrorApi } from '../lib/api';

const textoEstado: Record<EstadoGuardado, string> = {
  'sin-cambios': 'se guarda solo',
  pendiente: 'guardando…',
  guardando: 'guardando…',
  guardado: 'guardado',
  incompleto: 'sin guardar',
  error: 'no se pudo guardar',
};

export function NuevoTorneoPage() {
  const sesion = leerSesion();
  const { id } = useParams();
  if (!sesion) return <Navigate to="/ingresar" replace />;
  // "nuevo" es el torneo que todavía no se guardó nunca.
  return <CargarTorneo sesion={sesion} id={id === 'nuevo' ? null : Number(id)} />;
}

function Encabezado({ sesion, organizacion }: { sesion: Sesion; organizacion: string }) {
  const cerrarSesion = useCerrarSesion();
  return (
    <EncabezadoOrganizador
      organizacion={organizacion}
      navegacion={navegacionOrganizador}
      iniciales={iniciales(sesion.usuario.nombre)}
      alSalir={cerrarSesion}
    />
  );
}

function CargarTorneo({ sesion, id }: { sesion: Sesion; id: number | null }) {
  const slug = sesion.organizacion.slug;
  const circuito = useCircuito(slug);
  const convocatoria = useConvocatoria(slug, id);
  const error = circuito.error ?? convocatoria.error;
  const sesionInvalida = useSesionInvalida(error);
  const navegar = useNavigate();

  // Al crearse el borrador la URL pasa de /torneos/nuevo a /torneos/:id. El editor sigue montado
  // porque el autoguardado deja la convocatoria en la caché antes de cambiar la URL.
  if (circuito.data && (id === null || convocatoria.data)) {
    return <EditorTorneo sesion={sesion} circuito={circuito.data} inicial={convocatoria.data ?? null} />;
  }

  const noExiste = error?.message === 'TORNEO_NO_ENCONTRADO';

  return (
    <div className="min-h-screen bg-white text-negro">
      <Encabezado sesion={sesion} organizacion={sesion.organizacion.nombre} />
      <div className="flex flex-col items-start gap-3 px-7 pt-[26px]">
        {noExiste ? (
          <>
            <p className="text-[15px] text-gris-500">No encontramos ese torneo.</p>
            <Boton onClick={() => navegar('/inicio')}>Volver al inicio</Boton>
          </>
        ) : error && !sesionInvalida ? (
          <>
            <p className="text-[15px] text-gris-500">No pudimos cargar el torneo.</p>
            <Boton
              onClick={() => {
                void circuito.refetch();
                if (id !== null) void convocatoria.refetch();
              }}
            >
              Probar de nuevo
            </Boton>
          </>
        ) : (
          <p className="text-[15px] text-gris-500">Cargando…</p>
        )}
      </div>
    </div>
  );
}

type PropsEditor = {
  sesion: Sesion;
  circuito: Circuito;
  // null = torneo nuevo.
  inicial: Convocatoria | null;
};

function EditorTorneo({ sesion, circuito, inicial }: PropsEditor) {
  const slug = sesion.organizacion.slug;
  // Solo se lee al montar: después manda lo que hay en pantalla. Si viene de la API trae además
  // id, estado y torneos; el schema los descarta al guardar.
  const [datos, setDatos] = useState<DatosConvocatoria>(() => inicial ?? convocatoriaInicial(circuito.categorias));
  const [erroresPublicar, setErroresPublicar] = useState<ErroresConvocatoria>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const navegar = useNavigate();
  const queryClient = useQueryClient();

  const guardado = useAutoguardadoConvocatoria(slug, inicial?.id ?? null, datos, (id) =>
    navegar(`/torneos/${id}`, { replace: true }),
  );
  const errores = { ...erroresPublicar, ...guardado.errores };

  // La API también deja editar con la inscripción abierta; publicar, solo el borrador.
  const estadoTorneo = inicial?.estado ?? 'borrador';
  const enBorrador = estadoTorneo === 'borrador';

  const formato = calcularFormato(datos);

  function cambiar<K extends keyof DatosConvocatoria>(campo: K, valor: DatosConvocatoria[K]) {
    setDatos((anterior) => ({ ...anterior, [campo]: valor }));
    setErroresPublicar({});
    setErrorGeneral(null);
  }

  // El cupo sigue a los grupos solo en las categorías que no lo cambiaron a mano.
  function cambiarGrupos(cantidadGrupos: number) {
    setDatos((anterior) => {
      const cupoAnterior = anterior.cantidadGrupos * JUGADORES_POR_GRUPO;
      const cupo = cantidadGrupos * JUGADORES_POR_GRUPO;
      return {
        ...anterior,
        cantidadGrupos,
        categorias: anterior.categorias.map((c) => (c.cupo === cupoAnterior ? { ...c, cupo } : c)),
      };
    });
  }

  async function publicar() {
    setOcupado(true);
    setErrorGeneral(null);
    // El autoguardado espera un momento: publicar sin esto publicaría la versión anterior.
    const id = await guardado.guardarAhora();
    if (id === null) {
      setErrorGeneral('Antes de publicar hay que poder guardarlo. Revisá lo que está marcado.');
      setOcupado(false);
      return;
    }

    try {
      const publicada = await publicarConvocatoria(slug, id);
      queryClient.setQueryData(claveConvocatoria(slug, id), publicada);
      navegar('/inicio');
    } catch (error) {
      if (error instanceof ErrorApi && error.codigo === 'DATOS_INCOMPLETOS') {
        setErroresPublicar(error.campos);
        setErrorGeneral('Faltan datos para publicar. Revisá lo que está marcado.');
      } else {
        setErrorGeneral('No pudimos publicar el torneo. Probá de nuevo.');
      }
      setOcupado(false);
    }
  }

  // Salir con un cambio sin guardar lo perdería: primero se manda lo pendiente.
  async function salir() {
    setOcupado(true);
    await guardado.guardarAhora();
    navegar('/inicio');
  }

  return (
    <div className="min-h-screen bg-white text-negro">
      <Encabezado sesion={sesion} organizacion={circuito.nombre} />

      <div className="flex flex-wrap items-end justify-between gap-6 px-7 pt-[26px] pb-5">
        <div className="flex flex-col gap-[7px]">
          <h1 className="text-[30px] font-semibold tracking-[-0.035em]">Nuevo torneo</h1>
          <p className="text-[15px] text-gris-500">
            Los valores vienen de la configuración de tu circuito. Cambiá solo lo que sea distinto esta vez.
          </p>
        </div>
        <span aria-live="polite" className="shrink-0 font-mono text-[13px] text-gris-500 tabular-nums">
          {guardado.estado === 'sin-cambios'
            ? `${enBorrador ? 'borrador' : 'publicado'} · ${textoEstado['sin-cambios']}`
            : textoEstado[guardado.estado]}
        </span>
      </div>

      <main className="grid items-start gap-[22px] px-7 pb-7 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-4">
          <SeccionBasico
            nombre={datos.nombre}
            etapa={datos.etapa}
            categorias={datos.categorias}
            usaRanking={circuito.usaRanking}
            etapasDelCircuito={circuito.etapas}
            categoriasDelCircuito={circuito.categorias}
            cupoPorDefecto={datos.cantidadGrupos * JUGADORES_POR_GRUPO}
            errores={errores}
            alCambiarNombre={(nombre) => cambiar('nombre', nombre)}
            alCambiarEtapa={(etapa) => cambiar('etapa', etapa)}
            alCambiarCategorias={(categorias) => cambiar('categorias', categorias)}
          />
          <SeccionFormato
            cantidadGrupos={datos.cantidadGrupos}
            clasificanPorGrupo={datos.clasificanPorGrupo}
            tieneComplementaria={datos.tieneComplementaria}
            errores={errores}
            alCambiarGrupos={cambiarGrupos}
            alCambiarClasificados={(clasificanPorGrupo) => cambiar('clasificanPorGrupo', clasificanPorGrupo)}
            alCambiarComplementaria={(tieneComplementaria) => cambiar('tieneComplementaria', tieneComplementaria)}
          />
          <SeccionSistemaJuego
            setsPorPartido={datos.setsPorPartido}
            puntoDeOro={datos.puntoDeOro}
            terceroSet={datos.terceroSet}
            puntosSuperTieBreak={datos.puntosSuperTieBreak}
            alCambiar={(campo, valor) => cambiar(campo, valor)}
          />
          <SeccionPlazos
            plazoGruposDias={datos.plazoGruposDias}
            plazoPorRondaDias={datos.plazoPorRondaDias}
            fechaInicio={datos.fechaInicio}
            cronograma={formato.cronograma}
            errores={errores}
            alCambiar={(campo, valor) => cambiar(campo, valor)}
          />
          <SeccionInscripcion
            precio={datos.precio}
            categorias={datos.categorias}
            cierreInscripcion={datos.cierreInscripcion}
            modoInscripcion={datos.modoInscripcion}
            cantidadGrupos={datos.cantidadGrupos}
            errores={errores}
            alCambiar={(campo, valor) => cambiar(campo, valor)}
          />
          <SeccionSedes
            sedeGrupos={datos.sedeGrupos}
            sedeEliminatorias={datos.sedeEliminatorias}
            alCambiar={(campo, valor) => cambiar(campo, valor)}
          />
        </div>

        <aside className="flex flex-col gap-3.5">
          <PanelComoQueda
            formato={formato}
            tieneComplementaria={datos.tieneComplementaria}
            fechaInicio={datos.fechaInicio}
            variasCategorias={datos.categorias.length > 1}
            // Un torneo suelto no actualiza ningún casillero del ranking.
            puntosCampeon={circuito.usaRanking && datos.etapa !== null ? circuito.puntos.campeon : null}
          />

          {enBorrador && (
            <Tarjeta className="flex flex-col gap-2.5 px-[18px] py-4">
              <h2 className="text-[15px] font-semibold">Al publicar</h2>
              <p className="text-sm leading-[1.45] text-gris-500">
                El torneo queda visible y se abren las inscripciones. Podés seguir editando el formato hasta que se cierre la
                inscripción.
              </p>
            </Tarjeta>
          )}

          <div className="flex flex-col gap-2.5">
            {errorGeneral && (
              <p role="alert" className="rounded-control border border-rojo-linea bg-rojo-fondo px-3.5 py-2.5 text-sm text-rojo-texto">
                {errorGeneral}
              </p>
            )}
            {enBorrador && (
              <Boton variante="organizador" grande className="w-full" disabled={ocupado} onClick={() => void publicar()}>
                Publicar el torneo
              </Boton>
            )}
            <Boton grande className="w-full" disabled={ocupado} onClick={() => void salir()}>
              {enBorrador ? 'Dejarlo en borrador' : 'Volver al inicio'}
            </Boton>
          </div>
        </aside>
      </main>
    </div>
  );
}
