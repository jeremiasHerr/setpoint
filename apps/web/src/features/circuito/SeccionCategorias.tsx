import { Tarjeta } from '../../components/Tarjeta';
import { ListaEditable } from './ListaEditable';

type Props = {
  categorias: string[];
  alCambiar: (categorias: string[]) => void;
};

// Fuera del bloque del ranking: todo torneo tiene categoría, aunque sea suelto.
export function SeccionCategorias({ categorias, alCambiar }: Props) {
  return (
    <Tarjeta className="flex flex-col gap-[11px] p-5">
      <h2 className="text-[17px] font-semibold">Categorías</h2>
      <ListaEditable items={categorias} alCambiar={alCambiar} rotuloNuevo="Nombre de la categoría" />
      <p className="text-[13px] text-gris-500">Cada torneo se juega en una categoría. Con ranking anual, cada una tiene su tabla independiente.</p>
    </Tarjeta>
  );
}
