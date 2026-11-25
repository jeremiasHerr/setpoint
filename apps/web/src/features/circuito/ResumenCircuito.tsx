import { Numero } from '../../components/Numero';
import { Tarjeta } from '../../components/Tarjeta';

type Props = {
  usaRanking: boolean;
  categorias: number;
  etapas: number;
  jugadores: number;
};

export function ResumenCircuito({ usaRanking, categorias, etapas, jugadores }: Props) {
  const filas = [
    { rotulo: 'Categorías', valor: categorias },
    ...(usaRanking ? [{ rotulo: 'Torneos por año', valor: etapas }] : []),
    { rotulo: 'Jugadores', valor: jugadores },
  ];

  return (
    <Tarjeta variante="noche" className="flex flex-col gap-4">
      <h2 className="text-[15px] font-semibold">Cómo queda tu circuito</h2>

      <dl className="flex flex-col gap-[13px]">
        {filas.map(({ rotulo, valor }, i) => (
          <div
            key={rotulo}
            className={`flex items-baseline justify-between gap-3 ${i > 0 ? 'border-t border-borde-noche pt-[13px]' : ''}`}
          >
            <dt className="text-sm text-pizarra-400">{rotulo}</dt>
            <dd>
              <Numero className={`text-2xl font-medium tracking-[-0.02em] text-white`}>{valor}</Numero>
            </dd>
          </div>
        ))}
      </dl>

      <p className="text-[13px] leading-[1.45] text-pizarra-400">
        {usaRanking
          ? 'Cada torneo del circuito que cerrás actualiza el ranking de su categoría.'
          : 'El ranking anual está apagado: cada torneo termina con su propia tabla de posiciones, sin acumular puntos.'}
      </p>
    </Tarjeta>
  );
}
