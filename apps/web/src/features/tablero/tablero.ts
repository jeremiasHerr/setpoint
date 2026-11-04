import type { BloqueDelTablero, FilaDePosiciones, PartidoDelTablero, SituacionDelPartido, Tablero } from '@setpoint/shared';
import { NOMBRE_DEL_CUADRO, rotuloDeRonda } from '../cuadros/cuadro';
import type { Frase } from '../resultados/resultado';

// Las fechas límite son días ('AAAA-MM-DD'): se leen y se muestran en UTC para que no se corran.
const diaLargo = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', timeZone: 'UTC' });
const diaCorto = new Intl.DateTimeFormat('es-AR', { weekday: 'short', day: 'numeric', timeZone: 'America/Argentina/Buenos_Aires' });

// "sábado 20"
export function elDia(fecha: string) {
  return diaLargo.format(new Date(`${fecha}T00:00:00Z`)).replace(',', '');
}

// "sáb 14", para la fecha que anotaron los jugadores, que tiene hora.
export function elDiaCorto(fechaHora: string) {
  return diaCorto.format(new Date(fechaHora)).replace('.', '').replace(',', '');
}

const hora = new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'America/Argentina/Buenos_Aires' });

// "sáb 14 · 10:00", como en la app.
export function elDiaYHora(fechaHora: string) {
  return `${elDiaCorto(fechaHora)} · ${hora.format(new Date(fechaHora))}`;
}

// Los partidos con fecha acordada que todavía no se jugaron, del más cercano al más lejano. No
// están en "Lo que falta", pero la organización puede cambiarles la fecha o confirmarla por un
// jugador sin la app (F14).
export function partidosConFecha(tablero: Tablero) {
  return tablero.bloques
    .flatMap((b) => b.partidos)
    .filter((p) => p.situacion === 'con_fecha')
    .sort((a, b) => (a.fechaAcordada ?? '').localeCompare(b.fechaAcordada ?? ''));
}

// Cómo se nombra cada barra: la zona, o el cuadro y la ronda ("Campeonato · semis").
export function nombreDelBloque(bloque: BloqueDelTablero, tablero: Tablero) {
  if (bloque.grupo) return bloque.grupo;
  return `${NOMBRE_DEL_CUADRO[bloque.cuadro!]} · ${rotuloDeRonda(bloque.ronda!, tablero.rondas[bloque.cuadro!]!)}`;
}

// Dónde se juega, para la columna de la izquierda de "Lo que falta": "zona D", o "semis" con el cuadro.
export function dondeSeJuega(partido: PartidoDelTablero, tablero: Tablero) {
  if (partido.grupo) return `zona ${partido.grupo}`;
  const ronda = rotuloDeRonda(partido.ronda!, tablero.rondas[partido.cuadro!]!);
  return partido.cuadro === 'campeonato' ? ronda : `${ronda} · consuelo`;
}

// "venció ayer", "venció hace 3 días", "vence hoy", "6 días".
export function textoDeLosDias(dias: number | null) {
  if (dias === null) return 'sin plazo';
  if (dias === -1) return 'venció ayer';
  if (dias < 0) return `venció hace ${-dias} días`;
  if (dias === 0) return 'vence hoy';
  return dias === 1 ? '1 día' : `${dias} días`;
}

// "Faltan jugarse 17 partidos y 8 todavía no tienen fecha." Los números van en mono (design.md §4).
export function queFalta({ totales }: Tablero): Frase {
  const faltan = totales.partidos - totales.jugados;
  if (faltan === 0) return ['Ya se jugaron todos los partidos.'];
  const sinFecha = totales.sinCoordinar + totales.vencidos;
  const partidos: Frase = faltan === 1 ? ['Falta jugarse ', 1, ' partido'] : ['Faltan jugarse ', faltan, ' partidos'];
  if (sinFecha === 0) return [...partidos, ', y todos tienen fecha.'];
  if (sinFecha === faltan) return [...partidos, faltan === 1 ? ' y no tiene fecha.' : ' y ninguno tiene fecha.'];
  return [...partidos, ' y ', sinFecha, sinFecha === 1 ? ' todavía no tiene fecha.' : ' todavía no tienen fecha.'];
}

