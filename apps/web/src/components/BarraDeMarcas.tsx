type Color = 'negro' | 'gris' | 'linea' | 'rojo';

const estilos: Record<Color, string> = {
  negro: 'bg-negro',
  gris: 'bg-gris-400',
  linea: 'bg-linea',
  rojo: 'bg-rojo',
};

type Props = {
  // En orden: primero lo hecho, después lo que falta.
  tramos: { cantidad: number; color: Color }[];
  // Qué cuenta la barra, para lectores de pantalla: "28 de 32 pagaron".
  rotulo: string;
};

// La barra de marcas de design.md §6, en su tamaño chico: una marca por unidad real (un lugar
// del cupo, un partido). Negro hecho, gris en curso, línea pendiente, rojo vencido.
export function BarraDeMarcas({ tramos, rotulo }: Props) {
  const marcas = tramos.flatMap(({ cantidad, color }) => Array.from({ length: Math.max(0, cantidad) }, () => color));

  return (
    <div role="img" aria-label={rotulo} className={`flex ${marcas.length > 40 ? 'gap-px' : 'gap-0.5'}`}>
      {marcas.map((color, i) => (
        <span key={i} className={`h-[18px] min-w-0 flex-1 rounded-[2px] ${estilos[color]}`} />
      ))}
    </div>
  );
}
