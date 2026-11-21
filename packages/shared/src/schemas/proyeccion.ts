// Las proyecciones de ranking (F20): docs/pantallas/jugador/que-esta-en-juego.html, en la web
// pública (decisión 120). Las calcula la API con la misma cuenta que el cierre; no es IA (decisión 117).
import type { Instancia } from './circuito';
import type { InstanciaDeLaFicha } from './ficha';

// Cómo queda el jugador si termina el torneo en esa instancia.
export type EscenarioDeProyeccion = {
  instancia: Instancia;
  // Los que le da esa instancia, según la tabla de puntos.
  puntos: number;
  // Su acumulado, con esos puntos en el casillero de este torneo del calendario.
  acumulado: number;
  // null si no está en la categoría del ranking.
  puesto: number | null;
};

export type ProyeccionDelJugador = {
  organizacion: string;
  torneoId: number;
  // "Otoño 2026 · Tercera"
  torneo: string;
  // "Otoño": el casillero que reemplaza.
  torneoDelCalendario: string;
  jugadorId: number;
  nombre: string;
  apellido: string;
  // Hasta dónde llegó hasta ahora. null antes del sorteo.
  situacion: InstanciaDeLaFicha | null;
  hoy: { puntos: number; puesto: number | null };
  // Lo que tiene hoy en el casillero de este torneo del calendario, y de qué año es.
  defiende: { puntos: number; anio: number } | null;
  // Con un solo escenario: su torneo ya está definido.
  definido: boolean;
  // De la peor a la mejor instancia. La primera es la que ya tiene asegurada.
  escenarios: EscenarioDeProyeccion[];
  numeroUno: {
    // La peor instancia con la que queda primero. null si en ninguna.
    desde: Instancia | null;
    // El mejor de los demás con lo que ya tienen asegurado.
    rival: {
      jugadorId: number;
      nombre: string;
      apellido: string;
      puntos: number;
      // null si no juega este torneo.
      asegurada: Instancia | null;
      sigueEnJuego: boolean;
    } | null;
  };
};
