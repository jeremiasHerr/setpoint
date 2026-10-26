import type { LinkPersonal, TorneoPublico } from '@setpoint/shared';
import { useState } from 'react';
import { Numero } from '../../components/Numero';
import { Aviso, AvisoReserva, Ayuda, BotonPrincipal, Consentimiento, Titulo } from '../inscripcion/piezas';
import { mensajeReserva } from '../inscripcion/mensajeReserva';
import { useReservar } from '../inscripcion/useInscripcion';
import { diaLargo, importe, lugaresLibres } from '../torneo-publico/convocatoria';

type Props = {
  link: LinkPersonal;
  codigo: string;
  token: string;
  // El perfil ya es de esta cuenta: no hay nada que vincular ni que consentir de nuevo.
  propio: boolean;
  onReservado: (inscripcionId: number) => void;
};

// Paso 3 de link-personal.html: las ediciones de su categoría con la inscripción abierta. El perfil
// ya lo eligió la organización, así que se reserva directo (decisión 050).
export function ElegirTorneo({ link, codigo, token, propio, onReservado }: Props) {
  // Arranca en la primera con lugares: una completa no se puede pagar.
  const [elegidoId, setElegidoId] = useState((link.torneos.find((t) => lugaresLibres(t) > 0) ?? link.torneos[0])?.id);
  const elegido = link.torneos.find((t) => t.id === elegidoId);
  const reservar = useReservar(link.organizacion.slug, String(elegidoId ?? ''), token);
  const categoria = link.jugador.categoria ?? 'tu categoría';

  if (!elegido) {
    return (
      <div className="flex flex-col gap-2">
        <Titulo>No hay inscripciones abiertas</Titulo>
        <Ayuda>Cuando se abra una inscripción de {categoria}, este mismo link te sirve.</Ayuda>
      </div>
    );
  }

  const libres = lugaresLibres(elegido);
  const pagar = () =>
    reservar.mutate(
      { jugadorId: link.jugador.id, vinculaPor: propio ? undefined : 'link_personal', codigoLink: propio ? undefined : codigo },
      { onSuccess: (reserva) => onReservado(reserva.inscripcionId) },
    );

  return (
    <>
      <Titulo>Con la inscripción abierta</Titulo>
      {link.torneos.length === 1 ? (
        <Tarjeta torneo={elegido} />
      ) : (
        <ul className="flex flex-col gap-2.5">
          {link.torneos.map((torneo) => (
            <li key={torneo.id}>
              <Opcion
                torneo={torneo}
                elegido={torneo.id === elegidoId}
                onElegir={() => {
                  reservar.reset();
                  setElegidoId(torneo.id);
                }}
              />
            </li>
          ))}
        </ul>
      )}
      <Ayuda>Cuando se abra otra inscripción de {categoria}, este mismo link te sirve.</Ayuda>

      <div className="mt-auto flex flex-col gap-3">
        {libres === 0 ? (
          <p className="rounded-[12px] bg-fondo px-4 py-3.5 text-[15px] leading-[1.42] text-gris-700">
            El cupo está completo. Si se libera un lugar, la organización lo avisa en el grupo.
          </p>
        ) : (
          <>
            {!propio && <Consentimiento organizacion={link.organizacion.nombre} />}
            <Aviso mensaje={mensajeReserva(reservar.error)} />
            <BotonPrincipal onClick={pagar} disabled={reservar.isPending}>
              {reservar.isPending ? 'Reservando…' : 'Ir a pagar con MercadoPago'}
            </BotonPrincipal>
            <AvisoReserva minutos={elegido.minutosReserva} />
          </>
        )}
      </div>
    </>
  );
}

function Tarjeta({ torneo }: { torneo: TorneoPublico }) {
  const libres = lugaresLibres(torneo);
  return (
    <section className="flex flex-col gap-4 rounded-superficie bg-negro p-5">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-[26px] leading-[1.1] font-semibold tracking-[-0.03em] text-white">{torneo.nombre}</h2>
        <p className="text-[15px] text-gris-400">
          {torneo.categoria}
          {torneo.cierreInscripcion && <> · cierra el {diaLargo(torneo.cierreInscripcion)}</>}
        </p>
      </div>
      <div className="flex flex-col gap-[9px]">
        <div className="flex justify-between gap-3">
          <span className="text-[15px] text-gris-400">Lugares</span>
          <Numero className="text-[15px] text-white">
            {torneo.ocupados} de {torneo.cupo}
          </Numero>
        </div>
        {/* La barra de marcas del cupo, en una sola franja (design.md §6). */}
        <div className="flex gap-[3px]">
          {torneo.ocupados > 0 && <div className="h-2 rounded-[2px] bg-lima" style={{ flexGrow: torneo.ocupados }} />}
          {libres > 0 && <div className="h-2 rounded-[2px] bg-borde-oscuro" style={{ flexGrow: libres }} />}
        </div>
      </div>
      <div className="h-px bg-borde-oscuro" />
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[15px] text-gris-400">Inscripción</span>
        <Numero className="text-[22px] font-medium tracking-[-0.02em] text-white">{importe(torneo.precio)}</Numero>
      </div>
    </section>
  );
}

// Con dos ediciones abiertas a la vez, se elige una antes de pagar.
function Opcion({ torneo, elegido, onElegir }: { torneo: TorneoPublico; elegido: boolean; onElegir: () => void }) {
  const libres = lugaresLibres(torneo);
  return (
    <button
      type="button"
      onClick={onElegir}
      aria-pressed={elegido}
      className={`flex w-full flex-col gap-1.5 rounded-tarjeta p-4 text-left ${elegido ? 'border-2 border-negro p-[15px]' : 'border border-linea hover:bg-fondo'}`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[17px] font-semibold">{torneo.nombre}</span>
        <Numero className="text-[17px] font-medium">{importe(torneo.precio)}</Numero>
      </div>
      <span className="text-[15px] text-gris-500">
        {torneo.cierreInscripcion ? `Cierra el ${diaLargo(torneo.cierreInscripcion)}` : torneo.categoria} ·{' '}
        {libres === 0 ? (
          'sin lugares'
        ) : (
          <>
            <Numero>{libres}</Numero> {libres === 1 ? 'lugar' : 'lugares'}
          </>
        )}
      </span>
    </button>
  );
}
