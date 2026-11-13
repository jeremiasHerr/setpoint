import { useId, type ReactNode } from 'react';
import { Numero } from '../../components/Numero';

type Props = {
  titulo: string;
  // Las clases del cuadradito de color del título.
  marca: string;
  cantidad: number;
  ayuda: string;
  // Lo que dice sin tarjetas, para que la columna no quede como un hueco.
  vacia: string;
  children?: ReactNode;
  pie?: ReactNode;
};

// Una de las cuatro columnas del inicio, por el momento en que está cada torneo (decisión 094).
// En el escritorio llegan hasta abajo de la pantalla, aunque tengan una sola tarjeta.
export function Columna({ titulo, marca, cantidad, ayuda, vacia, children, pie }: Props) {
  const id = useId();
  return (
    <section aria-labelledby={id} className="flex flex-col gap-2.5 rounded-superficie bg-linea-suave p-3 xl:min-h-[calc(100vh-290px)]">
      <div className="flex items-center justify-between gap-2 px-1.5 pt-1">
        <h2 id={id} className="flex items-center gap-2 text-[15px] font-semibold">
          <span className={`size-2.5 shrink-0 rounded-[3px] ${marca}`} />
          {titulo}
        </h2>
        <Numero className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-1.5 text-xs">{cantidad}</Numero>
      </div>
      <p className="px-1.5 text-[13px] text-gris-500">{ayuda}</p>
      {cantidad === 0 && <p className="px-1.5 py-2 text-sm text-gris-500">{vacia}</p>}
      {children}
      {pie}
    </section>
  );
}
