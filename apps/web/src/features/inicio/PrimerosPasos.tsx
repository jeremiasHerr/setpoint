import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Numero } from '../../components/Numero';
import { BotonCopiarLink } from './BotonCopiarLink';

export type EstadoDePrimerosPasos = {
  hayJugadores: boolean;
  hayTorneo: boolean;
  hayInscripcion: boolean;
  // Un torneo con la inscripción abierta, para copiar su link. null si no hay ninguno.
  torneoAbierto: { id: number; slugPublico: string | null } | null;
};

type Props = EstadoDePrimerosPasos & {
  // En la columna angosta del inicio vacío, un paso debajo del otro.
  apilada?: boolean;
};

type Paso = { titulo: string; hecho: boolean; accion: ReactNode };

const enlace = 'text-sm font-medium underline underline-offset-2 hover:text-pizarra-500';

// Los tres pasos para arrancar (design.md §9, decisión 134). Se tildan solos con lo que ya hay: el
// padrón con jugadores, un torneo creado y la primera inscripción, que es la prueba de que el link
// llegó al grupo. Borde de 1 px, no tarjeta noche: no es el dato principal. Con los tres hechos, no
// se muestra.
export function PrimerosPasos({ hayJugadores, hayTorneo, hayInscripcion, torneoAbierto, apilada = false }: Props) {
  if (hayJugadores && hayTorneo && hayInscripcion) return null;

  const pasos: Paso[] = [
    {
      titulo: 'Importá tus jugadores',
      hecho: hayJugadores,
      accion: (
        <Link to="/padron/importar" className={enlace}>
          Subir la planilla
        </Link>
      ),
    },
    {
      titulo: 'Creá tu primer torneo',
      hecho: hayTorneo,
      accion: (
        <Link to="/torneos/nuevo" className={enlace}>
          Armar un torneo
        </Link>
      ),
    },
    {
      titulo: 'Compartí el link de inscripción',
      hecho: hayInscripcion,
      accion:
        torneoAbierto === null ? (
          <span className="text-sm text-pizarra-500">Cuando publiques un torneo</span>
        ) : (
          <BotonCopiarLink torneo={torneoAbierto} />
        ),
    },
  ];
  const hechos = pasos.filter((p) => p.hecho).length;

  return (
    <section className="flex flex-col gap-3.5 rounded-tarjeta border border-linea bg-papel p-[18px]">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="text-[15px] font-semibold">Primeros pasos</h2>
        <span className="text-[13px] text-pizarra-500">
          <Numero>{hechos}</Numero> de <Numero>3</Numero> · se tildan solos
        </span>
      </div>
      <ol className={`flex flex-col gap-2.5 ${apilada ? '' : 'md:flex-row md:gap-4'}`}>
        {pasos.map((paso) => (
          <li key={paso.titulo} className="flex min-h-[44px] flex-1 flex-wrap items-center gap-x-3 gap-y-1.5">
            <Tilde hecho={paso.hecho} />
            <span className={`text-[15px] ${paso.hecho ? 'text-pizarra-500 line-through decoration-pizarra-400' : 'font-medium'}`}>
              {paso.titulo}
            </span>
            {!paso.hecho && <span className={`basis-full pl-8 ${apilada ? '' : 'md:basis-auto md:pl-0'}`}>{paso.accion}</span>}
          </li>
        ))}
      </ol>
    </section>
  );
}

function Tilde({ hecho }: { hecho: boolean }) {
  return hecho ? (
    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-lona-texto text-white" aria-label="Hecho">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </span>
  ) : (
    <span className="size-5 shrink-0 rounded-full border-[1.5px] border-borde-campo" aria-label="Pendiente" />
  );
}
