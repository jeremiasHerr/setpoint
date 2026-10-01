// Datos fijos de la landing. Son de ejemplo: la landing no consulta la API.

export type EstadoPartido = 'hecho' | 'enCurso' | 'pendiente' | 'vencido';

export type ZonaEjemplo = {
  letra: string;
  partidos: EstadoPartido[];
};

export const zonasEjemplo: ZonaEjemplo[] = [
  { letra: 'A', partidos: ['hecho', 'hecho', 'hecho', 'enCurso', 'pendiente', 'pendiente'] },
  { letra: 'B', partidos: ['hecho', 'hecho', 'hecho', 'hecho', 'hecho', 'enCurso'] },
  { letra: 'C', partidos: ['hecho', 'hecho', 'hecho', 'hecho', 'enCurso', 'pendiente'] },
  { letra: 'D', partidos: ['hecho', 'hecho', 'hecho', 'enCurso', 'pendiente', 'vencido'] },
];

export const partidosPendientesEjemplo = [
  { jugadores: 'Curihual · Nieva', estado: 'venció ayer', vencido: true },
  { jugadores: 'Roa · Peralta', estado: 'sin coordinar', vencido: false },
];

export const cifrasPolenta = ['77 jugadores', '2 categorías', '5 torneos por año'];

export const hoyVsSetPoint = [
  {
    hoy: 'El ranking vive en un Excel que actualiza una sola persona',
    conSetPoint: 'Se actualiza solo al cerrar cada torneo, con cada punto trazable al partido que lo generó',
  },
  {
    hoy: 'Los 78 resultados de cada torneo se leen del grupo y se anotan a mano',
    conSetPoint: 'Se cargan una vez y recalculan tabla, desempates y cuadro en el momento',
  },
  {
    hoy: 'Cuando dos empatan en la zona hay que ir al reglamento y contar sets y games',
    conSetPoint: 'El desempate lo resuelve la cascada del reglamento, escrita de antemano',
  },
  {
    hoy: 'Las inscripciones se cobran por transferencia, con comprobante y verificación manual',
    conSetPoint: 'Checkout que confirma solo, con reserva de cupo y lista de espera',
  },
  {
    hoy: 'Para saber cuándo juega, el jugador le pregunta al organizador',
    conSetPoint: 'Lo ve en su teléfono, y le avisa una notificación cuando cambia algo',
  },
];

export type Icono = 'zonas' | 'cuadros' | 'calendario' | 'pago' | 'ranking' | 'planilla';

export const funcionalidades: { icono: Icono; titulo: string; texto: string }[] = [
  {
    icono: 'zonas',
    titulo: 'Zonas con siembra por ranking',
    texto:
      'Serpentina, directa o por bombos. Con 32 inscriptos arma 8 zonas de 4 y los 48 partidos, y todas las zonas suman el mismo ranking acumulado.',
  },
  {
    icono: 'cuadros',
    titulo: 'Dos cuadros en paralelo',
    texto:
      'Campeonato y Complementaria corren juntos y cada uno define su campeón. Nadie queda afuera después de la fase de grupos.',
  },
  {
    icono: 'calendario',
    titulo: 'Coordinación entre jugadores',
    texto:
      'Siguen arreglando por WhatsApp, pero la fecha queda anotada y confirmada por los dos. El organizador ve qué falta sin revisar el scroll del grupo.',
  },
  {
    icono: 'pago',
    titulo: 'Cobro con MercadoPago',
    texto:
      'El lugar se reserva quince minutos mientras el jugador paga, y la inscripción se confirma sola. Con lista de espera y conciliación por torneo.',
  },
  {
    icono: 'ranking',
    titulo: 'Ranking por casilleros',
    texto:
      'El mismo mecanismo que usa la ATP: cada etapa tiene su casillero y los puntos nuevos reemplazan a los del año anterior. Configurable por circuito.',
  },
  {
    icono: 'planilla',
    titulo: 'Importación de tu planilla',
    texto:
      'Subís el Excel que ya usás. Reconoce a los jugadores aunque el nombre esté escrito distinto y te muestra qué va a pasar antes de guardar nada.',
  },
];

export const proximoPartidoEjemplo = {
  rival: 'Marcelo Sanhueza',
  fecha: 'sáb 14 · 10:00',
  lugar: 'Club Alta Barda · cancha 3',
};
