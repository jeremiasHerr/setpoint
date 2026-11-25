import { MAXIMO_TEXTO_MENSAJES, type LecturaDeMensajes, type ResultadoLeido as Leido } from '@setpoint/shared';
import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { MensajeError } from '../components/Aviso';
import { Boton } from '../components/Boton';
import { Esqueleto } from '../components/Esqueleto';
import { Numero } from '../components/Numero';
import { Tarjeta } from '../components/Tarjeta';
import { leerSesion, type Sesion } from '../features/auth/sesion';
import { useSesionInvalida } from '../features/auth/useSesionInvalida';
import { ResultadoLeido } from '../features/mensajes/ResultadoLeido';
import { useDecidirResultado, useLectura, useLeerMensajes } from '../features/mensajes/useMensajes';
import { textoDelError } from '../features/resultados/resultado';
import { EncabezadoDelTorneo } from '../features/torneos/EncabezadoDelTorneo';
import { ErrorApi } from '../lib/api';

// F19 — Resultados desde los mensajes del grupo (06-ia.md §2, decisión 119). La organización pega
// los mensajes; lo que pasa todos los controles se carga solo, y lo dudoso espera acá, cada uno con
// su motivo. La lectura va en la URL: si se recarga, sigue donde estaba.
export function ResultadosDesdeMensajesPage() {
  const sesion = leerSesion();
  const { id } = useParams();
  if (!sesion) return <Navigate to="/ingresar" replace />;
  return <ResultadosDesdeMensajes sesion={sesion} torneoId={Number(id)} />;
}

function errorDeLectura(error: Error | null) {
  if (!error) return undefined;
  switch (error instanceof ErrorApi ? error.codigo : null) {
    case 'DATOS_INVALIDOS':
      return Object.values((error as ErrorApi).campos)[0] ?? 'Revisá el texto.';
    case 'TORNEO_SIN_PARTIDOS':
      return 'Este torneo todavía no tiene partidos: se arman al confirmar el sorteo de zonas.';
    case 'LIMITE_DE_PEDIDOS_IA':
      return 'Leíste muchos chats en poco tiempo. Esperá un rato y probá de nuevo.';
    case 'TOPE_DE_GASTO_IA':
      return 'Hoy llegaron al tope de uso de la IA. Se renueva solo en unas horas; mientras tanto podés cargar los resultados de a uno.';
    case 'SIN_CONEXION':
      return 'No hay conexión. Probá de nuevo.';
    default:
      return 'No pudimos leer los mensajes. Probá de nuevo en unos minutos.';
  }
}

