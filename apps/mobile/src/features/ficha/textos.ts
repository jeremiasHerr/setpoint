import { instancias, type ClaveCuadro, type Instancia, type InstanciaDeLaFicha } from '@setpoint/shared';

// Mismos textos que la ficha de la web, para que las dos digan lo mismo.
const etiqueta = (clave: Instancia) => instancias.find((i) => i.clave === clave)!.etiqueta;
const PERDIO_EN: Instancia[] = ['finalista', 'semifinalista', 'cuartos', 'octavos'];
const RONDAS_DESDE_LA_FINAL = ['final', 'semis', 'cuartos', 'octavos'];

export const NOMBRE_DEL_CUADRO: Record<ClaveCuadro, string> = {
  campeonato: 'Campeonato',
  complementaria: 'Cuadro consuelo',
};

export function rotuloDeRonda(ronda: number, rondas: number) {
  return RONDAS_DESDE_LA_FINAL[rondas - ronda] ?? `ronda ${ronda}`;
}

// Hasta dónde llegó (decisión 072): "Finalista", "En semis", "Quedó en la zona".
export function hastaDonde(instancia: InstanciaDeLaFicha) {
  if (instancia.tipo === 'zona') return instancia.enJuego ? 'En la zona' : 'Quedó en la zona';
  if (instancia.campeon) return etiqueta('campeon');
  if (instancia.enJuego) {
    const enLaRonda = rotuloDeRonda(instancia.ronda, instancia.rondas);
    return enLaRonda === 'final' || enLaRonda.startsWith('ronda') ? `En la ${enLaRonda}` : `En ${enLaRonda}`;
  }
  const clave = PERDIO_EN[instancia.rondas - instancia.ronda];
  return clave ? etiqueta(clave) : `Ronda ${instancia.ronda}`;
}

export const cantidadDePuntos = (puntos: number) => `${puntos} ${puntos === 1 ? 'punto' : 'puntos'}`;
