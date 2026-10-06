import type { DecisionImportacion, Importacion, JugadorPadron, ResultadoConfirmacion } from '@setpoint/shared';
import { useMemo, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { Boton } from '../components/Boton';
import { EncabezadoOrganizador } from '../components/EncabezadoOrganizador';
import { Numero } from '../components/Numero';
import { Tarjeta } from '../components/Tarjeta';
import { leerSesion, type Sesion } from '../features/auth/sesion';
import { useCerrarSesion } from '../features/auth/useCerrarSesion';
import { useSesionInvalida } from '../features/auth/useSesionInvalida';
import { useCircuito } from '../features/circuito/useCircuito';
import {
  casillerosLeidos,
  decisionesIniciales,
  necesitaRevision,
  problemasPorFila,
  type Decisiones,
} from '../features/importacion/decisiones';
import { EstadoProcesando } from '../features/importacion/EstadoProcesando';
import { COLUMNAS, FilaImportacion } from '../features/importacion/FilaImportacion';
import { FormularioSubida } from '../features/importacion/FormularioSubida';
import { PieConfirmar } from '../features/importacion/PieConfirmar';
import { ResumenImportacion } from '../features/importacion/ResumenImportacion';
import {
  useConfirmarImportacion,
  useDescartarImportacion,
  useImportacion,
  useSubirPlanilla,
} from '../features/importacion/useImportacion';
import { iniciales, navegacionOrganizador } from '../features/organizador/encabezado';
import { usePadron } from '../features/padron/usePadron';
import { ErrorApi } from '../lib/api';

function errorDeSubida(error: Error | null) {
  if (!error) return undefined;
  switch (error instanceof ErrorApi ? error.codigo : null) {
    case 'ARCHIVO_INVALIDO':
      return 'Ese archivo no es una planilla. Subí un .xlsx, .xls o .csv.';
    case 'ARCHIVO_MUY_GRANDE':
      return 'La planilla pesa más de 2 MB. ¿Seguro que es el ranking?';
    case 'CATEGORIA_NO_ENCONTRADA':
      return 'Esa categoría ya no existe en tu circuito. Recargá la página.';
    case 'SIN_CONEXION':
      return 'No pudimos conectarnos. Revisá tu conexión y probá de nuevo.';
    default:
      return 'No pudimos leer la planilla. Probá de nuevo en unos minutos.';
  }
}

function errorDeConfirmacion(error: Error | null) {
  if (!error) return undefined;
  switch (error instanceof ErrorApi ? error.codigo : null) {
    case 'DATOS_INVALIDOS':
      return 'Hay filas vinculadas dos veces al mismo jugador o a alguien que ya no está en el padrón. Revisalas.';
    case 'IMPORTACION_NO_PENDIENTE':
      return 'Esta importación ya se confirmó o se descartó. Recargá la página.';
    case 'SIN_CONEXION':
      return 'No pudimos conectarnos. Revisá tu conexión y probá de nuevo.';
    default:
      return 'No pudimos guardar la importación. Probá de nuevo en unos minutos.';
  }
}

export function ImportarPadronPage() {
  const sesion = leerSesion();
  if (!sesion) return <Navigate to="/ingresar" replace />;
  return <ImportarPadron sesion={sesion} />;
}

function ImportarPadron({ sesion }: { sesion: Sesion }) {
  const { slug } = sesion.organizacion;
  // El id va en la URL: si se recarga la página, la revisión sigue donde estaba.
  const [parametros, setParametros] = useSearchParams();
  const id = Number(parametros.get('id')) || null;

  const circuito = useCircuito(slug);
  const padron = usePadron(slug);
  const subir = useSubirPlanilla(slug);
  const importacion = useImportacion(slug, id);
  const [archivoSubiendo, setArchivoSubiendo] = useState('');
  // Lo que respondió la confirmación, para el mensaje final. Si se recarga, se pierde.
  const [confirmada, setConfirmada] = useState<ResultadoConfirmacion>();
  const cerrarSesion = useCerrarSesion();

  const sesionInvalida = useSesionInvalida(circuito.error ?? padron.error ?? importacion.error ?? subir.error);

  function subirPlanilla(archivo: File, categoria: string) {
    setArchivoSubiendo(archivo.name);
    subir.mutate({ archivo, categoria }, { onSuccess: (nueva) => setParametros({ id: String(nueva.id) }) });
  }

  function empezarDeNuevo() {
    subir.reset();
    setConfirmada(undefined);
    setParametros({});
  }

  const enRevision = importacion.data?.estado === 'PROCESADO';

  let contenido;
  if (subir.isPending) {
    contenido = (
      <main className="px-7 pb-7">
        <EstadoProcesando archivo={archivoSubiendo} />
      </main>
    );
  } else if (id === null) {
    contenido = circuito.data ? (
      <main className="px-7 pb-7">
        <FormularioSubida
          categorias={circuito.data.categorias}
          enviando={subir.isPending}
          error={errorDeSubida(subir.error)}
          alSubir={subirPlanilla}
        />
      </main>
    ) : (
      <Cargando error={!!circuito.error && !sesionInvalida} />
    );
  } else if (!importacion.data || !padron.data) {
    contenido = <Cargando error={!!(importacion.error ?? padron.error) && !sesionInvalida} />;
  } else if (importacion.data.estado === 'PROCESADO') {
    contenido = (
      <Revision
        key={importacion.data.id}
        slug={slug}
        importacion={importacion.data}
        padron={padron.data}
        alConfirmar={setConfirmada}
        alDescartar={empezarDeNuevo}
      />
    );
  } else {
    contenido = <Final slug={slug} importacion={importacion.data} confirmada={confirmada} alSubirOtro={empezarDeNuevo} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-negro">
      <EncabezadoOrganizador
        organizacion={circuito.data?.nombre ?? sesion.organizacion.nombre}
        navegacion={navegacionOrganizador}
        activo="Padrón"
        iniciales={iniciales(sesion.usuario.nombre)}
        alSalir={cerrarSesion}
      />

      <div className="flex flex-col gap-2 px-7 pt-[26px] pb-5">
        <Link to="/padron" className="text-sm text-gris-500 hover:text-negro">
          ← Padrón
        </Link>
        <h1 className="text-[30px] font-semibold tracking-[-0.035em]">
          {enRevision ? 'Revisá la importación' : 'Importar planilla'}
        </h1>
        {enRevision && importacion.data && (
          <div className="flex items-center gap-2.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-gris-500" aria-hidden="true">
              <path d="M6 3h8l4 4v14H6z" />
              <path d="M14 3v4h4" />
            </svg>
            <span className="font-mono text-sm text-gris-500">
              {importacion.data.archivoNombre} · {importacion.data.propuesta.length} jugadores leídos
            </span>
          </div>
        )}
      </div>

      {contenido}
    </div>
  );
}

function Cargando({ error }: { error: boolean }) {
  return (
    <p className="px-7 text-[15px] text-gris-500">
      {error ? 'No pudimos cargar la importación. Recargá la página.' : 'Cargando…'}
    </p>
  );
}

type PropsRevision = {
  slug: string;
  importacion: Importacion;
  padron: JugadorPadron[];
  alConfirmar: (resultado: ResultadoConfirmacion) => void;
  alDescartar: () => void;
};

function Revision({ slug, importacion, padron, alConfirmar, alDescartar }: PropsRevision) {
  const confirmar = useConfirmarImportacion(slug, importacion.id);
  const descartar = useDescartarImportacion(slug, importacion.id);

  const problemas = useMemo(() => problemasPorFila(importacion), [importacion]);
  const [decisiones, setDecisiones] = useState<Decisiones>(() => decisionesIniciales(importacion));

  // Primero lo que hay que mirar, abierto. Después el resto, cerrado.
  const [paraRevisar, resto] = useMemo(() => {
    const revisar = importacion.propuesta.filter((f) => necesitaRevision(f, problemas.get(f.fila)));
    return [revisar, importacion.propuesta.filter((f) => !revisar.includes(f))];
  }, [importacion, problemas]);
  const [expandidas, setExpandidas] = useState(() => new Set(paraRevisar.map((f) => f.fila)));

  function cambiar(decision: DecisionImportacion) {
    confirmar.reset();
    setDecisiones((d) => ({ ...d, [decision.fila]: decision }));
  }

  function alternar(fila: number) {
    setExpandidas((actuales) => {
      const nuevas = new Set(actuales);
      if (!nuevas.delete(fila)) nuevas.add(fila);
      return nuevas;
    });
  }

  const lista = Object.values(decisiones);
  const aImportar = lista.filter((d) => d.accion !== 'excluir').length;

  const fila = (f: Importacion['propuesta'][number]) => (
    <FilaImportacion
      key={f.fila}
      fila={f}
      decision={decisiones[f.fila]}
      problemas={problemas.get(f.fila)}
      padron={padron}
      expandida={expandidas.has(f.fila)}
      alCambiar={cambiar}
      alExpandir={() => alternar(f.fila)}
    />
  );

  return (
    <>
      <main className="flex flex-1 flex-col gap-5 px-7 pb-7">
        <ResumenImportacion
          conteos={importacion.conteos}
          categoria={importacion.categoria}
          casilleros={casillerosLeidos(importacion.propuesta)}
          jugadores={importacion.propuesta.length}
        />

        <div className="overflow-x-auto rounded-tarjeta border border-linea">
          <div className={`${COLUMNAS} h-[42px] border-b border-linea bg-fondo-tabla px-[18px] font-mono text-[11px] text-gris-500`}>
            <span>como figura en la planilla</span>
            <span>jugador del padrón</span>
            <span>casilleros</span>
            <span className="text-right">qué va a pasar</span>
          </div>
          <ul>
            {paraRevisar.map(fila)}
            {paraRevisar.length > 0 && resto.length > 0 && (
              <li className="border-b border-linea-suave bg-fondo-tabla px-[18px] py-2 font-mono text-[11px] text-gris-500">
                el resto · <Numero>{resto.length}</Numero>
              </li>
            )}
            {resto.map(fila)}
          </ul>
        </div>
      </main>

      <PieConfirmar
        aImportar={aImportar}
        enviando={confirmar.isPending || descartar.isPending}
        error={errorDeConfirmacion(confirmar.error)}
        alCancelar={() => descartar.mutate(undefined, { onSuccess: alDescartar })}
        alConfirmar={() => confirmar.mutate({ decisiones: lista }, { onSuccess: alConfirmar })}
      />
    </>
  );
}

type PropsFinal = {
  slug: string;
  importacion: Importacion;
  confirmada?: ResultadoConfirmacion;
  alSubirOtro: () => void;
};

// Cómo terminó: confirmada, descartada o con error. Si terminó en error, el motivo.
function Final({ slug, importacion, confirmada, alSubirOtro }: PropsFinal) {
  const descartar = useDescartarImportacion(slug, importacion.id);

  if (importacion.estado === 'CONFIRMADO') {
    return (
      <main className="px-7 pb-7">
        <Tarjeta className="flex max-w-[560px] flex-col gap-4 p-[22px]">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-[17px] font-semibold">Listo, el padrón quedó actualizado</h2>
            {confirmada ? (
              <p className="text-[15px] leading-normal text-gris-500">
                <Numero>{confirmada.creados}</Numero> altas y <Numero>{confirmada.vinculados}</Numero> jugadores
                que ya estaban. Se cargaron <Numero>{confirmada.movimientosCreados}</Numero> casilleros
                {confirmada.movimientosSalteados > 0 && (
                  <>
                    {' '}
                    y se saltearon <Numero>{confirmada.movimientosSalteados}</Numero> que ya estaban cargados
                  </>
                )}
                .
              </p>
            ) : (
              <p className="text-[15px] text-gris-500">Los puntos ya cuentan para el ranking.</p>
            )}
          </div>
          <div className="flex gap-2.5">
            <Link
              to="/padron"
              className="inline-flex h-10 items-center rounded-control bg-negro px-4 text-[15px] font-medium text-white"
            >
              Ver el padrón
            </Link>
            <Boton onClick={alSubirOtro}>Importar otra planilla</Boton>
          </div>
        </Tarjeta>
      </main>
    );
  }

  const esError = importacion.estado === 'ERROR';
  return (
    <main className="px-7 pb-7">
      <Tarjeta className="flex max-w-[560px] flex-col gap-4 p-[22px]">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-[17px] font-semibold">
            {esError ? 'No pudimos leer esta planilla' : 'Descartaste esta importación'}
          </h2>
          <p className="text-[15px] leading-normal text-gris-500">
            {esError ? importacion.error : 'No se guardó nada. Podés subir la planilla de nuevo cuando quieras.'}
          </p>
          {esError && (
            <p className="font-mono text-xs text-gris-500">{importacion.archivoNombre}</p>
          )}
        </div>
        <Boton
          variante="organizador"
          className="self-start"
          disabled={descartar.isPending}
          // Una importación con error se descarta al subir otra, para que no quede pendiente.
          onClick={() => (esError ? descartar.mutate(undefined, { onSettled: alSubirOtro }) : alSubirOtro())}
        >
          Subir otro archivo
        </Boton>
      </Tarjeta>
    </main>
  );
}
