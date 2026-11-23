import { rutaDelTorneo } from '@setpoint/shared';
import { useEffect, useState } from 'react';
import { Boton } from '../../components/Boton';
import { leerSesion } from '../auth/sesion';

// Copia un link público de la organización para compartir en el grupo: el del torneo (F12), el
// del ranking (F09) o el del torneo en vivo (F10). El del torneo lleva su nombre (decisión 140);
// los demás pasan la ruta que va después de /c/:slug. Sin className, tiene el tamaño chico de las
// tarjetas del inicio.
type Props = {
  variante?: 'principal' | 'organizador';
  texto?: string;
  className?: string;
} & ({ ruta: string; torneo?: never } | { torneo: { id: number; slugPublico: string | null }; ruta?: never });

export function BotonCopiarLink({ ruta, torneo, variante, texto = 'Copiar link', className = 'h-[38px] self-start px-3.5 text-sm' }: Props) {
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (!copiado) return;
    const espera = setTimeout(() => setCopiado(false), 2000);
    return () => clearTimeout(espera);
  }, [copiado]);

  async function copiar() {
    const slug = leerSesion()?.organizacion.slug;
    if (!slug) return;
    const camino = torneo ? rutaDelTorneo(slug, torneo) : `/c/${slug}${ruta}`;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${camino}`);
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
