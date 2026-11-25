import type { EstadoTorneo } from '@setpoint/shared';

// Como los nombra design.md: en los cuadros, el estado de la base es "eliminatorias".
const TEXTO: Record<EstadoTorneo, string> = {
  borrador: 'borrador',
  publicado: 'publicado',
  inscripciones_cerradas: 'inscripciones cerradas',
  zonas_generadas: 'zonas generadas',
  grupos_en_curso: 'grupos en curso',
  eliminatorias: 'cuadros',
  finalizado: 'finalizado',
  cancelado: 'cancelado',
};

// El estado de un torneo, escrito igual en la franja del torneo y en las tarjetas del inicio.
export function EstadoDelTorneo({ estado }: { estado: EstadoTorneo }) {
  return (
    <span className="flex h-7 shrink-0 items-center rounded-full border border-linea px-[11px] text-[12.5px] font-medium text-noche">
      {TEXTO[estado]}
    </span>
  );
}
