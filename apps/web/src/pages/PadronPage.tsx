import type { JugadorPadron } from '@setpoint/shared';
import { useState } from 'react';
import { Boton } from '../components/Boton';
import { EncabezadoOrganizador } from '../components/EncabezadoOrganizador';
import { IconoMas } from '../components/IconoMas';
import { PanelJugador } from '../features/padron/PanelJugador';
import { TablaPadron } from '../features/padron/TablaPadron';
import { categoriasEjemplo, padronEjemplo } from '../features/padron/padronEjemplo';

export function PadronPage() {
  const [editando, setEditando] = useState<JugadorPadron | null>(null);

  function agregarJugador() {
    setEditando(null);
    document.getElementById('jugador-nombre')?.focus();
  }

  return (
    <div className="min-h-screen bg-white text-negro">
      <EncabezadoOrganizador organizacion="Polenta Team Tenis" />

      <div className="flex flex-wrap items-end justify-between gap-6 px-7 pt-[26px] pb-[18px]">
        <div className="flex flex-col gap-[7px]">
          <h1 className="text-[30px] font-semibold tracking-[-0.035em]">Padrón</h1>
          <p className="text-[15px] text-gris-500">
            Los jugadores de tu circuito. De acá salen las inscripciones, el ranking y el historial.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {/* Se habilita con la pantalla de importar padrón (F03). */}
          <Boton disabled>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-[15px]" aria-hidden="true">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <path d="M7 10l5 5 5-5" />
              <path d="M12 15V3" />
            </svg>
            Importar planilla
          </Boton>
          <Boton variante="organizador" onClick={agregarJugador}>
            <IconoMas className="size-[15px] stroke-[2.2]" />
            Agregar jugador
          </Boton>
        </div>
      </div>

      <main className="grid items-start gap-[22px] px-7 pb-7 lg:grid-cols-[minmax(0,1fr)_340px]">
        <TablaPadron
          jugadores={padronEjemplo}
          categorias={categoriasEjemplo}
          conRanking
          seleccionadoId={editando?.id ?? null}
          alEditar={setEditando}
        />

        <aside className="flex flex-col gap-4">
          <PanelJugador
            key={editando?.id ?? 'nuevo'}
            categorias={categoriasEjemplo}
            conRanking
            jugador={editando ?? undefined}
            alGuardar={() => setEditando(null)}
            alCambiarActivo={() => setEditando(null)}
            alCancelar={() => setEditando(null)}
          />

          {/* Sin Tarjeta: su bg-white le gana a bg-fondo. */}
          <div className="flex flex-col gap-[9px] rounded-tarjeta border border-linea bg-fondo p-[18px]">
            <h2 className="text-sm font-semibold">¿Son muchos?</h2>
            <p className="text-sm leading-normal text-gris-500">
              Subí la planilla que ya usás y se cargan todos de una vez, con sus puntos históricos.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
