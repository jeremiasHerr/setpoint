// La búsqueda en el padrón de quien se inscribe por primera vez (decisión 051). Es un buscador,
// no una lista: no muestra nada hasta 3 letras y como mucho 5 resultados.

export const MAXIMO_DE_RESULTADOS = 5;
const LETRAS_MINIMAS = 3;

// "Pérez" y "perez" son lo mismo.
export function normalizar(texto: string) {
  return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
}

function palabras(texto: string) {
  return normalizar(texto).split(/\s+/).filter(Boolean);
}

type ConNombre = { nombre: string; apellido: string };

// Cuántas palabras de lo que escribió aparecen en el nombre, comparando palabra por palabra.
// Las de menos de 3 letras no cuentan. Así "Lucas Matías Bravo" encuentra a "Lucas Bravo".
export function coincidencias(perfil: ConNombre, consulta: string) {
  const delPerfil = palabras(`${perfil.nombre} ${perfil.apellido}`);
  return palabras(consulta)
    .filter((p) => p.length >= LETRAS_MINIMAS)
    .filter((p) => delPerfil.some((d) => d.includes(p))).length;
}

// Los que coinciden en al menos una palabra, primero los que coinciden en más.
export function buscar<T extends ConNombre>(perfiles: T[], consulta: string): T[] {
  return perfiles
    .map((perfil) => ({ perfil, puntos: coincidencias(perfil, consulta) }))
    .filter((c) => c.puntos > 0)
    .sort((a, b) => b.puntos - a.puntos || a.perfil.apellido.localeCompare(b.perfil.apellido, 'es'))
    .slice(0, MAXIMO_DE_RESULTADOS)
    .map((c) => c.perfil);
}

// Otro perfil de la categoría con el mismo apellido y el mismo nombre, o la misma inicial: la
// vinculación queda para que la revise la organización (decisión 051).
export function esPosibleHomonimo(elegido: ConNombre & { id: number }, otros: (ConNombre & { id: number })[]) {
  const apellido = normalizar(elegido.apellido);
  const inicial = normalizar(elegido.nombre)[0];
  return otros.some((o) => o.id !== elegido.id && normalizar(o.apellido) === apellido && normalizar(o.nombre)[0] === inicial);
}
