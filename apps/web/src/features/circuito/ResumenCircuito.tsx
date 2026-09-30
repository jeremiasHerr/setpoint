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
    { rotulo: 'Categorías', valor: categorias, acento: true },
    ...(usaRanking ? [{ rotulo: 'Etapas por año', valor: etapas, acento: true }] : []),
    { rotulo: 'Jugadores', valor: jugadores, acento: false },
  ];

  return (
    <Tarjeta variante="negra" className="flex flex-col gap-4">
      <h2 className="text-[15px] font-semibold">Cómo queda tu circuito</h2>

      <dl className="flex flex-col gap-[13px]">
        {filas.map(({ rotulo, valor, acento }, i) => (
          <div
            key={rotulo}
            className={`flex items-baseline justify-between gap-3 ${i > 0 ? 'border-t border-borde-oscuro pt-[13px]' : ''}`}
          >
            <dt className="text-sm text-gris-400">{rotulo}</dt>
            <dd>
              <Numero className={`text-2xl font-medium tracking-[-0.02em] ${acento ? 'text-lima' : 'text-white'}`}>{valor}</Numero>
            </dd>
          </div>
        ))}
      </dl>

      <p className="text-[13px] leading-[1.45] text-gris-400">
        {usaRanking
          ? 'El ranking empieza a moverse cuando cierres tu primer torneo.'
          : 'El ranking anual está apagado: cada torneo termina con su propia tabla de posiciones, sin acumular puntos.'}
      </p>
    </Tarjeta>
  );
}
