// La navegación del torneo en la web de la organización (decisión 095): qué pestaña se puede abrir
// en cada estado. Lógica pura: recibe lo que ya se leyó. No toca la base.
import { EstadoTorneo } from '@prisma/client';
import type { PestanaDelTorneo } from '@setpoint/shared';

// Desde que se confirma el sorteo hay partidos para seguir y cargar. Con el torneo cerrado se siguen
// abriendo: un resultado se corrige también después del cierre (decisión 055).
const CON_PARTIDOS: EstadoTorneo[] = [
  EstadoTorneo.ZONAS_GENERADAS,
  EstadoTorneo.GRUPOS_EN_CURSO,
  EstadoTorneo.ELIMINATORIAS,
  EstadoTorneo.FINALIZADO,
];

// campeonesDefinidos: los cuadros tienen todos sus resultados. Solo se mira en las eliminatorias.
export function pestanasDisponibles(estado: EstadoTorneo, campeonesDefinidos: boolean): Record<PestanaDelTorneo, boolean> {
  const conPartidos = CON_PARTIDOS.includes(estado);
  return {
    // Siempre: después del sorteo siguen ahí la conciliación y las devoluciones.
    inscripciones: true,
    // El Sorteo de zonas: se sortea con la inscripción cerrada, y después muestra cómo quedaron.
    zonas: estado === EstadoTorneo.INSCRIPCIONES_CERRADAS || conPartidos,
    tablero: conPartidos,
    resultados: conPartidos,
    // Lo mismo que pide la pantalla del cierre: los cuadros terminados, o el torneo ya cerrado.
    cierre: estado === EstadoTorneo.FINALIZADO || (estado === EstadoTorneo.ELIMINATORIAS && campeonesDefinidos),
  };
}

// Se edita en borrador y mientras la inscripción está abierta en todas las categorías de la
// convocatoria. Después, el sorteo ya usó el formato.
export function convocatoriaEditable(estados: EstadoTorneo[]) {
  return estados.every((e) => e === EstadoTorneo.BORRADOR) || estados.every((e) => e === EstadoTorneo.PUBLICADO);
}
