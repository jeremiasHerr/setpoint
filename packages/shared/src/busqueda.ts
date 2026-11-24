// Los buscadores de personas de la web y de la app (decisión 146): se escribe el nombre, el
// apellido o los dos, en cualquier orden, sin que importen las tildes ni las mayúsculas.

// "Quilodrán" y "quilodran" son lo mismo. Con el rango de las marcas combinables y no con
// \p{Diacritic}, para que en la app corra igual.
export function sinTildes(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

// Si cada palabra escrita está dentro de alguna del nombre completo: "juan pe" y "perez juan"
// encuentran a Juan Pérez, y "juan" a todos los Juan. Sin nada escrito, coinciden todos.
export function coincideConElNombre(persona: { nombre: string; apellido: string }, busqueda: string) {
  const escritas = sinTildes(busqueda).split(/\s+/).filter(Boolean);
  const delNombre = sinTildes(`${persona.nombre} ${persona.apellido}`).split(/\s+/);
  return escritas.every((escrita) => delNombre.some((palabra) => palabra.includes(escrita)));
}
