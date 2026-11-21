import type { Instancia } from '@setpoint/shared';
import { NOMBRE_DEL_PRINCIPAL } from '../cuadros/cuadro';

// Como se lee después de "Si llega a…": hasta dónde llega y ahí pierde, o gana el torneo.
const HASTA: Record<Instancia, string> = {
  campeon: 'Campeón',
  finalista: 'Final',
  semifinalista: 'Semifinal',
  cuartos: 'Cuartos',
  octavos: 'Octavos',
  participacion: 'Participación',
};

// La primera es la que ya tiene asegurada: la que recibe si pierde el próximo partido.
const PIERDE_EN: Partial<Record<Instancia, string>> = {
  finalista: 'Pierde la final',
  semifinalista: 'Pierde en semis',
  cuartos: 'Pierde en cuartos',
  octavos: 'Pierde en octavos',
  participacion: `No pasa al ${NOMBRE_DEL_PRINCIPAL}`,
};

export function nombreDelEscenario(instancia: Instancia, esLaAsegurada: boolean) {
  return (esLaAsegurada && PIERDE_EN[instancia]) || HASTA[instancia];
}
