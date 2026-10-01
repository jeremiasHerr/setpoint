import { Tarjeta } from '../../components/Tarjeta';

type Variante = 'numero' | 'acento' | 'importe' | 'texto';

type Fila = {
  rotulo: string;
  valor: string | number;
  variante?: Variante;
};

const estilosValor: Record<Variante, string> = {
  numero: 'font-mono text-2xl font-medium tracking-[-0.02em] text-white tabular-nums',
  acento: 'font-mono text-2xl font-medium tracking-[-0.02em] text-lima tabular-nums',
  importe: 'font-mono text-lg font-medium tracking-[-0.02em] text-white tabular-nums',
  texto: 'text-sm font-medium text-gris-400',
};

type Props = {
  titulo: string;
  filas: Fila[];
  nota?: string;
};

// La tarjeta negra de la pantalla de inicio: los números de la organización de un vistazo.
export function ResumenOrganizacion({ titulo, filas, nota }: Props) {
  return (
    <Tarjeta variante="negra" className="flex flex-col gap-4">
      <h2 className="text-[15px] font-semibold">{titulo}</h2>

      <dl className="flex flex-col gap-[13px]">
        {filas.map(({ rotulo, valor, variante = 'numero' }, i) => (
          <div
            key={rotulo}
            className={`flex items-baseline justify-between gap-3 ${i > 0 ? 'border-t border-borde-oscuro pt-[13px]' : ''}`}
          >
            <dt className="text-sm text-gris-400">{rotulo}</dt>
            <dd className={`shrink-0 ${estilosValor[variante]}`}>{valor}</dd>
          </div>
        ))}
      </dl>

      {nota && <p className="text-[13px] leading-[1.45] text-gris-400">{nota}</p>}
    </Tarjeta>
  );
}
