import type { Circuito, ResumenConvocatoria } from '@setpoint/shared';
import { diaCorto } from '../torneos/texto';
import type { TorneosDeInicio } from './torneosEjemplo';

// "Primavera 26 · Tercera y Segunda": la convocatoria es una sola aunque tenga varias categorías.
function nombreCompleto({ nombre, categorias }: ResumenConvocatoria) {
  return `${nombre} · ${categorias.join(' y ')}`;
}

function detalleDeFechas({ cierreInscripcion, fechaInicio }: ResumenConvocatoria) {
  const partes = [
    cierreInscripcion && `Cierra el ${diaCorto(cierreInscripcion)}`,
    fechaInicio && `empieza el ${diaCorto(fechaInicio)}`,
  ].filter(Boolean);
  return partes.join(' · ') || 'Sin fechas todavía';
}

// Arma la pantalla de inicio con lo que hoy sabe la API. "En juego", "Terminados" y los avisos
// salen de partidos y cierres, que todavía no existen: llegan con el sorteo (F05) y el cierre (F16).
export function aTorneosDeInicio(convocatorias: ResumenConvocatoria[], circuito: Circuito): TorneosDeInicio {
  const borradores = convocatorias.filter((c) => c.estado === 'borrador');
  const publicadas = convocatorias.filter((c) => c.estado === 'publicado');

  return {
    borradores: borradores.map((c) => ({ id: c.id, nombre: nombreCompleto(c), detalle: detalleDeFechas(c) })),
    conInscripcionAbierta: publicadas.map((c) => ({
      id: c.id,
      nombre: nombreCompleto(c),
      detalle: detalleDeFechas(c),
      pagaron: c.inscriptos,
      cupo: c.cupo,
    })),
    enJuego: [],
    terminados: [],
    totalTerminados: 0,
    avisos: [],
    jugadores: circuito.jugadores,
    categorias: circuito.categorias.length,
    recaudadoEnInscripcionesAbiertas: publicadas.reduce((suma, c) => suma + c.inscriptos * c.precio, 0),
    usaRanking: circuito.usaRanking,
  };
}
