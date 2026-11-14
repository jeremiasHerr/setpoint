import type { EnListaDeEspera, InscripcionDelTorneo } from '@setpoint/shared';
import { useState, type ReactNode } from 'react';
import { Confirmacion } from '../../components/Confirmacion';
import { Numero } from '../../components/Numero';
import { textoDelError } from './errores';
import { nombreDelMedio, plata } from './texto';

type Props = {
  // A quién se da de baja. null con la confirmación cerrada.
  inscripcion: InscripcionDelTorneo | null;
  // A quién le va a tocar el lugar, para decirlo antes de confirmar. null sin lista de espera.
  primeroEnEspera: EnListaDeEspera | null;
  horasReserva: number;
  enCurso: boolean;
  error: Error | null;
  alCancelar: () => void;
  alConfirmar: (devolucion: boolean) => void;
};

// Dar de baja, en la confirmación de las acciones que no se deshacen (decisión 096).
// Si pagó, la organización elige si le corresponde la devolución: no hay opción marcada de antemano,
// porque lo decide el reglamento de cada circuito en cada caso. El sistema solo lo anota (decisión 075).
export function DarDeBaja({ inscripcion, primeroEnEspera, horasReserva, enCurso, error, alCancelar, alConfirmar }: Props) {
  // La elección es de una inscripción: al abrir la de otro, arranca sin elegir.
  const [eleccion, setEleccion] = useState<{ inscripcionId: number; devolucion: boolean } | null>(null);
  const devolucion = eleccion && eleccion.inscripcionId === inscripcion?.id ? eleccion.devolucion : null;
  const elegir = (valor: boolean) => inscripcion && setEleccion({ inscripcionId: inscripcion.id, devolucion: valor });

  const pago = inscripcion?.monto ?? 0;
  const hayQueElegir = pago > 0;

  return (
    <Confirmacion
      abierta={inscripcion !== null}
      titulo={inscripcion && `Dar de baja a ${inscripcion.nombre} ${inscripcion.apellido}`}
      consecuencias={[
        primeroEnEspera ? (
          <>
            Su lugar pasa a{' '}
            <span className="font-semibold text-negro">
              {primeroEnEspera.nombre} {primeroEnEspera.apellido}
            </span>
            , primero en la lista de espera: le llega un email y tiene <Numero>{horasReserva}</Numero> horas para pagar.
          </>
        ) : (
          'Su lugar queda libre.'
        ),
      ]}
      accion="Dar de baja"
      accionEnCurso="Dando de baja…"
      enCurso={enCurso}
      falta={hayQueElegir && devolucion === null}
      error={error && textoDelError(error)}
      alCancelar={alCancelar}
      alConfirmar={() => alConfirmar(devolucion ?? false)}
    >
      {inscripcion && hayQueElegir && (
        <>
          <p className="text-[15px] text-gris-700">
            Pagó <Numero className="text-negro">{plata(pago)}</Numero>
            {inscripcion.medio && <> por {nombreDelMedio[inscripcion.medio]}</>}. ¿Le corresponde que se lo devuelvas?
          </p>
          <div role="radiogroup" aria-label="Devolución" className="grid gap-2.5 md:grid-cols-2">
            <Opcion
              elegida={devolucion === true}
              alElegir={() => elegir(true)}
              titulo="Sí, le corresponde"
              detalle={
                <>
                  Le devolvés <Numero className="text-negro">{plata(pago)}</Numero> vos, por fuera del sistema. Queda pendiente en la
                  conciliación hasta que marques que lo hiciste.
                </>
              }
            />
            <Opcion
              elegida={devolucion === false}
              alElegir={() => elegir(false)}
              titulo="No le corresponde"
              detalle="Lo decide el reglamento de tu circuito. El pago sigue contando en la conciliación."
            />
          </div>
        </>
      )}
    </Confirmacion>
  );
}

type PropsOpcion = { elegida: boolean; alElegir: () => void; titulo: string; detalle: ReactNode };

function Opcion({ elegida, alElegir, titulo, detalle }: PropsOpcion) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={elegida}
      onClick={alElegir}
      className={`flex gap-[11px] rounded-xl bg-white p-3.5 text-left ${
        elegida ? 'border-[1.5px] border-negro' : 'border border-linea hover:border-gris-300'
      }`}
    >
      <span
        className={`mt-px flex size-[18px] shrink-0 items-center justify-center rounded-full border-[1.5px] ${
          elegida ? 'border-negro' : 'border-gris-300'
        }`}
      >
        {elegida && <span className="size-2 rounded-full bg-negro" />}
      </span>
      <span className="flex flex-col gap-1">
        <span className="text-sm font-semibold">{titulo}</span>
        <span className="text-[13px] leading-[1.45] text-gris-500">{detalle}</span>
      </span>
    </button>
  );
}
