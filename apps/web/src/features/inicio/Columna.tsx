import { useId, type ReactNode } from 'react';
import { Numero } from '../../components/Numero';

type Props = {
  titulo: string;
  // Las clases de la marca de color del título: una versión clara de cada estado, para leerse sobre noche.
  marca: string;
  cantidad: number;
  ayuda: string;
  // Lo que dice sin tarjetas, para que la columna no quede como un hueco.
  vacia: string;
  children?: ReactNode;
  pie?: ReactNode;
};

// Una de las cuatro columnas del inicio, por el momento en que está cada torneo (decisión 094).
// Es un recuadro noche con las tarjetas en papel adentro; el estado lo dice la marca del título
// (decisión 123). En el escritorio llegan hasta abajo de la pantalla, aunque tengan una sola tarjeta.
export function Columna({ titulo, marca, cantidad, ayuda, vacia, children, pie }: Props) {
  const id = useId();
  return (
    <section aria-labelledby={id} className="flex flex-col gap-2.5 rounded-superficie bg-noche p-4 text-white xl:min-h-[calc(100vh-210px)]">
      <div className="flex items-center justify-between gap-2">
        <h2 id={id} className="flex items-center gap-2 text-base font-semibold">
          <span className={`size-[9px] shrink-0 rounded-[2px] ${marca}`} />
          {titulo}
        </h2>
        <Numero className="flex h-6 min-w-6 items-center justify-center rounded-full border border-borde-noche bg-noche-2 px-2 text-xs">{cantidad}</Numero>
      </div>
      <p className="text-[13px] text-pizarra-400">{ayuda}</p>
      {cantidad === 0 && <p className="py-1 text-sm">{vacia}</p>}
      {children}
      {pie}
    </section>
  );
}
