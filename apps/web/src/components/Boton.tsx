import type { ButtonHTMLAttributes } from 'react';
import { Link, type LinkProps } from 'react-router-dom';

type Variante = 'principal' | 'organizador' | 'secundario' | 'claro';

// El principal es el noche de la barra con el texto blanco: el color queda para los estados
// (decisión 115). "organizador" es el mismo botón; queda el nombre para no tocar cada pantalla. El
// secundario va en papel con borde. Con el mouse, el noche se aclara a pizarra y el secundario toma
// la línea suave. "claro" es el principal sobre una superficie noche, dado vuelta: papel con texto
// noche (design.md §6, Botones), como en Ingresar (decisión 148). Deshabilitados, no reaccionan.
const principal = 'bg-noche-900 text-white not-disabled:hover:bg-pizarra-700 focus-visible:outline-noche';
const estilos: Record<Variante, string> = {
  principal,
  organizador: principal,
  secundario: 'border border-linea bg-papel text-noche not-disabled:hover:bg-linea-suave focus-visible:outline-noche',
  claro: 'bg-papel text-noche-900 not-disabled:hover:bg-linea-suave focus-visible:outline-white',
};

// not-disabled y no enabled: un link nunca es :enabled, y así el mismo aspecto vale para <button> y <Link>.
// Al apretar, apenas más chico; con el teclado, un anillo de 2 px en noche, o en blanco sobre noche.
// Es un outline y no una sombra: el producto no tiene sombras (design.md §2).
const estados =
  'motion-safe:transition-[transform,background-color] motion-safe:duration-100 not-disabled:active:scale-[.97] focus-visible:outline-2 focus-visible:outline-offset-2';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: Variante;
  grande?: boolean;
};

// Las clases salen de un solo lugar: el botón y el link con aspecto de botón (BotonLink) las comparten.
function clasesDeBoton(variante: Variante = 'secundario', grande = false, className = '') {
  return `inline-flex ${grande ? 'h-12' : 'h-10'} items-center justify-center gap-2 rounded-control px-4 text-[15px] font-medium disabled:opacity-40 ${estados} ${estilos[variante]} ${className}`;
}

export function Boton({ variante, grande, type = 'button', className, ...props }: Props) {
  return <button type={type} className={clasesDeBoton(variante, grande, className)} {...props} />;
}

// Un link que se ve como botón: navegar es un link, así se abre en otra pestaña y se ve a dónde lleva.
export function BotonLink({ variante, grande, className, ...props }: LinkProps & { variante?: Variante; grande?: boolean }) {
  return <Link className={clasesDeBoton(variante, grande, className)} {...props} />;
}
