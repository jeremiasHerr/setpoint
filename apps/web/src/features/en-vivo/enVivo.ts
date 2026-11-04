import type { PartidoEnVivo, TorneoEnVivo } from '@setpoint/shared';
import { NOMBRE_DEL_CUADRO, rotuloDeRonda } from '../cuadros/cuadro';

const CON_RESULTADO: PartidoEnVivo['estado'][] = ['jugada', 'walkover', 'abandono'];

export const tieneResultado = (partido: PartidoEnVivo) => CON_RESULTADO.includes(partido.estado);

// "zona B", o la ronda con el cuadro: "cuartos · Campeonato".
export function dondeSeJuega(partido: PartidoEnVivo, torneo: TorneoEnVivo) {
  if (partido.grupo && !partido.cuadro) return `zona ${partido.grupo}`;
  const ronda = rotuloDeRonda(partido.ronda!, torneo.rondas[partido.cuadro!]!);
  return `${ronda} · ${NOMBRE_DEL_CUADRO[partido.cuadro!]}`;
}

// El marcador desde el jugador A, como se lee en el calendario: "6-3 6-4", "W.O." o "abandono".
export function marcador(partido: PartidoEnVivo) {
  if (partido.estado === 'walkover') return 'W.O.';
  const sets = partido.sets.map((s) => `${s.gamesA}-${s.gamesB}`).join(' ');
  if (partido.estado === 'abandono') return sets ? `${sets} ab.` : 'abandono';
  return sets;
}

const zona = 'America/Argentina/Buenos_Aires';
const formatoDia = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: zona });
const formatoHora = new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: zona });
const claveDia = new Intl.DateTimeFormat('en-CA', { timeZone: zona });

// "sábado 8 de noviembre", en sentence case.
export const elDia = (fechaHora: string) => formatoDia.format(new Date(fechaHora)).replace(',', '');
export const laHora = (fechaHora: string) => formatoHora.format(new Date(fechaHora));

export type DiaDelCalendario = { dia: string; titulo: string; partidos: PartidoEnVivo[] };

// El calendario por día, en la hora de Argentina. La API ya los manda ordenados por fecha.
export function porDia(partidos: PartidoEnVivo[]): DiaDelCalendario[] {
  const dias = new Map<string, DiaDelCalendario>();
  for (const partido of partidos) {
    const dia = claveDia.format(new Date(partido.fechaAcordada!));
    const grupo = dias.get(dia) ?? { dia, titulo: elDia(partido.fechaAcordada!), partidos: [] };
    grupo.partidos.push(partido);
    dias.set(dia, grupo);
  }
  return [...dias.values()];
}

// El día de hoy en Argentina, para abrir el calendario en lo que viene y no en lo ya jugado.
export const hoy = () => claveDia.format(new Date());
