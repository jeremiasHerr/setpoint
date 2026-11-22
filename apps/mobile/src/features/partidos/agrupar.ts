import type { PartidoDelJugador } from '@setpoint/shared';
import { diasHasta } from '../../lib/fechas';

export type PartidosAgrupados = {
  // Los que tienen una fecha que anotó el rival y falta que confirme (F14). Van arriba de todo:
  // es lo único que le pide una acción, y sin confirmar todavía no es un turno pactado.
  porConfirmar: PartidoDelJugador[];
  // Los que tienen un resultado que cargó el rival y espera su respuesta (decisión 127). También
  // arriba: le piden una acción.
  resultadosPorConfirmar: PartidoDelJugador[];
  // Los que tienen la fecha pasada y el resultado lo puede cargar él, o un resultado suyo pendiente
  // o uno rechazado: falta que alguien cargue cómo terminó.
  faltaElResultado: PartidoDelJugador[];
  // El primero con fecha acordada desde hoy: va en la tarjeta noche.
  proximo: PartidoDelJugador | null;
  // Sin fecha y con rival, del que vence antes al que vence después.
  sinCoordinar: PartidoDelJugador[];
  // Lo demás: los que tienen fecha después del próximo y los jugados, más reciente arriba.
  resto: PartidoDelJugador[];
  // Los que faltan jugar y tienen rival: de un cuadro que todavía no se definió no se sabe
  // contra quién. Es el total de "te falta coordinar 3 de 4".
  porJugar: number;
};

const porFecha = (campo: 'fechaAcordada' | 'fechaLimite') => (a: PartidoDelJugador, b: PartidoDelJugador) =>
  (a[campo] ?? '9999').localeCompare(b[campo] ?? '9999');

// Cómo se reparte Cuándo juego (04-flujo-jugador §7): próximo partido, lo que falta coordinar
// con su plazo, y el resto del torneo.
export function agruparPartidos(partidos: PartidoDelJugador[], ahora = new Date()): PartidosAgrupados {
  const conRival = partidos.filter((p) => p.rival !== null);
  const sinResultado = conRival.filter((p) => p.resultado === null);

  // El resultado que cargó el rival va arriba; los que esperan un resultado, en su sección. Ninguno
  // se repite en las demás.
  const propuesta = (p: PartidoDelJugador) => p.resultadoPropuesto;
  const resultadosPorConfirmar = sinResultado.filter((p) => propuesta(p)?.cargadoPor === 'rival' && propuesta(p)?.estado === 'pendiente');
  const faltaElResultado = sinResultado.filter(
    (p) =>
      !resultadosPorConfirmar.includes(p) &&
      (propuesta(p) !== null || (p.puedeCargarResultado && p.fechaAcordada !== null && diasHasta(p.fechaAcordada, ahora) < 0)),
  );
  const porJugar = sinResultado.filter((p) => !resultadosPorConfirmar.includes(p) && !faltaElResultado.includes(p));

  const esPorConfirmar = (p: PartidoDelJugador) =>
    p.estado === 'ANOTADA' && p.anotadaPor === 'rival' && p.fechaAcordada !== null && diasHasta(p.fechaAcordada, ahora) >= 0;
  const porConfirmar = porJugar.filter(esPorConfirmar).sort(porFecha('fechaAcordada'));

  const agendados = porJugar
    .filter((p) => !esPorConfirmar(p) && p.fechaAcordada !== null && diasHasta(p.fechaAcordada, ahora) >= 0)
    .sort(porFecha('fechaAcordada'));
  // Una fecha acordada que ya pasó sin resultado: se jugó y falta cargarlo, o no se jugó.
  // Para el jugador ya no es "lo que viene"; queda con los demás.
  const pasados = porJugar.filter((p) => p.fechaAcordada !== null && diasHasta(p.fechaAcordada, ahora) < 0);
  const jugados = conRival.filter((p) => p.resultado !== null).reverse();

  return {
    porConfirmar,
    resultadosPorConfirmar,
    faltaElResultado,
    proximo: agendados[0] ?? null,
    sinCoordinar: porJugar.filter((p) => p.fechaAcordada === null).sort(porFecha('fechaLimite')),
    resto: [...agendados.slice(1), ...pasados, ...jugados],
    porJugar: sinResultado.length,
  };
}

// "https://wa.me/5492994000000". Los números del padrón se cargan sin el 54 ni el 9 de los
// celulares argentinos; si ya los traen, se dejan.
export function enlaceDeWhatsApp(telefono: string) {
  const digitos = telefono.replace(/\D/g, '').replace(/^0/, '');
  return `https://wa.me/${digitos.startsWith('54') ? digitos : `549${digitos}`}`;
}
