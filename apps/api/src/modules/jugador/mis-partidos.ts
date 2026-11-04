// Los partidos del jugador desde su lado (F11). Lógica pura: recibe los partidos ya leídos.
import type { PartidoDelJugador } from '@setpoint/shared';
import type { EstadoPartido } from '../competencia/clasificacion';
import { accionDeFecha, quienAnoto, type ReglasDeReprogramacion } from '../coordinacion/coordinacion';

type SetLeido = { gamesA: number; gamesB: number };
type JugadorLeido = { nombre: string; apellido: string; telefono: string | null; usuarioId: number | null };

export type PartidoLeido = {
  id: number;
  fase: 'GRUPOS' | 'ELIMINATORIA';
  grupo: string | null;
  cuadro: 'CAMPEONATO' | 'COMPLEMENTARIA' | null;
  ronda: number | null;
  jugadorAId: number | null;
  jugadorBId: number | null;
  ganadorId: number | null;
  estado: EstadoPartido;
  fechaAcordada: Date | null;
  fechaLimite: Date | null;
  anotadaPorId: number | null;
  reprogramaciones: number;
  sedeTexto: string | null;
  club: { nombre: string } | null;
  cancha: { nombre: string } | null;
  jugadorA: JugadorLeido | null;
  jugadorB: JugadorLeido | null;
  sets: SetLeido[];
};

const CON_RESULTADO = new Set(['JUGADA', 'WALKOVER', 'ABANDONO']);

// "semifinales", contando desde la final. Igual que en la web (features/resultados).
function nombreDeRonda(ronda: number, rondas: number) {
  return ['final', 'semifinales', 'cuartos de final', 'octavos de final'][rondas - ronda] ?? `ronda ${ronda}`;
}

// En la interfaz, el cuadro consuelo no se llama "Complementaria" (design.md §9).
export function instancia(p: Pick<PartidoLeido, 'fase' | 'grupo' | 'cuadro' | 'ronda'>, rondasPorCuadro: Map<string, number>) {
  if (p.fase === 'GRUPOS') return `zona ${p.grupo}`;
  const cuadro = p.cuadro === 'CAMPEONATO' ? 'campeonato' : 'cuadro consuelo';
  return `${cuadro} · ${nombreDeRonda(p.ronda!, rondasPorCuadro.get(p.cuadro!)!)}`;
}

// El marcador desde el lado del jugador. El W.O. y el abandono no guardan sets (decisiones 016 y
// 059); un abandono de antes de la 059 puede traer lo que se jugó.
function marcador(p: PartidoLeido, esA: boolean) {
  if (p.estado === 'WALKOVER') return 'W.O.';
  const sets = p.sets.map((s) => (esA ? `${s.gamesA}-${s.gamesB}` : `${s.gamesB}-${s.gamesA}`)).join(' ');
  if (p.estado === 'ABANDONO') return sets ? `${sets} ab.` : 'ab.';
  return sets;
}

// Cuántas rondas tiene cada cuadro, para nombrar la ronda desde la final.
export function rondasDeLosCuadros(partidos: Pick<PartidoLeido, 'cuadro' | 'ronda'>[]) {
  const rondasPorCuadro = new Map<string, number>();
  for (const p of partidos) {
    if (p.cuadro && p.ronda) rondasPorCuadro.set(p.cuadro, Math.max(rondasPorCuadro.get(p.cuadro) ?? 0, p.ronda));
  }
  return rondasPorCuadro;
}

// Las reglas de POLENTA, que son las del torneo por defecto (07-configurabilidad §2.3).
const REGLAS_POR_DEFECTO: ReglasDeReprogramacion = { reprogramacionesPermitidas: 1, horasAntelacionReprogramar: 24 };

type Opciones = {
  // Con el nombre del torneo, la instancia lo lleva adelante: "Copa Confluencia 2026 · zona B".
  torneo?: string;
  reglas?: ReglasDeReprogramacion;
  ahora?: Date;
};

// Cada partido del torneo en el que juega, visto desde su lado. Todos los del torneo hacen falta
// para saber cuántas rondas tiene cada cuadro y nombrar la ronda.
export function partidosDelJugador(
  jugadorId: number,
  partidosDelTorneo: PartidoLeido[],
  { torneo, reglas = REGLAS_POR_DEFECTO, ahora = new Date() }: Opciones = {},
): PartidoDelJugador[] {
  const rondasPorCuadro = rondasDeLosCuadros(partidosDelTorneo);

  return partidosDelTorneo
    .filter((p) => p.jugadorAId === jugadorId || p.jugadorBId === jugadorId)
    .map((p) => {
      const esA = p.jugadorAId === jugadorId;
      const rival = esA ? p.jugadorB : p.jugadorA;
      const yo = esA ? p.jugadorA : p.jugadorB;
      const fecha = accionDeFecha(p, reglas, ahora);
      const jugado = CON_RESULTADO.has(p.estado);
      const sede = p.club ? [p.club.nombre, p.cancha && `cancha ${p.cancha.nombre}`].filter(Boolean).join(' · ') : p.sedeTexto;

      return {
        id: p.id,
        instancia: torneo ? `${torneo} · ${instancia(p, rondasPorCuadro)}` : instancia(p, rondasPorCuadro),
        rival: rival && {
          nombre: rival.nombre,
          apellido: rival.apellido,
          // Solo mientras hay que coordinar (decisión 046).
          telefono: jugado ? null : rival.telefono,
        },
        estado: p.estado,
        fechaAcordada: p.fechaAcordada?.toISOString() ?? null,
        fechaLimite: p.fechaLimite?.toISOString() ?? null,
        anotadaPor: quienAnoto(p.anotadaPorId, yo?.usuarioId ?? null, rival?.usuarioId ?? null),
        accionDeFecha: 'accion' in fecha ? fecha.accion : null,
        sede,
        resultado: jugado ? { gano: p.ganadorId === jugadorId, marcador: marcador(p, esA) } : null,
      };
    });
}
