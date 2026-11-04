import type { CoordinacionDelPartido } from '@setpoint/shared';
import { useState, type FormEvent } from 'react';
import { Boton } from '../../components/Boton';
import { Campo } from '../../components/Campo';
import { Selector } from '../../components/Selector';
import { ErrorApi } from '../../lib/api';
import { useAnotarFecha, useCoordinacion } from './useTablero';

const OTRO = 'otro';

// Día y hora de Argentina, para no ofrecer horarios que ya pasaron hoy.
const ahoraEnArgentina = () => {
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Argentina/Buenos_Aires',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(new Date())
      .map((p) => [p.type, p.value]),
  );
  return { dia: `${partes.year}-${partes.month}-${partes.day}`, hora: `${partes.hour}:${partes.minute}` };
};

// Cada media hora de 8:00 a 22:30, como en la app. Hoy, solo las que no pasaron.
function horasDelDia(dia: string) {
  const horas: string[] = [];
  for (let m = 8 * 60; m <= 22 * 60 + 30; m += 30) {
    horas.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`);
  }
  const ahora = ahoraEnArgentina();
  return dia === ahora.dia ? horas.filter((h) => h > ahora.hora) : horas;
}

const MENSAJES: Record<string, string> = {
  PLAZO_VENCIDO: 'Venció el plazo: este partido se resuelve con el resultado.',
  PARTIDO_TERMINADO: 'Este partido ya tiene resultado.',
  PARTIDO_CAMBIO: 'Uno de los jugadores anotó una fecha mientras tanto. Recargá el tablero.',
  SIN_CONEXION: 'No pudimos conectarnos. Revisá tu conexión y probá de nuevo.',
};

type Props = { slug: string; torneoId: number; partidoId: number; sangria: string; onCerrar: () => void };

// "Anotar fecha" en una fila sin coordinar del tablero (F14, decisión 062): la organización la carga
// en nombre de los dos, y queda confirmada (decisión 064). Se abre debajo de la fila, como Escribirles.
export function AnotarFecha({ slug, torneoId, partidoId, sangria, onCerrar }: Props) {
  const coordinacion = useCoordinacion(slug, torneoId, partidoId);

  return (
    <div className={`px-5 pb-4 ${sangria}`}>
      <div className="rounded-control border border-linea bg-fondo-tabla p-4">
        {coordinacion.isPending && <p className="text-sm text-gris-500">Cargando…</p>}
        {coordinacion.error && <p className="text-sm text-rojo-texto">No pudimos cargar el partido. Probá de nuevo.</p>}
        {coordinacion.data && (
          <Formulario slug={slug} torneoId={torneoId} coordinacion={coordinacion.data} onCerrar={onCerrar} />
        )}
      </div>
    </div>
  );
}

function Formulario({
  slug,
  torneoId,
  coordinacion,
  onCerrar,
}: {
  slug: string;
  torneoId: number;
  coordinacion: CoordinacionDelPartido;
  onCerrar: () => void;
}) {
  const anotar = useAnotarFecha(slug, torneoId, coordinacion.partidoId);
  const { sede, dias, partidoId } = coordinacion;
  const [dia, setDia] = useState(dias[0] ?? '');
  const [hora, setHora] = useState('');
  const [club, setClub] = useState(sede.modo === 'libre' && sede.clubes.length > 0 ? String(sede.clubes[0].id) : OTRO);
  const [sedeTexto, setSedeTexto] = useState('');

  if (!coordinacion.accion) {
    return <p className="text-sm text-gris-700">{MENSAJES[coordinacion.bloqueo ?? 'PARTIDO_TERMINADO'] ?? 'Este partido no se puede coordinar.'}</p>;
  }

  const libre = sede.modo === 'libre';
  const escribiendo = libre && club === OTRO;
  const horas = dia ? horasDelDia(dia) : [];
  const completo = dia !== '' && horas.includes(hora) && (!escribiendo || sedeTexto.trim() !== '');

  const error = anotar.error instanceof ErrorApi ? anotar.error : null;
  const campos = error?.campos ?? {};
  const mensaje = error && Object.keys(campos).length === 0 ? (MENSAJES[error.codigo] ?? 'No pudimos anotar la fecha. Probá de nuevo.') : null;

  function guardar(e: FormEvent) {
    e.preventDefault();
    if (!completo) return;
    anotar.mutate(
      {
        dia,
        hora,
        clubId: libre && !escribiendo ? Number(club) : null,
        sedeTexto: escribiendo ? sedeTexto : null,
      },
      { onSuccess: onCerrar },
    );
  }

  const id = (campo: string) => `fecha-${partidoId}-${campo}`;

  return (
    <form onSubmit={guardar} className="flex flex-col gap-4">
      <div className="grid gap-3 md:grid-cols-[170px_130px_minmax(0,1fr)]">
        <Campo
          id={id('dia')}
          rotulo="Día"
          type="date"
          numerico
          required
          value={dia}
          min={dias[0]}
          max={coordinacion.ultimoDia ?? undefined}
          onChange={(e) => setDia(e.target.value)}
        />
        <Selector id={id('hora')} rotulo="Hora" required value={hora} onChange={(e) => setHora(e.target.value)} className="font-mono tabular-nums">
          <option value="" disabled>
            Elegí
          </option>
          {horas.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </Selector>
        {libre ? (
          <div className="flex flex-col gap-3">
            {sede.clubes.length > 0 && (
              <Selector id={id('club')} rotulo="Dónde juegan" value={club} onChange={(e) => setClub(e.target.value)}>
                {sede.clubes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
                <option value={OTRO}>Otro lugar</option>
              </Selector>
            )}
            {escribiendo && (
              <Campo
                id={id('sede')}
                rotulo={sede.clubes.length > 0 ? 'Escribí dónde' : 'Dónde juegan'}
                required
                maxLength={80}
                value={sedeTexto}
                onChange={(e) => setSedeTexto(e.target.value)}
              />
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold text-gris-500">Dónde juegan</span>
            <span className="flex h-12 items-center rounded-control bg-fondo px-3.5 text-[15px]">{sede.nombre ?? 'Sin sede elegida'}</span>
          </div>
        )}
      </div>

      {(campos.dia || campos.hora || campos.clubId) && (
        <p className="text-sm text-rojo-texto">{campos.dia ?? campos.hora ?? campos.clubId}</p>
      )}
      {mensaje && <p className="text-sm text-rojo-texto">{mensaje}</p>}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gris-500">Queda confirmada para los dos, y les avisamos a los que tienen la app.</p>
        <div className="flex gap-2">
          <Boton onClick={onCerrar}>Cancelar</Boton>
          <Boton type="submit" variante="organizador" disabled={!completo || anotar.isPending}>
            {anotar.isPending ? 'Anotando…' : 'Anotar fecha'}
          </Boton>
        </div>
      </div>
    </form>
  );
}
