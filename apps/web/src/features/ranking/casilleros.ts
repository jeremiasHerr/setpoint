// Cómo se abrevia un torneo del calendario en los casilleros: sus tres primeras letras (design.md §8).
export function abreviarTorneo(nombre: string) {
  return nombre.trim().toLowerCase().slice(0, 3);
}
