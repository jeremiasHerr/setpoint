import type { BloqueDelTablero, FilaDePosiciones, PartidoDelTablero, SituacionDelPartido, Tablero } from '@setpoint/shared';
import { MARCA } from '../../components/marcas';
import { NOMBRE_DEL_PRINCIPAL, nombreDelCuadro, rotuloDeRonda } from '../cuadros/cuadro';

// Las fechas límite son días ('AAAA-MM-DD'): se leen y se muestran en UTC para que no se corran.
const diaLargo = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', timeZone: 'UTC' });

// "sábado 20"
export function elDia(fecha: string) {
  return diaLargo.format(new Date(`${fecha}T00:00:00Z`)).replace(',', '');
}

// Los partidos con un resultado que cargó un jugador desde la app y todavía no cuenta (decisión 127):
// pendiente de que lo confirme el rival, o rechazado. La organización los confirma o los carga.
export function partidosConResultadoPropuesto(tablero: Tablero) {
  return tablero.bloques.flatMap((b) => b.partidos).filter((p) => p.resultadoPropuesto !== null);
}

// "6-3 4-6 10-7" dado vuelta, para leerlo desde el otro lado. "ab." queda igual.
const darVuelta = (marcador: string) => marcador.replace(/(\d+)-(\d+)/g, '$2-$1');

// El resultado que cargó un jugador, en palabras: quién lo cargó y cómo quedó desde el lado del que
// gana. "Bravo cargó: gana Roa 6-3 6-4", y lo que falta: que confirme el otro, o que lo resuelva la
// organización si el otro dijo que no fue así.
export function resultadoPropuestoEnPalabras(partido: PartidoDelTablero) {
  const propuesta = partido.resultadoPropuesto!;
  const a = partido.jugadorA!.apellido;
  const b = partido.jugadorB!.apellido;
  const [cargo, otro] = propuesta.cargadoPor === 'a' ? [a, b] : [b, a];
  const ganador = propuesta.ganador === 'a' ? a : b;
  const marcador = propuesta.ganador === 'a' ? propuesta.marcador : darVuelta(propuesta.marcador);
  const abandono = marcador === 'ab.';
  return {
    // El marcador va aparte, para mostrarlo con los números en mono.
    cargado: `${cargo} cargó: gana ${ganador}${abandono ? ' por abandono' : ''}`,
    marcador: abandono ? null : marcador,
    falta: propuesta.estado === 'pendiente' ? `falta que confirme ${otro}` : `${otro} dijo que no fue así`,
  };
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
  return `${nombreDelCuadro(bloque.cuadro!, tablero.nombreCuadroConsuelo)} · ${rotuloDeRonda(bloque.ronda!, tablero.rondas[bloque.cuadro!]!)}`;
}

// Dónde se juega, para la columna de la izquierda de "Lo que falta": "zona D", o "semis" con el cuadro.
export function dondeSeJuega(partido: PartidoDelTablero, tablero: Tablero) {
  if (partido.grupo) return `zona ${partido.grupo}`;
  const ronda = rotuloDeRonda(partido.ronda!, tablero.rondas[partido.cuadro!]!);
  return partido.cuadro === 'campeonato' ? ronda : `${ronda} · ${tablero.nombreCuadroConsuelo.toLowerCase()}`;
}

// "venció ayer", "venció hace 3 días", "vence hoy", "quedan 6 días".
export function textoDeLosDias(dias: number | null) {
  if (dias === null) return 'sin plazo';
  if (dias === -1) return 'venció ayer';
  if (dias < 0) return `venció hace ${-dias} días`;
  if (dias === 0) return 'vence hoy';
  return dias === 1 ? 'queda 1 día' : `quedan ${dias} días`;
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

// Lo que necesitan el marcador y el cruce. También lo usa la página pública del torneo (F10),
// que trae los partidos sin el teléfono de los jugadores.
type PartidoConMarcador = Pick<PartidoDelTablero, 'estado' | 'sets'> & {
  jugadorA: { jugadorId: number } | null;
  jugadorB: { jugadorId: number } | null;
};

// El marcador de un partido de zona desde quien está en la fila: "6-3 6-4", "W.O." o "ab.".
export function marcadorDesde(partido: PartidoConMarcador, jugadorId: number) {
  if (partido.estado === 'walkover') return 'W.O.';
  // Ninguno se presentó: pierden los dos (decisión 135).
  if (partido.estado === 'doble_walkover') return 'W.O. doble';
  const esA = partido.jugadorA?.jugadorId === jugadorId;
  const sets = partido.sets.map((s) => (esA ? `${s.gamesA}-${s.gamesB}` : `${s.gamesB}-${s.gamesA}`)).join(' ');
  if (partido.estado === 'abandono') return sets ? `${sets} ab.` : 'ab.';
  return sets;
}

// El partido entre dos de la zona, en cualquier orden.
export function partidoEntre<P extends PartidoConMarcador>(partidos: P[], a: number, b: number) {
  return partidos.find(
    (p) =>
      (p.jugadorA?.jugadorId === a && p.jugadorB?.jugadorId === b) || (p.jugadorA?.jugadorId === b && p.jugadorB?.jugadorId === a),
  );
}

const enumerar = (nombres: string[]) =>
  nombres.length <= 1 ? (nombres[0] ?? '') : `${nombres.slice(0, -1).join(', ')} y ${nombres[nombres.length - 1]}`;

// "Antileo y Roa están clasificando a Campeonato. Vera y Peralta van al cuadro consuelo."
export function comoVieneLaZona(filas: FilaDePosiciones[], nombreConsuelo: string) {
  const de = (destino: FilaDePosiciones['destino']) => filas.filter((f) => f.destino === destino).map((f) => f.apellido);
  const principal = de('campeonato');
  const consuelo = de('complementaria');
  const afuera = de(null);
  const verbo = (n: string[], uno: string, varios: string) => (n.length === 1 ? uno : varios);
  return [
    principal.length > 0 &&
      `${enumerar(principal)} ${verbo(principal, 'está', 'están')} clasificando a ${NOMBRE_DEL_PRINCIPAL}.`,
    consuelo.length > 0 && `${enumerar(consuelo)} ${verbo(consuelo, 'va', 'van')} al ${nombreConsuelo.toLowerCase()}.`,
    afuera.length > 0 && `${enumerar(afuera)} ${verbo(afuera, 'queda', 'quedan')} afuera.`,
  ]
    .filter(Boolean)
    .join(' ');
}

// Las marcas del tablero son las de la barra de marcas. El que espera a los ganadores de la ronda
// anterior todavía no se puede jugar: va lleno en línea, sin estado.
export const COLOR_DE_LA_SITUACION: Record<SituacionDelPartido, string> = {
  jugado: MARCA.hecho,
  con_fecha: MARCA['en-curso'],
  sin_coordinar: MARCA.pendiente,
  vencido: MARCA.vencido,
  esperando: 'bg-linea',
};
