import { useEffect, useState } from 'react';
import { Boton } from '../../components/Boton';
import { leerSesion } from '../auth/sesion';

// Copia un link público de la organización para compartir en el grupo: el del torneo (F12), el
// del ranking (F09) o el del torneo en vivo (F10). La ruta va después de /c/:slug. Sin className,
// tiene el tamaño chico de las tarjetas del inicio.
type Props = { ruta: string; variante?: 'principal'; texto?: string; className?: string };

export function BotonCopiarLink({ ruta, variante, texto = 'Copiar link', className = 'h-[38px] self-start px-3.5 text-sm' }: Props) {
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (!copiado) return;
    const espera = setTimeout(() => setCopiado(false), 2000);
    return () => clearTimeout(espera);
  }, [copiado]);

  async function copiar() {
    const slug = leerSesion()?.organizacion.slug;
    if (!slug) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/c/${slug}${ruta}`);
      setCopiado(true);
    } catch {
      // Sin permiso para el portapapeles no hay nada que hacer desde acá.
    }
  }

  return (
    <Boton onClick={copiar} variante={variante} className={className}>
      <span aria-live="polite">{copiado ? 'Copiado' : texto}</span>
    </Boton>
  );
}
