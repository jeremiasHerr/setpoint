import { MARCA, type EstadoDeMarca } from './marcas';

type Props = {
  // En orden: primero lo hecho, después lo que falta.
  tramos: { cantidad: number; estado: EstadoDeMarca }[];
  // Qué cuenta la barra, para lectores de pantalla: "28 de 32 pagaron".
  rotulo: string;
};

// La barra de marcas de design.md §6, en su tamaño chico: una marca por unidad real (un lugar
// del cupo, un partido).
export function BarraDeMarcas({ tramos, rotulo }: Props) {
  const marcas = tramos.flatMap(({ cantidad, estado }) => Array.from({ length: Math.max(0, cantidad) }, () => estado));

  return (
    <div role="img" aria-label={rotulo} className={`flex ${marcas.length > 40 ? 'gap-px' : 'gap-0.5'}`}>
      {marcas.map((estado, i) => (
        <span key={i} className={`h-[18px] min-w-0 flex-1 rounded-[2px] ${MARCA[estado]}`} />
      ))}
    </div>
  );
}
