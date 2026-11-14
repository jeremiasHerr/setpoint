import type { DecisionImportacion, FilaPropuesta, HojaImportada, Importacion, JugadorPadron, ResultadoConfirmacion } from '@setpoint/shared';
import { useMemo, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { Boton } from '../components/Boton';
import { Campo } from '../components/Campo';
import { EncabezadoOrganizador } from '../components/EncabezadoOrganizador';
import { Esqueleto } from '../components/Esqueleto';
import { Numero } from '../components/Numero';
import { Tarjeta } from '../components/Tarjeta';
import { leerSesion, type Sesion } from '../features/auth/sesion';
import { useCerrarSesion } from '../features/auth/useCerrarSesion';
import { useSesionInvalida } from '../features/auth/useSesionInvalida';
import { useCircuito } from '../features/circuito/useCircuito';
import {
  casillerosLeidos,
  claveDe,
  decisionesIniciales,
  hojasLeidas,
  necesitaRevision,
  problemasPorFila,
  type Decisiones,
} from '../features/importacion/decisiones';
import { EstadoProcesando } from '../features/importacion/EstadoProcesando';
import { COLUMNAS, FilaImportacion } from '../features/importacion/FilaImportacion';
import { FormularioSubida } from '../features/importacion/FormularioSubida';
import { LoQueSeCrea } from '../features/importacion/LoQueSeCrea';
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
      return 'Una de las planillas pesa más de 2 MB. ¿Seguro que es el ranking?';
    case 'DEMASIADOS_ARCHIVOS':
      return 'Subí hasta 10 archivos por vez.';
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
      return 'Hay filas vinculadas dos veces al mismo jugador, en la misma hoja o en dos, o a alguien que ya no está en el padrón. Revisalas.';
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

  function subirPlanilla(archivos: File[], categoria: string | null) {
    setArchivoSubiendo(archivos.length === 1 ? archivos[0].name : `${archivos.length} archivos`);
    subir.mutate({ archivos, categoria }, { onSuccess: (nueva) => setParametros({ id: String(nueva.id) }) });
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
              {importacion.data.archivoNombre} ·{' '}
              {importacion.data.hojas.reduce((suma, h) => suma + h.propuesta.length, 0)} jugadores leídos
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
    <div className="px-7">
      {error ? (
        <p className="text-[15px] text-gris-500">No pudimos cargar la importación. Recargá la página.</p>
      ) : (
        <Esqueleto />
      )}
    </div>
  );
}

type PropsRevision = {
  slug: string;
  importacion: Importacion;
  padron: JugadorPadron[];
  alConfirmar: (resultado: ResultadoConfirmacion) => void;
  alDescartar: () => void;
};

// Cómo se nombra una hoja en la revisión: su categoría o, si no la dice, su archivo y su hoja.
const nombreDeHoja = (h: HojaImportada) => h.categoria ?? [h.archivoNombre, h.hoja].filter(Boolean).join(' · ');