// Los apellidos del partido, como en la referencia: "Curihual · Nieva".
export const nombresDelPartido = (partido: PartidoDelTablero) => `${partido.jugadorA!.apellido} · ${partido.jugadorB!.apellido}`;

// El mensaje de "Escribirles": a cada jugador, con quién juega y hasta cuándo.
export function mensajeParaCoordinar(partido: PartidoDelTablero, aQuien: 'A' | 'B', tablero: Tablero) {
  const [yo, rival] = aQuien === 'A' ? [partido.jugadorA!, partido.jugadorB!] : [partido.jugadorB!, partido.jugadorA!];
  const plazo = partido.fechaLimite
    ? partido.dias! < 0
      ? ` El plazo venció el ${elDia(partido.fechaLimite)}.`
      : ` Hay tiempo hasta el ${elDia(partido.fechaLimite)}.`
    : '';
  return `Hola ${yo.nombre}, ¿cuándo jugás con ${rival.nombre} ${rival.apellido} (${dondeSeJuega(partido, tablero)}, ${tablero.nombre})?${plazo}`;
}

// El marcador de un partido de zona desde quien está en la fila: "6-3 6-4", "W.O." o "ab.".
export function marcadorDesde(partido: PartidoDelTablero, jugadorId: number) {
  if (partido.estado === 'walkover') return 'W.O.';
  const esA = partido.jugadorA?.jugadorId === jugadorId;
  const sets = partido.sets.map((s) => (esA ? `${s.gamesA}-${s.gamesB}` : `${s.gamesB}-${s.gamesA}`)).join(' ');
  if (partido.estado === 'abandono') return sets ? `${sets} ab.` : 'ab.';
  return sets;
}

// El partido entre dos de la zona, en cualquier orden.
export function partidoEntre(partidos: PartidoDelTablero[], a: number, b: number) {
  return partidos.find(
    (p) =>
      (p.jugadorA?.jugadorId === a && p.jugadorB?.jugadorId === b) || (p.jugadorA?.jugadorId === b && p.jugadorB?.jugadorId === a),
  );
}

const enumerar = (nombres: string[]) =>
  nombres.length <= 1 ? (nombres[0] ?? '') : `${nombres.slice(0, -1).join(', ')} y ${nombres[nombres.length - 1]}`;

// "Antileo y Roa están clasificando a Campeonato. Vera y Peralta van al cuadro consuelo."
export function comoVieneLaZona(filas: FilaDePosiciones[]) {
  const de = (destino: FilaDePosiciones['destino']) => filas.filter((f) => f.destino === destino).map((f) => f.apellido);
  const principal = de('campeonato');
  const consuelo = de('complementaria');
  const afuera = de(null);
  const verbo = (n: string[], uno: string, varios: string) => (n.length === 1 ? uno : varios);
  return [
    principal.length > 0 &&
      `${enumerar(principal)} ${verbo(principal, 'está', 'están')} clasificando a ${NOMBRE_DEL_CUADRO.campeonato}.`,
    consuelo.length > 0 && `${enumerar(consuelo)} ${verbo(consuelo, 'va', 'van')} al ${NOMBRE_DEL_CUADRO.complementaria.toLowerCase()}.`,
    afuera.length > 0 && `${enumerar(afuera)} ${verbo(afuera, 'queda', 'quedan')} afuera.`,
  ]
    .filter(Boolean)
    .join(' ');
}

export const COLOR_DE_LA_SITUACION: Record<SituacionDelPartido, string> = {
  jugado: 'bg-negro',
  con_fecha: 'bg-gris-400',
  sin_coordinar: 'bg-linea',
  vencido: 'bg-rojo',
  esperando: 'border border-dashed border-gris-300 bg-white',
};
