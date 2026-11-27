import { instancias, type Instancia, type InstanciaDeLaFicha, type PartidoDeLaFicha } from '@setpoint/shared';
import { rotuloDeRonda } from '../cuadros/cuadro';

// "zona C", "final", o en el cuadro consuelo "semis · Cuadro consuelo".
export function donde(partido: Pick<PartidoDeLaFicha, 'grupo' | 'ronda' | 'rondas' | 'cuadro'>, consuelo: string) {
  if (partido.grupo) return `zona ${partido.grupo}`;
  const ronda = rotuloDeRonda(partido.ronda!, partido.rondas!);
  return partido.cuadro === 'complementaria' ? `${ronda} · ${consuelo}` : ronda;
}

// Con los mismos nombres que la tabla de puntos de Tu circuito: "Finalista", "Cuartos de final".
const etiqueta = (clave: Instancia) => instancias.find((i) => i.clave === clave)!.etiqueta;
const PERDIO_EN: Instancia[] = ['finalista', 'semifinalista', 'cuartos', 'octavos'];

// Hasta dónde llegó (decisión 072): "Finalista", "En semis", "Quedó en la zona". También lo usa
// Qué está en juego (F20).
export function hastaDonde(instancia: InstanciaDeLaFicha) {
  if (instancia.tipo === 'zona') return instancia.enJuego ? 'En la zona' : 'Quedó en la zona';

  const { ronda, rondas } = instancia;
  if (instancia.campeon) return etiqueta('campeon');
  if (instancia.enJuego) {
    const enLaRonda = rotuloDeRonda(ronda, rondas);
    return enLaRonda === 'final' || enLaRonda.startsWith('ronda') ? `En la ${enLaRonda}` : `En ${enLaRonda}`;
  }
  const clave = PERDIO_EN[rondas - ronda];
  return clave ? etiqueta(clave) : `Ronda ${ronda}`;
}
