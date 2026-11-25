// Cómo se abrevia un torneo del calendario en los casilleros (design.md §8).
// Primavera se escribe con cuatro letras para no confundirse con Pretemporada ("pre").
const ABREVIATURAS: Record<string, string> = { primavera: 'prim' };

export function abreviarTorneo(nombre: string) {
  const minuscula = nombre.trim().toLowerCase();
  return ABREVIATURAS[minuscula] ?? minuscula.slice(0, 3);
}
