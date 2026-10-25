import { useEffect, useState } from 'react';
import { Boton } from '../../components/Boton';
import { leerSesion } from '../auth/sesion';

// Copia el link público del torneo, el que la organización comparte en el grupo (F12).
export function BotonCopiarLink({ torneoId }: { torneoId: number }) {
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
      await navigator.clipboard.writeText(`${window.location.origin}/c/${slug}/torneos/${torneoId}`);
      setCopiado(true);
    } catch {
      // Sin permiso para el portapapeles no hay nada que hacer desde acá.
    }
  }

  return (
    <Boton onClick={copiar} className="h-[38px] px-3.5 text-sm">
      <span aria-live="polite">{copiado ? 'Copiado' : 'Copiar link'}</span>
    </Boton>
  );
}
