import type { Circuito, ConexionMercadoPago, ConfiguracionCircuito, CuentaMercadoPago } from '@setpoint/shared';
import { pedir } from '../../lib/api';

// La cuenta con la que cobra la organización (decisión 137). Conectar devuelve el link de
// MercadoPago; MercadoPago la devuelve a Tu circuito.
export function conectarMercadoPago(slug: string) {
  return pedir<ConexionMercadoPago>('POST', `/api/organizaciones/${slug}/mercadopago`);
}

export function desconectarMercadoPago(slug: string) {
  return pedir<CuentaMercadoPago>('DELETE', `/api/organizaciones/${slug}/mercadopago`);
}

export function obtenerCircuito(slug: string) {
  return pedir<Circuito>('GET', `/api/organizaciones/${slug}/circuito`);
}

export function guardarCircuito(slug: string, configuracion: ConfiguracionCircuito) {
  return pedir<Circuito>('PUT', `/api/organizaciones/${slug}/circuito`, configuracion);
}
