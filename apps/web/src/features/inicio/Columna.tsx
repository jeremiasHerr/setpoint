import { useId, type ReactNode } from 'react';
import { Numero } from '../../components/Numero';

// El color de cada columna es el de su estado: amarillo lo que se prepara, lona lo que se cobra y
// azul lo que se juega. Lo terminado queda neutro, en el cemento (decisión 116).
type Tono = 'amarillo' | 'lona' | 'azul' | 'neutro';

const tonos: Record<Tono, string> = {
  amarillo: 'border-amarillo-borde bg-amarillo-fondo',
  lona: 'border-lona-borde bg-lona-fondo',
  azul: 'border-azul-borde bg-azul-fondo',
  neutro: 'border-linea-cemento',
};

type Props = {
  titulo: string;
  tono: Tono;
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
export function Columna({ titulo, tono, marca, cantidad, ayuda, vacia, children, pie }: Props) {
  const id = useId();
  return (
    <section aria-labelledby={id} className={`flex flex-col gap-2.5 rounded-superficie border p-3 xl:min-h-[calc(100vh-210px)] ${tonos[tono]}`}>
      <div className="flex items-center justify-between gap-2 px-1.5 pt-1">
        <h2 id={id} className="flex items-center gap-2 text-[15px] font-semibold">
          <span className={`size-2.5 shrink-0 rounded-[3px] ${marca}`} />
          {titulo}
        </h2>
        <Numero className="flex h-6 min-w-6 items-center justify-center rounded-full bg-papel px-1.5 text-xs">{cantidad}</Numero>
      </div>
      <p className="px-1.5 text-[13px] text-pizarra-500">{ayuda}</p>
      {cantidad === 0 && <p className="px-1.5 py-2 text-sm text-pizarra-500">{vacia}</p>}
      {children}
      {pie}
    </section>
  );
}
