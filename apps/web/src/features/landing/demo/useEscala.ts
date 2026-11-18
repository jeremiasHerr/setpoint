import { useLayoutEffect, useRef, useState } from 'react';

// El demo se dibuja en un lienzo de tamaño fijo (1280 o 360 de ancho) y se achica con transform al ancho
// de su ventana. No se usa zoom: las posiciones del cursor salen de offsetLeft/offsetTop sin escala.
export function useEscala(anchoDelLienzo: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [escala, setEscala] = useState(1);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const medir = () => setEscala(el.clientWidth / anchoDelLienzo);
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    return () => observador.disconnect();
  }, [anchoDelLienzo]);

  return [ref, escala] as const;
}