// La revisión del lote, en una sola página (decisión 012): arriba los totales y lo que se crea; después
// "Para revisar", con las filas dudosas de todas las hojas juntas; abajo cada hoja con el resto de sus
// filas, plegada. Se confirma el lote entero.
function Revision({ slug, importacion, padron, alConfirmar, alDescartar }: PropsRevision) {
  const confirmar = useConfirmarImportacion(slug, importacion.id);
  const descartar = useDescartarImportacion(slug, importacion.id);

  const leidas = useMemo(() => hojasLeidas(importacion), [importacion]);
  const conError = importacion.hojas.filter((h) => h.estado === 'ERROR');
  const problemas = useMemo(() => new Map(leidas.map((h) => [h.id, problemasPorFila(h)])), [leidas]);
  const [decisiones, setDecisiones] = useState<Decisiones>(() => decisionesIniciales(importacion));
  // Las hojas que no decían su categoría y no se eligió al subir: se elige acá (decisión 011).
  const sinCategoria = leidas.filter((h) => h.categoria === null);
  const [categorias, setCategorias] = useState<Record<string, string>>({});
  const falta = sinCategoria.some((h) => !categorias[h.id]?.trim());

  // Primero lo que hay que mirar, de todas las hojas, abierto. Después el resto de cada hoja.
  const paraRevisar = useMemo(
    () =>
      leidas.flatMap((h) =>
        h.propuesta.filter((f) => necesitaRevision(f, problemas.get(h.id)?.get(f.fila))).map((fila) => ({ hoja: h, fila })),
      ),
    [leidas, problemas],
  );
  const [expandidas, setExpandidas] = useState(() => new Set(paraRevisar.map(({ hoja, fila }) => claveDe(hoja.id, fila.fila))));
  // Con una sola hoja, su resto se ve abierto, como antes; con varias, cada una arranca plegada.
  const [abiertas, setAbiertas] = useState(() => new Set(leidas.length === 1 ? [leidas[0].id] : []));

  function cambiar(decision: DecisionImportacion) {
    confirmar.reset();
    setDecisiones((d) => ({ ...d, [claveDe(decision.hoja, decision.fila)]: decision }));
  }

  const alternar = <T,>(valor: T) => (actuales: Set<T>) => {
    const nuevas = new Set(actuales);
    if (!nuevas.delete(valor)) nuevas.add(valor);
    return nuevas;
  };

  const lista = Object.values(decisiones);
  const aImportar = lista.filter((d) => d.accion !== 'excluir').length;
  const todas = leidas.flatMap((h) => h.propuesta);
  const unaCategoria = new Set(leidas.map((h) => h.categoria)).size === 1 ? leidas[0]?.categoria ?? null : null;
  const elegidas = sinCategoria.flatMap((h) => (categorias[h.id]?.trim() ? [categorias[h.id].trim()] : []));
  const crea = { ...importacion.crea, categorias: [...importacion.crea.categorias, ...elegidas.filter((c, i) => elegidas.indexOf(c) === i)] };

  const fila = (hoja: HojaImportada, f: FilaPropuesta, etiqueta: boolean) => {
    const clave = claveDe(hoja.id, f.fila);
    return (
      <FilaImportacion
        key={clave}
        hoja={hoja.id}
        categoria={etiqueta ? nombreDeHoja(hoja) : undefined}
        fila={f}
        decision={decisiones[clave]}
        problemas={problemas.get(hoja.id)?.get(f.fila)}
        padron={padron}
        expandida={expandidas.has(clave)}
        alCambiar={cambiar}
        alExpandir={() => setExpandidas(alternar(clave))}
      />
    );
  };

  const encabezado = (
    <div className={`${COLUMNAS} h-[42px] border-b border-linea bg-fondo-tabla px-[18px] font-mono text-[11px] text-gris-500`}>
      <span>como figura en la planilla</span>
      <span>jugador del padrón</span>
      <span>casilleros</span>
      <span className="text-right">qué va a pasar</span>
    </div>
  );

  return (
    <>
      <main className="flex flex-1 flex-col gap-5 px-7 pb-7">
        <ResumenImportacion
          conteos={importacion.conteos}
          categoria={unaCategoria}
          casilleros={casillerosLeidos(todas)}
          jugadores={todas.length}
        />

        {sinCategoria.map((h) => (
          <div key={h.id} className="flex max-w-[420px] flex-col gap-1.5">
            <Campo
              id={`importacion-categoria-${h.id}`}
              rotulo={`¿De qué categoría es ${nombreDeHoja(h)}?`}
              autoComplete="off"
              value={categorias[h.id] ?? ''}
              onChange={(e) => {
                confirmar.reset();
                setCategorias((c) => ({ ...c, [h.id]: e.target.value }));
              }}
            />
            <p className="text-sm text-gris-500">No la encontramos en la hoja ni en el nombre del archivo.</p>
          </div>
        ))}

        <LoQueSeCrea crea={crea} />

        {conError.length > 0 && (
          <div className="flex flex-col gap-1.5 rounded-tarjeta border border-linea px-[18px] py-4 text-[15px]">
            <p className="font-semibold">
              {conError.length === 1 ? 'Una planilla no se pudo leer y queda afuera' : `${conError.length} planillas no se pudieron leer y quedan afuera`}
            </p>
            {conError.map((h) => (
              <p key={h.id} className="text-sm text-gris-700">
                <span className="font-mono">{nombreDeHoja(h)}</span> · {h.error}
              </p>
            ))}
          </div>
        )}

        {paraRevisar.length > 0 && (
          <section className="flex flex-col gap-2.5">
            <h2 className="text-[17px] font-semibold">
              Para revisar · <Numero>{paraRevisar.length}</Numero>
            </h2>
            <div className="overflow-x-auto rounded-tarjeta border border-linea">
              {encabezado}
              <ul>{paraRevisar.map(({ hoja, fila: f }) => fila(hoja, f, leidas.length > 1))}</ul>
            </div>
          </section>
        )}

        {leidas.map((h) => {
          const resto = h.propuesta.filter((f) => !necesitaRevision(f, problemas.get(h.id)?.get(f.fila)));
          if (resto.length === 0) return null;
          const abierta = abiertas.has(h.id);
          return (
            <section key={h.id} className="flex flex-col gap-2.5">
              <button
                type="button"
                aria-expanded={abierta}
                onClick={() => setAbiertas(alternar(h.id))}
                className="flex items-baseline gap-2.5 self-start text-left"
              >
                <span className="text-[17px] font-semibold">{nombreDeHoja(h)}</span>
                <span className="font-mono text-[13px] text-gris-500">
                  {h.categoria && <>{h.archivoNombre} · </>}
                  <Numero>{resto.length}</Numero> sin dudas
                </span>
                <span className="text-sm font-medium underline">{abierta ? 'Ocultar' : 'Ver'}</span>
              </button>
              {abierta && (
                <div className="overflow-x-auto rounded-tarjeta border border-linea">
                  {encabezado}
                  <ul>{resto.map((f) => fila(h, f, false))}</ul>
                </div>
              )}
            </section>
          );
        })}
      </main>

      <PieConfirmar
        aImportar={aImportar}
        enviando={confirmar.isPending || descartar.isPending}
        falta={falta}
        error={errorDeConfirmacion(confirmar.error)}
        alCancelar={() => descartar.mutate(undefined, { onSuccess: alDescartar })}
        alConfirmar={() =>
          confirmar.mutate(
            {
              decisiones: lista,
              ...(sinCategoria.length > 0 && {
                categorias: Object.fromEntries(sinCategoria.map((h) => [String(h.id), categorias[h.id].trim()])),
              }),
            },
            { onSuccess: alConfirmar },
          )
        }
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
            {esError
              ? importacion.hojas.length > 1
                ? 'No pudimos leer ninguna de las planillas'
                : 'No pudimos leer esta planilla'
              : 'Descartaste esta importación'}
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
