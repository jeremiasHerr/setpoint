type Color = 'negro' | 'lima';

const estilos: Record<Color, string> = {
  negro: 'bg-negro',
  lima: 'bg-lima',
};

type Props = {
  valor: number;
  total: number;
  color?: Color;
  // Qué mide la barra, para lectores de pantalla.
  rotulo: string;
};

export function BarraProgreso({ valor, total, color = 'negro', rotulo }: Props) {
  const porcentaje = total > 0 ? Math.min(100, (valor / total) * 100) : 0;

  return (
    <div
      role="progressbar"
      aria-label={rotulo}
      aria-valuenow={valor}
      aria-valuemin={0}
      aria-valuemax={total}
      className="h-1.5 overflow-hidden rounded-full bg-linea-suave"
    >
      <div className={`h-full ${estilos[color]}`} style={{ width: `${porcentaje}%` }} />
    </div>
  );
}
