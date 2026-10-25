import type { CasoReclamo as Caso, InscripcionEnRevision, ResolverRevision } from '@setpoint/shared';
import { useState, type ReactNode } from 'react';
import { Boton } from '../../components/Boton';
import { Numero } from '../../components/Numero';
import { importe } from '../torneo-publico/convocatoria';
import { Dato, OtraSalida, Planteo, Rotulo } from './piezas';
import { COMO_SE_VINCULO, diaCorto, diaYHoraCorta } from './textos';

type Props = {
  caso: Caso;
  enviando: boolean;
  alResolver: (datos: ResolverRevision) => void;
};

function listaDeInscripciones(inscripciones: InscripcionEnRevision[]) {
  if (inscripciones.length === 0) return 'ninguna';
  return inscripciones.map((i) => `${i.torneo} · ${i.estado === 'pagada' ? 'pagada' : 'reservando'}`).join(', ');
}

// Estado 2: perfil reclamado por otra cuenta. Las dos cuentas lado a lado; la organización decide de
// quién es el perfil, y los emails de cada uno no cambian.
export function CasoReclamo({ caso, enviando, alResolver }: Props) {
  const [inscripciones, setInscripciones] = useState<'quedan' | 'baja'>('quedan');
  const { perfil, titular, reclamante } = caso;
  const nombre = `${perfil.nombre} ${perfil.apellido}`;
  const pagadas = titular.inscripciones.filter((i) => i.estado === 'pagada');

  return (
    <>
      <Planteo titulo={`Otra cuenta dice que el perfil de ${nombre} es suyo.`}>
        <p className="-mt-2.5 text-[15px] leading-normal text-gris-500">
          El perfil está vinculado a {titular.email}. Lo reclama {reclamante.email || 'una cuenta que ya no existe'}, que verificó
          su email. Vos decidís de quién es el perfil; los emails de cada uno no cambian.
        </p>
      </Planteo>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="flex flex-col gap-4 rounded-tarjeta border border-linea p-5">
          <div className="flex min-w-0 flex-col gap-1">
            <Rotulo>tiene el perfil</Rotulo>
            <h3 className="truncate text-lg font-semibold tracking-[-0.02em]">{titular.email}</h3>
          </div>
          <div className="flex flex-col gap-[9px]">
            <Dato rotulo="Vinculado">
              {titular.vinculadoEn && <Numero>{diaCorto(titular.vinculadoEn)}</Numero>}
              {titular.vinculadoPor && `, ${COMO_SE_VINCULO[titular.vinculadoPor]}`}
            </Dato>
            <Dato rotulo="Inscripciones con este perfil">{listaDeInscripciones(titular.inscripciones)}</Dato>
          </div>
          <Boton className="mt-auto" disabled={enviando} onClick={() => alResolver({ accion: 'dejar' })}>
            Es de esta cuenta: dejarlo así
          </Boton>
        </section>

        <section className="flex flex-col gap-4 rounded-tarjeta border-2 border-negro p-[19px]">
          <div className="flex min-w-0 flex-col gap-1">
            <Rotulo>lo reclama</Rotulo>
            <h3 className="truncate text-lg font-semibold tracking-[-0.02em]">{reclamante.email || '—'}</h3>
          </div>
          <div className="flex flex-col gap-[9px]">
            <Dato rotulo="Reclamó">{reclamante.reclamadoEn && <Numero>{diaYHoraCorta(reclamante.reclamadoEn)}</Numero>}</Dato>
            <Dato rotulo="Otro perfil en el circuito">{reclamante.otroPerfil ?? 'ninguno'}</Dato>
          </div>
          <Boton
            variante="organizador"
            className="mt-auto"
            disabled={enviando || !reclamante.email || reclamante.otroPerfil !== null}
            onClick={() => alResolver({ accion: 'pasar_perfil', inscripciones })}
          >
            Es de esta cuenta: pasarle el perfil
          </Boton>
          {reclamante.otroPerfil && (
            <p className="text-[13px] leading-[1.45] text-gris-500">
              Una cuenta tiene un solo perfil por circuito. Para pasarle este, primero desvinculá el otro desde el padrón.
            </p>
          )}
        </section>
      </div>

      {pagadas.length > 0 && (
        <section className="flex flex-col gap-3 rounded-tarjeta border border-linea px-5 py-[18px]">
          <div className="flex flex-col gap-1">
            <h3 className="text-[15px] font-semibold">
              Si le pasás el perfil: ¿qué hace{pagadas.length === 1 ? ` la inscripción a ${pagadas[0].torneo}` : 'n sus inscripciones'}?
            </h3>
            <p className="text-sm text-gris-500">
              {pagadas.length === 1 ? (
                <>
                  La pagó {titular.email} (inscripción <Numero>{pagadas[0].id}</Numero>, <Numero>{importe(pagadas[0].monto)}</Numero>).
                </>
              ) : (
                `Las pagó ${titular.email}.`
              )}
            </p>
          </div>
          <div role="radiogroup" className="grid gap-2.5 sm:grid-cols-2">
            <Opcion elegida={inscripciones === 'quedan'} onElegir={() => setInscripciones('quedan')} titulo="Queda en el perfil">
              {nombre} sigue inscripto
            </Opcion>
            <Opcion elegida={inscripciones === 'baja'} onElegir={() => setInscripciones('baja')} titulo="Se da de baja">
              La devolución, por fuera del sistema
            </Opcion>
          </div>
        </section>
      )}

      <OtraSalida
        titulo="No sabés de quién es"
        accion={
          <Boton disabled={enviando} onClick={() => alResolver({ accion: 'desvincular' })}>
            Desvincular y compartir el link
          </Boton>
        }
      >
        El perfil queda libre. Mandale el link personal al dueño por WhatsApp: con eso queda vinculado sin buscarse.
      </OtraSalida>
    </>
  );
}

function Opcion({ elegida, onElegir, titulo, children }: { elegida: boolean; onElegir: () => void; titulo: string; children: ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={elegida}
      onClick={onElegir}
      className={`flex items-start gap-[11px] rounded-[12px] text-left ${elegida ? 'border-2 border-negro px-3.5 py-3' : 'border border-linea px-[15px] py-[13px] hover:bg-fondo'}`}
    >
      <span className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2 ${elegida ? 'border-negro' : 'border-gris-300'}`}>
        {elegida && <span className="size-2 rounded-full bg-negro" />}
      </span>
      <span className="flex flex-col gap-[3px]">
        <span className="text-sm font-semibold">{titulo}</span>
        <span className="text-[13px] leading-[1.4] text-gris-500">{children}</span>
      </span>
    </button>
  );
}
