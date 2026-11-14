import type { ReactNode } from 'react';

// Cómo se dice un error en toda la web (decisión 099). El rojo es solo para vencimientos
// (design.md §3): un error de formulario o una acción que no se pudo hacer van en negro.

type PropsAviso = {
  // La primera frase, en negrita: "Ese código no es." Opcional.
  titulo?: ReactNode;
  children?: ReactNode;
  className?: string;
};

// Bloque con borde negro, para el error de un formulario entero o de una acción. En 15 px, el piso del
// celular: lo usa también el flujo del jugador.
export function Aviso({ titulo, children, className = '' }: PropsAviso) {
  if (!titulo && !children) return null;
  return (
    <p role="alert" className={`rounded-control border border-negro px-3.5 py-3 text-[15px] leading-[1.42] text-negro ${className}`}>
      {titulo && <strong className="font-semibold">{titulo} </strong>}
      {children}
    </p>
  );
}

type PropsMensaje = {
  // El id va en el aria-describedby del campo al que se refiere. Sin id, se anuncia como alerta.
  id?: string;
  children?: ReactNode;
  className?: string;
};

// Una línea, debajo del campo o de la acción que falló.
export function MensajeError({ id, children, className = '' }: PropsMensaje) {
  if (!children) return null;
  return (
    <p id={id} role={id ? undefined : 'alert'} className={`text-sm font-medium text-negro ${className}`}>
      {children}
    </p>
  );
}
