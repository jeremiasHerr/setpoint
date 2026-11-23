import type { LinkPersonal, TorneoPublico } from '@setpoint/shared';
import { useState } from 'react';
import { Numero } from '../../components/Numero';
import { Aviso, AvisoLista, AvisoReserva, Ayuda, BotonPrincipal, Consentimiento, Titulo } from '../inscripcion/piezas';
import { mensajeReserva } from '../inscripcion/mensajeReserva';
import { useAnotarEnListaDeEspera, useReservar } from '../inscripcion/useInscripcion';
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
// ya lo eligió la organización, así que se reserva directo (decisión 050). Con el cupo lleno, se anota
// en la lista de espera por el mismo camino, como desde el link del torneo (decisión 081).
export function ElegirTorneo({ link, codigo, token, propio, onReservado }: Props) {
  // Arranca en la primera con lugares: una completa no se puede pagar.
  const [elegidoId, setElegidoId] = useState((link.torneos.find((t) => lugaresLibres(t) > 0) ?? link.torneos[0])?.id);
  const elegido = link.torneos.find((t) => t.id === elegidoId);
  const reservar = useReservar(link.organizacion.slug, String(elegidoId ?? ''), token);
  const anotar = useAnotarEnListaDeEspera(link.organizacion.slug, String(elegidoId ?? ''), token);
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
  // La lista de espera, si no quedan lugares y el torneo tiene.
  const lista = libres === 0 ? elegido.listaDeEspera : null;
  const enCurso = reservar.isPending || anotar.isPending;
  const seguir = () => {
    const datos = { jugadorId: link.jugador.id, vinculaPor: propio ? undefined : ('link_personal' as const), codigoLink: propio ? undefined : codigo };
    const alTerminar = { onSuccess: ({ inscripcionId }: { inscripcionId: number }) => onReservado(inscripcionId) };
    if (lista) anotar.mutate(datos, alTerminar);
    else reservar.mutate(datos, alTerminar);
  };

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
                  anotar.reset();
                  setElegidoId(torneo.id);
                }}
              />
            </li>
          ))}
        </ul>
      )}
      <Ayuda>Cuando se abra otra inscripción de {categoria}, este mismo link te sirve.</Ayuda>

      <div className="mt-auto flex flex-col gap-3">
        {libres === 0 && !lista ? (
          <p className="rounded-[12px] bg-niebla px-4 py-3.5 text-[15px] leading-[1.42] text-pizarra-700">
            El cupo está completo y este torneo no tiene lista de espera.
          </p>
        ) : (
          <>
            {!propio && <Consentimiento organizacion={link.organizacion.nombre} al={lista ? 'Al anotarte' : undefined} />}
            <Aviso mensaje={mensajeReserva(reservar.error ?? anotar.error)} />
            <BotonPrincipal onClick={seguir} disabled={enCurso}>
              {lista
                ? enCurso
                  ? 'Anotándote…'
                  : 'Anotarme en la lista de espera'
                : enCurso
                  ? 'Reservando…'
                  : 'Ir a pagar con Mercado Pago'}
            </BotonPrincipal>
            {lista ? <AvisoLista horas={lista.horas} /> : <AvisoReserva minutos={elegido.minutosReserva} />}
          </>
        )}
      </div>
    </>
  );
}

function Tarjeta({ torneo }: { torneo: TorneoPublico }) {
  const libres = lugaresLibres(torneo);
  return (
    <section className="flex flex-col gap-4 rounded-superficie bg-noche p-5">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-[26px] leading-[1.1] font-semibold tracking-[-0.03em] text-white">{torneo.nombre}</h2>
        <p className="text-[15px] text-pizarra-400">
          {torneo.categoria}
          {torneo.cierreInscripcion && <> · cierra el {diaLargo(torneo.cierreInscripcion)}</>}
        </p>
      </div>
      <div className="flex flex-col gap-[9px]">
        <div className="flex justify-between gap-3">
          <span className="text-[15px] text-pizarra-400">Lugares</span>
          <Numero className="text-[15px] text-white">
            {torneo.ocupados} de {torneo.cupo}
          </Numero>
        </div>
        {/* La barra de marcas del cupo, en una sola franja (design.md §6). */}
        <div className="flex gap-[3px]">
          {torneo.ocupados > 0 && <div className="h-2 rounded-[2px] bg-lona" style={{ flexGrow: torneo.ocupados }} />}
          {libres > 0 && <div className="h-2 rounded-[2px] bg-borde-noche" style={{ flexGrow: libres }} />}
        </div>
      </div>
      <div className="h-px bg-borde-noche" />
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[15px] text-pizarra-400">Inscripción</span>
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
      className={`flex w-full flex-col gap-1.5 rounded-tarjeta p-4 text-left ${elegido ? 'border-2 border-noche p-[15px]' : 'border border-linea hover:bg-niebla'}`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[17px] font-semibold">{torneo.nombre}</span>
        <Numero className="text-[17px] font-medium">{importe(torneo.precio)}</Numero>
      </div>
      <span className="text-[15px] text-pizarra-500">
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
