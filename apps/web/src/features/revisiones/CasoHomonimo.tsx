import type { CasoHomonimo as Caso, PerfilEnRevision, ResolverRevision } from '@setpoint/shared';
import { Boton } from '../../components/Boton';
import { Numero } from '../../components/Numero';
import { importe } from '../torneo-publico/convocatoria';
import { Cifra, Dato, OtraSalida, Planteo, Rotulo } from './piezas';
import { COMO_SE_VINCULO, desde, diaYHoraCorta } from './textos';

type Props = {
  caso: Caso;
  enviando: boolean;
  alResolver: (datos: ResolverRevision) => void;
};

function nombre(p: { nombre: string; apellido: string }) {
  return `${p.nombre} ${p.apellido}`;
}

// Estado 1: posible homónimo. La inscripción ya está pagada y sigue en pie: se decide a qué perfil va.
export function CasoHomonimo({ caso, enviando, alResolver }: Props) {
  const { elegido, inscripcion } = caso;
  const categoria = elegido.categoria ?? 'la categoría';

  return (
    <>
      <Planteo
        titulo={`${caso.cuenta} se vinculó a ${nombre(elegido)}. ${
          caso.otros.length === 1 ? 'Hay otro jugador con el mismo nombre' : 'Hay otros jugadores con un nombre parecido'
        } en ${categoria}.`}
      >
        <p className="-mt-2.5 text-[15px] leading-normal text-gris-500">
          La inscripción ya está pagada y sigue en pie. Lo que decidís es a qué perfil va, y con ella la cuenta y los puntos que
          gane en este torneo.
        </p>
        <dl className="grid gap-4 rounded-[12px] border border-linea bg-fondo-tabla px-[18px] py-3.5 sm:grid-cols-[minmax(0,1fr)_150px_150px_170px]">
          <div className="flex min-w-0 flex-col gap-[5px]">
            <Rotulo>cuenta</Rotulo>
            <span className="truncate text-[15px]">{caso.cuenta}</span>
          </div>
          <div className="flex flex-col gap-[5px]">
            <Rotulo>cómo se vinculó</Rotulo>
            <span className="text-[15px]">{caso.vinculadoPor ? COMO_SE_VINCULO[caso.vinculadoPor] : '—'}</span>
          </div>
          {inscripcion && (
            <>
              <div className="flex flex-col gap-[5px]">
                <Rotulo>inscripción</Rotulo>
                <Numero className="text-[15px]">
                  {inscripcion.id} · {importe(inscripcion.monto)}
                </Numero>
              </div>
              <div className="flex flex-col gap-[5px]">
                <Rotulo>pagó</Rotulo>
                <Numero className="text-[15px]">{inscripcion.pagadoEn ? diaYHoraCorta(inscripcion.pagadoEn) : '—'}</Numero>
              </div>
            </>
          )}
        </dl>
      </Planteo>

      <div className="grid gap-4 md:grid-cols-2">
        <Perfil perfil={elegido} eligio>
          <Boton variante="organizador" disabled={enviando} onClick={() => alResolver({ accion: 'confirmar' })}>
            Es este: confirmar
          </Boton>
        </Perfil>
        {caso.otros.map((otro) => (
          <Perfil key={otro.jugadorId} perfil={otro}>
            <Boton
              disabled={enviando || otro.cuenta !== null}
              onClick={() => alResolver({ accion: 'pasar_inscripcion', aJugadorId: otro.jugadorId })}
            >
              {otro.cuenta ? 'Ya tiene otra cuenta' : 'Es este otro: pasar la inscripción'}
            </Boton>
          </Perfil>
        ))}
      </div>

      <OtraSalida
        titulo="No es ninguno"
        accion={
          <Boton disabled={enviando} onClick={() => alResolver({ accion: 'alta_nuevo' })}>
            Darlo de alta como jugador nuevo
          </Boton>
        }
      >
        Se crea un jugador nuevo en {categoria}, con <Numero>0</Numero> puntos, y la inscripción y la cuenta pasan a él.
      </OtraSalida>

      <p className="text-sm leading-normal text-gris-500">
        Si pasás la inscripción a otro perfil, la cuenta va con ella, y el {nombre(elegido)} {desde(elegido.desde)} vuelve a
        quedar sin vincular.
      </p>
    </>
  );
}

function Perfil({ perfil, eligio = false, children }: { perfil: PerfilEnRevision; eligio?: boolean; children: React.ReactNode }) {
  return (
    <section className={`flex flex-col gap-4 rounded-tarjeta p-5 ${eligio ? 'border-2 border-negro p-[19px]' : 'border border-linea'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-semibold tracking-[-0.02em]">{nombre(perfil)}</h3>
          <span className="font-mono text-[13px] text-gris-500">
            {(perfil.categoria ?? 'sin categoría').toLowerCase()} · {desde(perfil.desde)}
          </span>
        </div>
        {eligio && <span className="rounded-full bg-negro px-[9px] py-1 font-mono text-[11px] whitespace-nowrap text-white">eligió este</span>}
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        <Cifra rotulo="partidos" valor={perfil.partidos} />
        <Cifra rotulo="puntos" valor={perfil.puntos} />
        <Cifra rotulo="puesto" valor={perfil.puesto && perfil.puntos > 0 ? `${perfil.puesto}º` : '—'} />
      </div>
      <div className="flex flex-col gap-[9px]">
        <Dato rotulo="Teléfono">{perfil.telefono ? <Numero>{perfil.telefono}</Numero> : 'sin cargar'}</Dato>
        <Dato rotulo="Cuenta">{eligio ? 'la de esta inscripción' : (perfil.cuenta ?? 'ninguna')}</Dato>
      </div>
      <div className="mt-auto flex flex-col">{children}</div>
    </section>
  );
}
