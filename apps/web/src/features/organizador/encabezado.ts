// Lo que comparten las pantallas del organizador en el encabezado.

export const navegacionOrganizador = [
  { etiqueta: 'Inicio', href: '/inicio' },
  { etiqueta: 'Circuito', href: '/circuito' },
  { etiqueta: 'Padrón', href: '/padron' },
];

export function iniciales(nombre: string) {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((palabra) => palabra[0]?.toUpperCase() ?? '')
    .join('');
}
