import type { ResumenConvocatoria } from '@setpoint/shared';
import { pedir } from '../../lib/api';

export function listarConvocatorias(slug: string) {
  return pedir<ResumenConvocatoria[]>('GET', `/api/organizaciones/${slug}/torneos`);
}
