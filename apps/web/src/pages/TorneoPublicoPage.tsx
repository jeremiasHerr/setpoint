import type { TorneoPublico } from '@setpoint/shared';
import { Link, useParams } from 'react-router-dom';
import { EncabezadoPublico } from '../components/EncabezadoPublico';
import { Numero } from '../components/Numero';
import { diaLargo, formato, importe, lugaresLibres } from '../features/torneo-publico/convocatoria';
import { useTorneoPublico } from '../features/torneo-publico/useTorneoPublico';
import { ErrorApi } from '../lib/api';

function mensajeDeError(error: Error) {
  if (error instanceof ErrorApi && error.codigo === 'TORNEO_NO_ENCONTRADO') return 'No encontramos ese torneo. Revisá el enlace.';
  if (error instanceof ErrorApi && error.codigo === 'SIN_CONEXION') return 'No pudimos conectarnos. Revisá tu conexión y probá de nuevo.';
  return 'No pudimos cargar el torneo. Probá de nuevo en unos minutos.';
}

// La convocatoria que hoy se manda por WhatsApp, hecha página: lo que abre el link del torneo,
// sin cuenta y sin instalar nada (F12, docs/pantallas/jugador/el-torneo.html).
export function TorneoPublicoPage() {
  const { slug = '', id = '' } = useParams();
  const torneo = useTorneoPublico(slug, id);

  return (
    <main className="mx-auto flex min-h-screen max-w-[480px] flex-col gap-5 px-4 pt-5 pb-7">
      {torneo.isPending && <p className="text-[15px] text-gris-500">Cargando el torneo…</p>}
      {torneo.error && <p className="text-[15px] text-gris-700">{mensajeDeError(torneo.error)}</p>}
      {torneo.data && <Convocatoria torneo={torneo.data} />}
    </main>
  );
}

function Convocatoria({ torneo }: { torneo: TorneoPublico }) {
  const abierta = torneo.inscripcion === 'abierta';
  const libres = lugaresLibres(torneo);

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <EncabezadoPublico organizacion={torneo.organizacion.nombre} />
        <Numero className="rounded-full border border-linea px-2.5 py-1.5 text-[14px] font-medium text-gris-500">
          {torneo.categoria}
        </Numero>
      </div>

      <section className="flex flex-col gap-[18px] rounded-superficie bg-negro px-5 py-[22px]">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className={`size-[7px] rounded-full ${abierta ? 'bg-lima' : 'bg-gris-500'}`} />
            <p className={`text-[15px] font-medium ${abierta ? 'text-lima' : 'text-gris-400'}`}>
              {abierta ? 'Inscripción abierta' : 'Inscripción cerrada'}
            </p>
          </div>
          <h1 className="text-[32px] leading-[1.08] font-semibold tracking-[-0.032em] text-white">{torneo.nombre}</h1>
        </div>

        <div className="h-px bg-borde-oscuro" />

        <dl className="flex flex-col gap-[13px]">
          {torneo.cierreInscripcion && (
            <Dato rotulo={abierta ? 'Cierra' : 'Cerró'} valor={diaLargo(torneo.cierreInscripcion)} />
          )}
          {torneo.fechaInicio && <Dato rotulo="Arranca" valor={diaLargo(torneo.fechaInicio)} />}
          <Dato rotulo="Formato" valor={formato(torneo)} />
        </dl>

        <div className="flex flex-col gap-[9px]">
          <Dato rotulo={abierta ? 'Lugares' : 'Inscriptos'} valor={`${torneo.ocupados} de ${torneo.cupo}`} />
          {/* La barra de marcas del cupo, en una sola franja (design.md §6). */}
          <div className="flex gap-[3px]">
            {torneo.ocupados > 0 && (
              <div className={`h-2 rounded-[2px] ${abierta ? 'bg-lima' : 'bg-gris-400'}`} style={{ flexGrow: torneo.ocupados }} />
            )}
            {libres > 0 && <div className="h-2 rounded-[2px] bg-borde-oscuro" style={{ flexGrow: libres }} />}
          </div>
          {abierta && (
            <p className="text-[15px] text-gris-400">
              {libres === 0
                ? 'No quedan lugares.'
                : `${libres === 1 ? 'Queda 1 lugar' : `Quedan ${libres} lugares`}. Se asignan por orden de pago.`}
            </p>
          )}
        </div>
      </section>

      {torneo.descripcion && (
        <section className="flex flex-col gap-[13px] rounded-[16px] border border-linea p-[18px]">
          <h2 className="text-base font-semibold">Sobre el torneo</h2>
          <p className="text-base leading-[1.45] whitespace-pre-line">{torneo.descripcion}</p>
        </section>
      )}

      {abierta ? (
        <div className="mt-auto flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3 px-1">
            <p className="text-base text-gris-500">Inscripción</p>
            <Numero className="text-[26px] font-medium tracking-[-0.02em]">{importe(torneo.precio)}</Numero>
          </div>
          {libres > 0 ? (
            <Link
              to={`/c/${torneo.organizacion.slug}/torneos/${torneo.id}/inscripcion`}
              className="flex h-[60px] items-center justify-center rounded-[12px] bg-lima text-lg font-semibold"
            >
              Inscribirme y pagar
            </Link>
          ) : (
            <p className="rounded-[12px] bg-fondo px-4 py-3.5 text-[15px] leading-[1.42] text-gris-700">
              El cupo está completo. Si se libera un lugar, la organización lo avisa en el grupo.
            </p>
          )}
          <p className="px-1 text-[15px] leading-[1.42] text-gris-500">
            Te inscribís con tu email: te mandamos un código para confirmarlo. No hay registro ni contraseña.
          </p>
        </div>
      ) : (
        <p className="rounded-[12px] bg-fondo px-4 py-3.5 text-[15px] leading-[1.42] text-gris-700">
          Ya no se puede inscribir nadie. Después del sorteo, las zonas, los cuadros y los resultados se pueden mirar sin cuenta.
        </p>
      )}
    </>
  );
}

function Dato({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-[15px] text-gris-400">{rotulo}</dt>
      <dd>
        <Numero className="text-[15px] text-white">{valor}</Numero>
      </dd>
    </div>
  );
}
