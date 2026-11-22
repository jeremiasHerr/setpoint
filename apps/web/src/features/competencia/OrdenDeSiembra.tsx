import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type Announcements, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { JugadorDelSorteo } from '@setpoint/shared';
import { useEffect, useState } from 'react';
import { Boton } from '../../components/Boton';
import { Numero } from '../../components/Numero';
import { TarjetaOpciones } from './TarjetaOpciones';

type Modo = 'azar' | 'mano';

type Props = {
  jugadores: JugadorDelSorteo[];
  // La siembra guardada es la que ordenó la organización.
  manual: boolean;
  deshabilitada: boolean;
  guardando: boolean;
  // null: vuelve a la siembra al azar.
  alGuardar: (jugadorIds: number[] | null) => void;
  // true mientras hay un orden armado a mano sin guardar: el sorteo todavía no lo usaría.
  alCambiarPendiente: (pendiente: boolean) => void;
};

const nombre = (j: JugadorDelSorteo) => `${j.nombre} ${j.apellido}`;

// En un torneo sin ranking todos empatan en 0 y la siembra sale al azar (decisión 013). Acá la
// organización puede ordenarla ella, del mejor sembrado al último, y el sorteo reparte con ese orden
// (decisión 133). Se arrastra cada jugador a su lugar; con el teclado, espacio lo levanta y las
// flechas lo mueven.
export function OrdenDeSiembra({ jugadores, manual, deshabilitada, guardando, alGuardar, alCambiarPendiente }: Props) {
  const [modo, setModo] = useState<Modo>(manual ? 'mano' : 'azar');
  // El orden que se está armando. Arranca en el guardado o, si no hay, en el que tienen ahora.
  const [orden, setOrden] = useState(() => jugadores.map((j) => j.jugadorId));
  const porId = new Map(jugadores.map((j) => [j.jugadorId, j]));
  // Si entró o se bajó alguien, el orden se completa con los nuevos al final.
  const vigente = [...orden.filter((id) => porId.has(id)), ...jugadores.map((j) => j.jugadorId).filter((id) => !orden.includes(id))];
  const guardado = jugadores.every((j, i) => j.posicionSiembra === i + 1) ? jugadores.map((j) => j.jugadorId) : null;
  const sinGuardar = !manual || guardado === null || vigente.some((id, i) => id !== guardado[i]);

  const pendiente = modo === 'mano' && sinGuardar;
  useEffect(() => alCambiarPendiente(pendiente), [pendiente, alCambiarPendiente]);

  const sensores = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  function alSoltar({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    setOrden(arrayMove(vigente, vigente.indexOf(Number(active.id)), vigente.indexOf(Number(over.id))));
  }

  function elegir(nuevo: Modo) {
    setModo(nuevo);
    // Volver al azar descarta el orden guardado; si todavía no se había guardado, no hay nada que avisar.
    if (nuevo === 'azar' && manual) alGuardar(null);
  }

  const puesto = (id: string | number) => vigente.indexOf(Number(id)) + 1;
  const quien = (id: string | number) => {
    const jugador = porId.get(Number(id));
    return jugador ? nombre(jugador) : '';
  };
  const anuncios: Announcements = {
    onDragStart: ({ active }) => `Levantaste a ${quien(active.id)}, en el puesto ${puesto(active.id)}.`,
    onDragOver: ({ active, over }) => (over ? `${quien(active.id)} pasaría al puesto ${puesto(over.id)}.` : ''),
    onDragEnd: ({ active, over }) => (over ? `${quien(active.id)} quedó en el puesto ${puesto(over.id)}.` : ''),
    onDragCancel: ({ active }) => `${quien(active.id)} volvió a su puesto.`,
  };

  return (
    <div className="flex flex-col gap-3">
      <TarjetaOpciones
        titulo="Orden de siembra"
        aclaracion="sin ranking, todos empatan en 0"
        opciones={[
          { valor: 'azar', etiqueta: 'Al azar', deshabilitada: deshabilitada || guardando },
          { valor: 'mano', etiqueta: 'Lo ordeno yo', deshabilitada: deshabilitada || guardando },
        ]}
        elegida={modo}
        alElegir={elegir}
        ayuda={
          modo === 'azar'
            ? 'El sistema sortea el orden. «Volver a sortear» lo mezcla de nuevo.'
            : 'Arrastrá a cada jugador a su lugar: el primero es el mejor sembrado. El sorteo reparte con este orden.'
        }
      />

      {modo === 'mano' && (
        <div className="flex flex-col gap-3 rounded-tarjeta border border-linea px-[18px] py-4">
          <DndContext sensors={sensores} collisionDetection={closestCenter} onDragEnd={alSoltar} accessibility={{ announcements: anuncios }}>
            <SortableContext items={vigente} strategy={verticalListSortingStrategy}>
              <ol className="flex flex-col">
                {vigente.map((id, i) => (
                  <FilaDeSiembra key={id} id={id} puesto={i + 1} nombre={quien(id)} deshabilitada={deshabilitada || guardando} />
                ))}
              </ol>
            </SortableContext>
          </DndContext>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Boton disabled={deshabilitada || guardando || !sinGuardar} onClick={() => alGuardar(vigente)}>
              {guardando ? 'Guardando…' : 'Guardar el orden'}
            </Boton>
            <p className="text-sm text-pizarra-500">
              {sinGuardar ? 'Guardalo antes de sortear: el sorteo usa el último orden guardado.' : 'Guardado. El sorteo usa este orden.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function FilaDeSiembra({ id, puesto, nombre, deshabilitada }: { id: number; puesto: number; nombre: string; deshabilitada: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled: deshabilitada });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex min-h-[44px] items-center gap-3 border-b border-linea-suave last:border-b-0 ${isDragging ? 'relative z-10 bg-niebla' : 'bg-papel'}`}
    >
      <Numero className="w-7 text-right text-sm text-pizarra-500">{puesto}</Numero>
      <span className="grow text-[15px]">{nombre}</span>
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Mover a ${nombre}, en el puesto ${puesto}`}
        className="flex size-11 shrink-0 cursor-grab touch-none items-center justify-center rounded-control text-pizarra-500 hover:text-noche active:cursor-grabbing disabled:cursor-default disabled:opacity-40"
      >
        {/* Dos columnas de puntos: lo que se agarra para arrastrar. */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="9" cy="6" r="1.6" />
          <circle cx="15" cy="6" r="1.6" />
          <circle cx="9" cy="12" r="1.6" />
          <circle cx="15" cy="12" r="1.6" />
          <circle cx="9" cy="18" r="1.6" />
          <circle cx="15" cy="18" r="1.6" />
        </svg>
      </button>
    </li>
  );
}
