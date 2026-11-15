// A dónde vuelve la ficha del jugador: la página desde la que se llegó (decisión 102). Los links a la
// ficha la mandan en el estado de la navegación.
export type VueltaDeLaFicha = { ruta: string; etiqueta: string };

export function estadoParaLaFicha(vuelta: VueltaDeLaFicha) {
  return { vuelta };
}

// Sin estado (un link compartido, otra pestaña), la ficha no sabe de dónde se llegó.
export function vueltaDelEstado(estado: unknown): VueltaDeLaFicha | null {
  const vuelta = (estado as { vuelta?: Partial<VueltaDeLaFicha> } | null)?.vuelta;
  if (typeof vuelta?.ruta !== 'string' || typeof vuelta.etiqueta !== 'string') return null;
  return { ruta: vuelta.ruta, etiqueta: vuelta.etiqueta };
}
