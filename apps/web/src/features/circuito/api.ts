import type { Circuito, ConfiguracionCircuito } from '@setpoint/shared';
import { pedir } from '../../lib/api';

export function obtenerCircuito(slug: string) {
  return pedir<Circuito>('GET', `/api/organizaciones/${slug}/circuito`);
}

export function guardarCircuito(slug: string, configuracion: ConfiguracionCircuito) {
  return pedir<Circuito>('PUT', `/api/organizaciones/${slug}/circuito`, configuracion);
}
