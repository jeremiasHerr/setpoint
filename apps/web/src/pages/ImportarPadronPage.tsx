import type {
  DecisionImportacion,
  FilaPropuesta,
  HojaImportada,
  Importacion,
  JugadorPadron,
  ResultadoConfirmacion,
  ResultadoDeshacer,
} from '@setpoint/shared';
import { useMemo, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { Boton } from '../components/Boton';
import { Campo } from '../components/Campo';
import { EncabezadoOrganizador } from '../components/EncabezadoOrganizador';
import { Migas } from '../components/Migas';
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
  decisionSegura,
  hojasLeidas,
  necesitaRevision,
  problemasPorFila,
  type Decisiones,
} from '../features/importacion/decisiones';
import { DeshacerImportacion } from '../features/importacion/DeshacerImportacion';
import { EstadoProcesando } from '../features/importacion/EstadoProcesando';
import { COLUMNAS, FilaImportacion, SOLO_COMPU } from '../features/importacion/FilaImportacion';
import { FormularioSubida, type Subida } from '../features/importacion/FormularioSubida';
import { LoQueSeCrea } from '../features/importacion/LoQueSeCrea';
import { PieConfirmar } from '../features/importacion/PieConfirmar';
import { ResumenImportacion } from '../features/importacion/ResumenImportacion';
import {
  useAplicarImportacion,
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
      return 'Ese archivo no es una planilla. Subí un .xlsx, .xls, .csv o un PDF, o pegá el ranking como texto.';
    case 'ARCHIVO_MUY_GRANDE':
      return 'Una de las planillas pesa más de 2 MB. ¿Seguro que es el ranking?';
    case 'DEMASIADOS_ARCHIVOS':
      return 'Subí hasta 10 archivos por vez.';
    case 'CATEGORIA_NO_ENCONTRADA':
      return 'Esa categoría ya no existe en tu circuito. Recargá la página.';
    case 'LIMITE_DE_PEDIDOS_IA':
      return 'Subiste muchas planillas en poco tiempo. Esperá un rato y probá de nuevo.';
    case 'TOPE_DE_GASTO_IA':
      return 'Hoy llegaron al tope de uso de la IA. Se renueva solo en unas horas; mientras tanto podés cargar jugadores a mano.';
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
      return 'Esta importación ya se aplicó, se confirmó o se descartó. Recargá la página.';
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
  // Lo que respondieron la confirmación y deshacer, para el mensaje final. Si se recarga, se pierde.
  const [confirmada, setConfirmada] = useState<ResultadoConfirmacion>();
  const [deshecha, setDeshecha] = useState<ResultadoDeshacer>();
  const cerrarSesion = useCerrarSesion();

  const sesionInvalida = useSesionInvalida(circuito.error ?? padron.error ?? importacion.error ?? subir.error);

  function subirPlanilla({ archivos, texto }: Subida, categoria: string | null) {
    setArchivoSubiendo(texto ? 'el texto pegado' : archivos.length === 1 ? archivos[0].name : `${archivos.length} archivos`);
    subir.mutate({ archivos, texto, categoria }, { onSuccess: (nueva) => setParametros({ id: String(nueva.id) }) });
  }

  function empezarDeNuevo() {
    subir.reset();
    setConfirmada(undefined);
    setDeshecha(undefined);
    setParametros({});
  }

  const enRevision = importacion.data?.estado === 'PROCESADO';

  let contenido;
  if (subir.isPending) {
    contenido = (
      <main className="px-4 md:px-7 pb-7">
        <EstadoProcesando archivo={archivoSubiendo} />
      </main>
    );
  } else if (id === null) {
    contenido = circuito.data ? (
      <main className="px-4 md:px-7 pb-7">
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
    contenido = importacion.data.aplicadaEn ? (
      <RevisarDudosas
        // Al aplicar cambia de modo: las decisiones arrancan de nuevo, solo para lo que quedó.
        key={`${importacion.data.id}-revisar`}
        slug={slug}
        importacion={importacion.data}
        padron={padron.data}
        alConfirmar={setConfirmada}
        alDeshacer={setDeshecha}
      />
    ) : (
      <AntesDeImportar key={importacion.data.id} slug={slug} importacion={importacion.data} alDescartar={empezarDeNuevo} />
    );
  } else {
    contenido = (
      <Final
        slug={slug}
        importacion={importacion.data}
        confirmada={confirmada}
        deshecha={deshecha}
        alDeshacer={setDeshecha}
        alSubirOtro={empezarDeNuevo}
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-papel text-noche">
      <EncabezadoOrganizador
        organizacion={circuito.data?.nombre ?? sesion.organizacion.nombre}
        titulo={['Importar planilla', 'Jugadores']}
        navegacion={navegacionOrganizador}
        activo="Jugadores"
        iniciales={iniciales(sesion.usuario.nombre)}
        alSalir={cerrarSesion}
      />

      <div className="flex flex-col gap-2 px-4 md:px-7 pt-[26px] pb-5">
        <Migas anteriores={[{ etiqueta: 'Jugadores', ruta: '/padron' }]}>Importar planilla</Migas>
        <h1 className="max-w-[24ch] text-[28px] font-display font-semibold tracking-[-0.02em] text-balance">
          {enRevision && importacion.data ? tituloDeRevision(importacion.data) : 'Importar planilla'}
        </h1>
        {enRevision && importacion.data && (
          <div className="flex items-center gap-2.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-pizarra-500" aria-hidden="true">
              <path d="M6 3h8l4 4v14H6z" />
              <path d="M14 3v4h4" />
            </svg>
            <span className="text-sm text-pizarra-500">
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

const jugadores = (n: number) => (n === 1 ? '1 jugador' : `${n} jugadores`);

// Las filas de las hojas leídas que ya se importaron, y las que quedan por decidir.
function filasDe(importacion: Importacion) {
  const filas = hojasLeidas(importacion).flatMap((h) => h.propuesta);
  return { importadas: filas.filter((f) => f.aplicada), pendientes: filas.filter(necesitaRevision) };
}

// "Importamos 74 jugadores. Revisá estos 3" (decisión 118). Antes de importar, la revisión de siempre.
function tituloDeRevision(importacion: Importacion) {
  if (!importacion.aplicadaEn) return 'Revisá la importación';
  const { importadas, pendientes } = filasDe(importacion);
  const revisa = pendientes.length === 1 ? 'Revisá este' : `Revisá estos ${pendientes.length}`;
  return importadas.length > 0 ? `Importamos ${jugadores(importadas.length)}. ${revisa}` : `${revisa} jugadores`;
}

function Cargando({ error }: { error: boolean }) {
  return (
    <div className="px-4 md:px-7">
      {error ? (
        <p className="text-[15px] text-pizarra-500">No pudimos cargar la importación. Recargá la página.</p>
      ) : (
        <Esqueleto />
      )}
    </div>
  );
}

// Cómo se nombra una hoja en la revisión: su categoría o, si no la dice, su archivo y su hoja.
const nombreDeHoja = (h: HojaImportada) => h.categoria ?? [h.archivoNombre, h.hoja].filter(Boolean).join(' · ');

function HojasConError({ importacion }: { importacion: Importacion }) {
  const conError = importacion.hojas.filter((h) => h.estado === 'ERROR');
  if (conError.length === 0) return null;
  return (
    <div className="flex flex-col gap-1.5 rounded-tarjeta border border-linea bg-papel px-[18px] py-4 text-[15px]">
      <p className="font-semibold">
        {conError.length === 1 ? 'Una planilla no se pudo leer y queda afuera' : `${conError.length} planillas no se pudieron leer y quedan afuera`}
      </p>
      {conError.map((h) => (
        <p key={h.id} className="text-sm text-pizarra-700">
          <span className="font-medium">{nombreDeHoja(h)}</span> · {h.error}
        </p>
      ))}
    </div>
  );
}

type PropsAntes = { slug: string; importacion: Importacion; alDescartar: () => void };

// La única pregunta antes de importar (decisión 118): lo que se crea en el circuito y la categoría de
// las hojas que no la dicen. Al confirmarla se importa lo seguro, y lo dudoso queda para después.
function AntesDeImportar({ slug, importacion, alDescartar }: PropsAntes) {
  const aplicar = useAplicarImportacion(slug, importacion.id);
  const descartar = useDescartarImportacion(slug, importacion.id);

  const leidas = hojasLeidas(importacion);
  const todas = leidas.flatMap((h) => h.propuesta);
  const seguras = todas.filter((f) => f.revisar === null);
  const conteos = {
    existentes: seguras.filter((f) => f.coincideCon !== null).length,
    nuevos: seguras.filter((f) => f.coincideCon === null).length,
    aRevisar: todas.length - seguras.length,
  };
  // Las hojas que no decían su categoría y no se eligió al subir: se elige acá (decisión 011).
  const sinCategoria = leidas.filter((h) => h.categoria === null);
  const [categorias, setCategorias] = useState<Record<string, string>>({});
  const falta = sinCategoria.some((h) => !categorias[h.id]?.trim());
  const unaCategoria = new Set(leidas.map((h) => h.categoria)).size === 1 ? leidas[0]?.categoria ?? null : null;
  const elegidas = sinCategoria.flatMap((h) => (categorias[h.id]?.trim() ? [categorias[h.id].trim()] : []));
  const crea = { ...importacion.crea, categorias: [...importacion.crea.categorias, ...elegidas.filter((c, i) => elegidas.indexOf(c) === i)] };
  const creaAlgo = crea.categorias.length > 0 || crea.etapas.length > 0;

  const accion =
    seguras.length > 0
      ? `${creaAlgo ? 'Crear e importar' : 'Importar'} ${jugadores(seguras.length)}`
      : creaAlgo
        ? 'Crear y revisar los jugadores'
        : 'Revisar los jugadores';

  return (
    <>
      <main className="flex flex-1 flex-col gap-5 px-4 md:px-7 pb-7">
        <ResumenImportacion conteos={conteos} categoria={unaCategoria} casilleros={casillerosLeidos(todas)} jugadores={todas.length} />

        {sinCategoria.map((h) => (
          <div key={h.id} className="flex max-w-[420px] flex-col gap-1.5">
            <Campo
              id={`importacion-categoria-${h.id}`}
              rotulo={`¿De qué categoría es ${nombreDeHoja(h)}?`}
              autoComplete="off"
              value={categorias[h.id] ?? ''}
              onChange={(e) => {
                aplicar.reset();
                setCategorias((c) => ({ ...c, [h.id]: e.target.value }));
              }}
            />
            <p className="text-sm text-pizarra-500">No la encontramos en la hoja ni en el nombre del archivo.</p>
          </div>
        ))}

        <LoQueSeCrea crea={crea} />
        <HojasConError importacion={importacion} />
      </main>

      <PieConfirmar
        titulo="Todavía no se guardó nada"
        detalle={
          conteos.aRevisar > 0
            ? `Importamos lo que coincide con la planilla. ${conteos.aRevisar === 1 ? 'El dudoso lo revisás' : `Los ${conteos.aRevisar} dudosos los revisás`} después.`
            : 'Todo coincide con la planilla: no hay nada que revisar.'
        }
        accion={accion}
        enviando={aplicar.isPending || descartar.isPending}
        falta={falta}
        error={errorDeConfirmacion(aplicar.error)}
        secundario={
          <Boton grande onClick={() => descartar.mutate(undefined, { onSuccess: alDescartar })} disabled={aplicar.isPending || descartar.isPending}>
            Descartar
          </Boton>
        }
        alConfirmar={() =>
          aplicar.mutate(
            sinCategoria.length > 0 ? { categorias: Object.fromEntries(sinCategoria.map((h) => [String(h.id), categorias[h.id].trim()])) } : {},
          )
        }
      />
    </>
  );
}

type PropsRevisar = {
  slug: string;
  importacion: Importacion;
  padron: JugadorPadron[];
  alConfirmar: (resultado: ResultadoConfirmacion) => void;
  alDeshacer: (resultado: ResultadoDeshacer) => void;
};

// Lo seguro ya está importado (decisión 118). Arriba lo que no pudimos importar solos, de todas las
// hojas, cada fila con su motivo; abajo, plegado, lo que ya se importó de cada hoja (decisión 012).
function RevisarDudosas({ slug, importacion, padron, alConfirmar, alDeshacer }: PropsRevisar) {
  const confirmar = useConfirmarImportacion(slug, importacion.id);

  const leidas = useMemo(() => hojasLeidas(importacion), [importacion]);
  const problemas = useMemo(() => new Map(leidas.map((h) => [h.id, problemasPorFila(h)])), [leidas]);
  const [decisiones, setDecisiones] = useState<Decisiones>(() => decisionesIniciales(importacion));
  const paraRevisar = useMemo(
    () => leidas.flatMap((h) => h.propuesta.filter(necesitaRevision).map((fila) => ({ hoja: h, fila }))),
    [leidas],
  );
  const [expandidas, setExpandidas] = useState(() => new Set(paraRevisar.map(({ hoja, fila }) => claveDe(hoja.id, fila.fila))));
  const [abiertas, setAbiertas] = useState(() => new Set<number>());
  const { importadas } = filasDe(importacion);

  function cambiar(decision: DecisionImportacion) {
    confirmar.reset();
    setDecisiones((d) => ({ ...d, [claveDe(decision.hoja, decision.fila)]: decision }));
  }

  const alternar = <T,>(valor: T) => (actuales: Set<T>) => {
    const nuevas = new Set(actuales);
    if (!nuevas.delete(valor)) nuevas.add(valor);
    return nuevas;
  };

  const fila = (hoja: HojaImportada, f: FilaPropuesta, etiqueta: boolean) => {
    const clave = claveDe(hoja.id, f.fila);
    return (
      <FilaImportacion
        key={clave}
        hoja={hoja.id}
        categoria={etiqueta ? nombreDeHoja(hoja) : undefined}
        fila={f}
        decision={f.aplicada ? decisionSegura(hoja.id, f) : decisiones[clave]}
        problemas={problemas.get(hoja.id)?.get(f.fila)}
        padron={padron}
        expandida={expandidas.has(clave)}
        importada={f.aplicada}
        alCambiar={cambiar}
        alExpandir={() => setExpandidas(alternar(clave))}
      />
    );
  };

  const encabezado = (ultima: string) => (
    <div className={`${COLUMNAS} h-[42px] border-b border-linea bg-niebla px-[18px] text-[12.5px] font-medium text-noche`}>
      <span>como figura en la planilla</span>
      <span className={SOLO_COMPU}>jugador del padrón</span>
      <span className={SOLO_COMPU}>casilleros</span>
      <span className="text-right">{ultima}</span>
    </div>
  );

  return (
    <>
      <main className="flex flex-1 flex-col gap-5 px-4 md:px-7 pb-7">
        <HojasConError importacion={importacion} />

        <section className="flex flex-col gap-2.5">
          <h2 className="text-[17px] font-semibold">
            No pudimos importarlos solos · <Numero>{paraRevisar.length}</Numero>
          </h2>
          <div className="overflow-x-auto rounded-tarjeta border border-linea bg-papel">
            {encabezado('qué va a pasar')}
            <ul>{paraRevisar.map(({ hoja, fila: f }) => fila(hoja, f, leidas.length > 1))}</ul>
          </div>
        </section>

        {leidas.map((h) => {
          const yaImportadas = h.propuesta.filter((f) => f.aplicada);
          if (yaImportadas.length === 0) return null;
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
                <span className="text-[13px] text-pizarra-500">
                  {h.categoria && <>{h.archivoNombre} · </>}
                  <Numero>{yaImportadas.length}</Numero> importados
                </span>
                <span className="text-sm font-medium underline">{abierta ? 'Ocultar' : 'Ver'}</span>
              </button>
              {abierta && (
                <div className="overflow-x-auto rounded-tarjeta border border-linea bg-papel">
                  {encabezado('qué pasó')}
                  <ul>{yaImportadas.map((f) => fila(h, f, false))}</ul>
                </div>
              )}
            </section>
          );
        })}
      </main>

      <PieConfirmar
        titulo={importadas.length > 0 ? `Ya importamos ${jugadores(importadas.length)}` : 'Todavía no se importó ningún jugador'}
        detalle="Si algo no quedó bien, podés deshacer la importación entera."
        accion={paraRevisar.length === 1 ? 'Confirmar 1 jugador' : `Confirmar los ${paraRevisar.length}`}
        enviando={confirmar.isPending}
        error={errorDeConfirmacion(confirmar.error)}
        secundario={<DeshacerImportacion slug={slug} id={importacion.id} grande alDeshacer={alDeshacer} />}
        alConfirmar={() => confirmar.mutate({ decisiones: Object.values(decisiones) }, { onSuccess: alConfirmar })}
      />
    </>
  );
}

type PropsFinal = {
  slug: string;
  importacion: Importacion;
  confirmada?: ResultadoConfirmacion;
  deshecha?: ResultadoDeshacer;
  alDeshacer: (resultado: ResultadoDeshacer) => void;
  alSubirOtro: () => void;
};

// "3 casilleros", "1 jugador", con el número en Geist Mono.
function cuantos(n: number, uno: string, varios: string) {
  return (
    <>
      <Numero>{n}</Numero> {n === 1 ? uno : varios}
    </>
  );
}

// "2 altas y 1 que ya estaba": solo lo que pasó, sin ceros.
function loQueDecidiste({ creados, vinculados, excluidos }: ResultadoConfirmacion) {
  const partes = [
    creados > 0 && cuantos(creados, 'alta', 'altas'),
    vinculados > 0 && cuantos(vinculados, 'que ya estaba en el padrón', 'que ya estaban en el padrón'),
    excluidos > 0 && cuantos(excluidos, 'que quedó afuera', 'que quedaron afuera'),
  ].filter((p) => p !== false);
  if (partes.length === 0) return 'ninguno';
  return partes.map((p, i) => (
    <span key={i}>
      {i > 0 && (i === partes.length - 1 ? ' y ' : ', ')}
      {p}
    </span>
  ));
}

// Cómo terminó: confirmada, deshecha, descartada o con error. Si terminó en error, el motivo.
function Final({ slug, importacion, confirmada, deshecha, alDeshacer, alSubirOtro }: PropsFinal) {
  const descartar = useDescartarImportacion(slug, importacion.id);

  if (importacion.estado === 'CONFIRMADO') {
    const solas = hojasLeidas(importacion)
      .flatMap((h) => h.propuesta)
      .filter((f) => f.revisar === null).length;
    return (
      <main className="px-4 md:px-7 pb-7">
        <Tarjeta className="flex max-w-[560px] flex-col gap-4 p-[22px]">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-[17px] font-semibold">Listo, el padrón quedó actualizado</h2>
            <p className="text-[15px] leading-normal text-pizarra-500">
              Importamos <Numero>{solas}</Numero> {solas === 1 ? 'jugador' : 'jugadores'} sin preguntarte, porque
              coincidían con la planilla
              {confirmada && <>. De los que revisaste, {loQueDecidiste(confirmada)}</>}. Los puntos ya cuentan para el
              ranking.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link
              to="/padron"
              className="inline-flex h-10 items-center rounded-control bg-noche px-4 text-[15px] font-medium text-white"
            >
              Ver el padrón
            </Link>
            <Boton onClick={alSubirOtro}>Importar otra planilla</Boton>
            <DeshacerImportacion slug={slug} id={importacion.id} alDeshacer={alDeshacer} />
          </div>
        </Tarjeta>
      </main>
    );
  }

  if (importacion.deshechaEn) {
    return (
      <main className="px-4 md:px-7 pb-7">
        <Tarjeta className="flex max-w-[560px] flex-col gap-4 p-[22px]">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-[17px] font-semibold">Deshiciste esta importación</h2>
            <p className="text-[15px] leading-normal text-pizarra-500">
              {deshecha ? (
                <>
                  Se borraron {cuantos(deshecha.movimientosBorrados, 'casillero', 'casilleros')} y{' '}
                  {cuantos(deshecha.jugadoresBorrados, 'jugador', 'jugadores')} que había dado de alta.
                  {deshecha.jugadoresQueQuedan > 0 && (
                    <>
                      {' '}
                      {deshecha.jugadoresQueQuedan === 1 ? (
                        'Uno sigue en el padrón porque ya tiene actividad: si sobra, dalo de baja desde ahí.'
                      ) : (
                        <>
                          <Numero>{deshecha.jugadoresQueQuedan}</Numero> siguen en el padrón porque ya tienen
                          actividad: si sobran, dalos de baja desde ahí.
                        </>
                      )}
                    </>
                  )}
                </>
              ) : (
                'Se borraron sus puntos y los jugadores que había dado de alta.'
              )}
            </p>
          </div>
          <Boton variante="organizador" className="self-start" onClick={alSubirOtro}>
            Subir otro archivo
          </Boton>
        </Tarjeta>
      </main>
    );
  }

  const esError = importacion.estado === 'ERROR';
  return (
    <main className="px-4 md:px-7 pb-7">
      <Tarjeta className="flex max-w-[560px] flex-col gap-4 p-[22px]">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-[17px] font-semibold">
            {esError
              ? importacion.hojas.length > 1
                ? 'No pudimos leer ninguna de las planillas'
                : 'No pudimos leer esta planilla'
              : 'Descartaste esta importación'}
          </h2>
          <p className="text-[15px] leading-normal text-pizarra-500">
            {esError ? importacion.error : 'No se guardó nada. Podés subir la planilla de nuevo cuando quieras.'}
          </p>
          {esError && (
            <p className="text-[13px] text-pizarra-500">{importacion.archivoNombre}</p>
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