function Marco({ sesion, torneoId, children }: { sesion: Sesion; torneoId: number; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-papel text-noche">
      <EncabezadoDelTorneo sesion={sesion} torneoId={torneoId} actual="resultados" />
      <div className="flex justify-center px-4 pt-6 pb-10 sm:pt-[34px] md:px-7">
        <div className="flex w-full max-w-[1240px] flex-col gap-5">
          <Link to={`/torneos/${torneoId}/resultados`} className="self-start text-sm font-medium text-pizarra-500 hover:text-noche hover:underline">
            ← Cargar de a un resultado
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}

function ResultadosDesdeMensajes({ sesion, torneoId }: { sesion: Sesion; torneoId: number }) {
  const slug = sesion.organizacion.slug;
  const [parametros, setParametros] = useSearchParams();
  const idLectura = Number(parametros.get('lectura')) || null;
  const leer = useLeerMensajes(slug, torneoId);
  const lectura = useLectura(slug, torneoId, idLectura);
  useSesionInvalida(leer.error ?? lectura.error);

  function empezarDeNuevo() {
    leer.reset();
    setParametros({});
  }

  let contenido: ReactNode;
  if (idLectura === null) {
    contenido = (
      <PegarMensajes
        enviando={leer.isPending}
        error={errorDeLectura(leer.error)}
        alLeer={(texto) => leer.mutate(texto, { onSuccess: (nueva) => setParametros({ lectura: String(nueva.id) }) })}
      />
    );
  } else if (lectura.data) {
    contenido = <Lectura slug={slug} lectura={lectura.data} alPegarMas={empezarDeNuevo} />;
  } else if (lectura.error) {
    contenido = (
      <div className="flex flex-col items-start gap-3">
        <p className="text-[15px] text-pizarra-500">No pudimos cargar esta lectura.</p>
        <Boton onClick={empezarDeNuevo}>Pegar mensajes</Boton>
      </div>
    );
  } else {
    contenido = <Esqueleto forma="pagina" />;
  }

  return (
    <Marco sesion={sesion} torneoId={torneoId}>
      {contenido}
    </Marco>
  );
}

function PegarMensajes({ enviando, error, alLeer }: { enviando: boolean; error?: string; alLeer: (texto: string) => void }) {
  const [texto, setTexto] = useState('');
  const largo = texto.trim().length;

  function enviar(evento: FormEvent) {
    evento.preventDefault();
    if (largo > 0 && largo <= MAXIMO_TEXTO_MENSAJES) alLeer(texto);
  }

  return (
    <Tarjeta className="overflow-hidden">
      <form onSubmit={enviar}>
        <div className="flex flex-col gap-2 border-b border-linea px-4 py-5 sm:px-6">
          <h1 className="text-[22px] font-display font-semibold tracking-[-0.02em]">Cargá los resultados desde los mensajes del grupo</h1>
          <p className="max-w-[68ch] text-[15px] leading-normal text-pizarra-500">
            En WhatsApp, mantené apretado un mensaje, elegí los demás y tocá Copiar. Pegalos acá: cargamos solos los
            resultados que coinciden con un partido del torneo, y los dudosos te los mostramos para que decidas.
          </p>
        </div>
        <div className="flex flex-col gap-2 px-4 py-5 sm:px-6">
          <label htmlFor="mensajes" className="text-[13px] font-semibold text-pizarra-500">
            Mensajes del grupo
          </label>
          <textarea
            id="mensajes"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={12}
            placeholder={'[20/11/26, 18:03] Diego Antileo: Perdí con Sanhueza 46 36\n[20/11/26, 18:40] Lucas Bravo: Le gané a Paz 6-4 3-6 10-8'}
            aria-invalid={largo > MAXIMO_TEXTO_MENSAJES || undefined}
            className="min-h-[220px] resize-y rounded-control border border-borde-campo px-3.5 py-3 text-sm leading-relaxed text-noche outline-none placeholder:text-pizarra-400 focus:border-2 focus:border-noche focus:px-[13px] focus:py-[11px] aria-invalid:border-2 aria-invalid:border-noche"
          />
          <p className="text-[13px] text-pizarra-500">
            {largo > MAXIMO_TEXTO_MENSAJES
              ? 'Es demasiado texto: pegá los mensajes de unos días.'
              : 'Los mensajes se mandan a un modelo de IA para leerlos. No se publican.'}
          </p>
        </div>
        <div className="flex flex-col items-stretch gap-3 border-t border-linea px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="min-w-0 sm:flex-1">
            {error ? (
              <MensajeError>{error}</MensajeError>
            ) : (
              <p className="text-sm text-pizarra-500">{enviando ? 'Leyendo los mensajes: tarda unos segundos.' : 'Todo lo que se carga se puede corregir después.'}</p>
            )}
          </div>
          <Boton type="submit" variante="organizador" className="font-semibold" disabled={enviando || largo === 0 || largo > MAXIMO_TEXTO_MENSAJES}>
            {enviando ? 'Leyendo…' : 'Leer los mensajes'}
          </Boton>
        </div>
      </form>
    </Tarjeta>
  );
}

const resultados = (n: number) => (n === 1 ? '1 resultado' : `${n} resultados`);

// "Cargamos 7 resultados. Revisá estos 2": una oración por línea.
function titulo(lectura: LecturaDeMensajes): [string, string?] {
  const solos = lectura.resultados.filter((r) => r.estado === 'cargado' && !r.cargadoAMano).length;
  const aRevisar = lectura.resultados.filter((r) => r.estado === 'a_revisar').length;
  if (lectura.resultados.length === 0) return ['No encontramos resultados en estos mensajes'];
  const revisa = aRevisar === 1 ? 'Revisá este' : `Revisá estos ${aRevisar}`;
  if (aRevisar === 0) return [solos > 0 ? `Cargamos ${resultados(solos)}` : 'No quedó nada por revisar'];
  return solos > 0 ? [`Cargamos ${resultados(solos)}.`, revisa] : [`${revisa} ${aRevisar === 1 ? 'resultado' : 'resultados'}`];
}

function Lectura({ slug, lectura, alPegarMas }: { slug: string; lectura: LecturaDeMensajes; alPegarMas: () => void }) {
  const decidir = useDecidirResultado(slug, lectura.torneoId, lectura.id);
  const [enCurso, setEnCurso] = useState<number | null>(null);

  if (lectura.estado === 'ERROR') {
    return (
      <Tarjeta className="flex max-w-[560px] flex-col gap-4 p-[22px]">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[17px] font-semibold">No pudimos leer estos mensajes</h1>
          <p className="text-[15px] leading-normal text-pizarra-500">No se cargó ningún resultado. Probá de nuevo, o cargalos de a uno.</p>
        </div>
        <Boton variante="organizador" className="self-start" onClick={alPegarMas}>
          Pegar los mensajes de nuevo
        </Boton>
      </Tarjeta>
    );
  }

  const aRevisar = lectura.resultados.filter((r) => r.estado === 'a_revisar');
  const resto = lectura.resultados.filter((r) => r.estado !== 'a_revisar');
  const conResultado = new Set(lectura.resultados.map((r) => r.mensaje)).size;
  const conversacion = lectura.mensajes - conResultado;

  const fila = (leido: Leido) => (
    <ResultadoLeido
      key={leido.n}
      torneoId={lectura.torneoId}
      consuelo={lectura.nombreCuadroConsuelo}
      leido={leido}
      decidiendo={decidir.isPending}
      error={enCurso === leido.n && decidir.error ? textoDelError(decidir.error) : undefined}
      alDecidir={(accion) => {
        setEnCurso(leido.n);
        decidir.mutate({ n: leido.n, accion });
      }}
    />
  );

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-[28px] font-display font-semibold tracking-[-0.02em] text-balance">
          {titulo(lectura).map((oracion) => (
            <span key={oracion} className="block">
              {oracion}
            </span>
          ))}
        </h1>
        <p className="text-sm text-pizarra-500">
          <Numero>{lectura.mensajes}</Numero> {lectura.mensajes === 1 ? 'mensaje leído' : 'mensajes leídos'}
          {conversacion > 0 && (
            <>
              {' '}
              · <Numero>{conversacion}</Numero> no {conversacion === 1 ? 'era un resultado' : 'eran resultados'}
            </>
          )}
        </p>
      </div>

      {aRevisar.length > 0 && (
        <section className="flex flex-col gap-2.5">
          <h2 className="text-[17px] font-semibold">
            No pudimos cargarlos solos · <Numero>{aRevisar.length}</Numero>
          </h2>
          <Tarjeta>
            <ul>{aRevisar.map(fila)}</ul>
          </Tarjeta>
        </section>
      )}

      {resto.length > 0 && (
        <section className="flex flex-col gap-2.5">
          <h2 className="text-[17px] font-semibold">
            {aRevisar.length > 0 ? 'Lo demás' : 'Lo que leímos'} · <Numero>{resto.length}</Numero>
          </h2>
          <Tarjeta>
            <ul>{resto.map(fila)}</ul>
          </Tarjeta>
        </section>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Boton onClick={alPegarMas}>Pegar más mensajes</Boton>
        <p className="text-sm text-pizarra-500">Si algo se cargó mal, corregilo desde Cargar resultado.</p>
      </div>
    </>
  );
}
