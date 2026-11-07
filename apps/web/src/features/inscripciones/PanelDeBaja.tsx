import type { EnListaDeEspera, InscripcionDelTorneo } from '@setpoint/shared';
import { useState, type ReactNode } from 'react';
import { Numero } from '../../components/Numero';
import { BotonAccion } from './BotonAccion';
import { nombreDelMedio, plata } from './texto';

type Props = {
  inscripcion: InscripcionDelTorneo;
  // A quién le va a tocar el lugar, para decirlo antes de confirmar. null sin lista de espera.
  primeroEnEspera: EnListaDeEspera | null;
  horasReserva: number;
  enCurso: boolean;
  alCancelar: () => void;
  alConfirmar: (devolucion: boolean) => void;
};

// Dar de baja, abierto debajo de la fila (estado 3 de docs/pantallas/organizador/inscripciones.html).
// Si pagó, la organización elige si le corresponde la devolución: no hay opción marcada de antemano,
// porque lo decide el reglamento de cada circuito en cada caso. El sistema solo lo anota (decisión 075).
export function PanelDeBaja({ inscripcion, primeroEnEspera, horasReserva, enCurso, alCancelar, alConfirmar }: Props) {
  const [devolucion, setDevolucion] = useState<boolean | null>(null);
  const pago = inscripcion.monto ?? 0;
  const hayQueElegir = pago > 0;
  const nombre = `${inscripcion.nombre} ${inscripcion.apellido}`;

  return (
    <div className="flex flex-col gap-4 border-b border-linea bg-fondo-tabla px-[18px] pt-[18px] pb-5">
      <div className="flex flex-col gap-1">
        <p className="text-base font-semibold">Dar de baja a {nombre}</p>
        {hayQueElegir && (
          <p className="text-sm text-gris-500">
            Pagó <Numero className="text-negro">{plata(pago)}</Numero>
            {inscripcion.medio && <> por {nombreDelMedio[inscripcion.medio]}</>}. ¿Le corresponde que se lo devuelvas?
          </p>
        )}
      </div>

      {hayQueElegir && (
        <div role="radiogroup" aria-label="Devolución" className="grid gap-2.5 md:grid-cols-2">
          <Opcion
            elegida={devolucion === true}
            alElegir={() => setDevolucion(true)}
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
            alElegir={() => setDevolucion(false)}
            titulo="No le corresponde"
            detalle="Lo decide el reglamento de tu circuito. El pago sigue contando en la conciliación."
          />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="flex min-w-0 flex-1 items-start gap-[9px] text-sm leading-[1.45] text-gris-700">
          <span className="mt-1.5 size-[7px] shrink-0 rounded-full bg-lima" />
          {primeroEnEspera ? (
            <span>
              Su lugar pasa a{' '}
              <span className="font-semibold text-negro">
                {primeroEnEspera.nombre} {primeroEnEspera.apellido}
              </span>
              , primero en la lista de espera: le llega un email y tiene <Numero>{horasReserva}</Numero> horas para pagar.
            </span>
          ) : (
            <span>Su lugar queda libre.</span>
          )}
        </p>
        <div className="flex shrink-0 gap-2">
          <BotonAccion onClick={alCancelar} disabled={enCurso} className="h-9 px-3.5 text-sm">
            Cancelar
          </BotonAccion>
          <BotonAccion
            principal
            onClick={() => alConfirmar(devolucion ?? false)}
            disabled={enCurso || (hayQueElegir && devolucion === null)}
            className="h-9 px-3.5 text-sm"
          >
            {enCurso ? 'Dando de baja…' : 'Dar de baja'}
          </BotonAccion>
        </div>
      </div>
    </div>
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
