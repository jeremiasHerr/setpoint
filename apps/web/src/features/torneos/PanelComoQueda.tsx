import type { Formato } from '@setpoint/shared';
import type { ReactNode } from 'react';
import { Numero } from '../../components/Numero';
import { Tarjeta } from '../../components/Tarjeta';
import { rangoDeDias } from './texto';

const DIAS_POR_SEMANA = 7;

type Props = {
  // Sale de calcularFormato, igual que el cronograma de la sección de plazos.
  formato: Formato;
  tieneComplementaria: boolean;
  fechaInicio: string | null;
  // Con más de una categoría, cada una juega su propio torneo con este formato.
  variasCategorias: boolean;
  // null si el torneo no suma al ranking: circuito sin ranking o torneo suelto.
  puntosCampeon: number | null;
};

function Punto({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-center gap-2.5 text-sm">
      <span className="size-[5px] shrink-0 rounded-full bg-lima" />
      <span>{children}</span>
    </li>
  );
}

export function PanelComoQueda({ formato, tieneComplementaria, fechaInicio, variasCategorias, puntosCampeon }: Props) {
  const filas = [
    { rotulo: 'Partidos de zona', valor: formato.partidosZona },
    { rotulo: 'Cuadro Campeonato', valor: formato.partidosCampeonato },
    ...(tieneComplementaria ? [{ rotulo: 'Cuadro Complementaria', valor: formato.partidosComplementaria }] : []),
  ];

  const enSemanas = formato.duracionDias % DIAS_POR_SEMANA === 0;
  const duracion = enSemanas ? formato.duracionDias / DIAS_POR_SEMANA : formato.duracionDias;
  const unidad = enSemanas ? (duracion === 1 ? 'semana' : 'semanas') : duracion === 1 ? 'día' : 'días';

  return (
    <Tarjeta variante="negra" className="flex flex-col gap-[18px]">
      <h2 className="text-base font-semibold">Cómo queda</h2>

      <dl className="flex flex-col gap-3">
        {filas.map(({ rotulo, valor }) => (
          <div key={rotulo} className="flex items-center justify-between gap-3">
            <dt className="text-[15px] text-gris-400">{rotulo}</dt>
            <dd>
              <Numero className="text-base">{valor}</Numero>
            </dd>
          </div>
        ))}
        <div className="flex items-baseline justify-between gap-3 border-t border-borde-oscuro pt-3">
          <dt className="text-[15px] font-semibold">Total</dt>
          <dd className="flex items-baseline gap-[7px]">
            <Numero className="text-[30px] font-medium tracking-[-0.03em] text-lima">{formato.partidosTotal}</Numero>
            <span className="text-sm text-gris-400">partidos</span>
          </dd>
        </div>
      </dl>

      <ul className="flex flex-col gap-[9px] border-t border-borde-oscuro pt-[18px]">
        <Punto>
          Todos juegan mínimo <Numero>{formato.minimoPartidosPorJugador}</Numero> partidos
        </Punto>
        <Punto>
          Dura <Numero>{duracion}</Numero> {unidad}
          {fechaInicio && formato.fechaFin && (
            <>
              , del <Numero>{rangoDeDias(fechaInicio, formato.fechaFin)}</Numero>
            </>
          )}
        </Punto>
        {puntosCampeon !== null && (
          <Punto>
            Reparte hasta <Numero>{puntosCampeon}</Numero> puntos al campeón
          </Punto>
        )}
      </ul>

      {variasCategorias && (
        <p className="text-[13px] leading-[1.45] text-gris-400">Los números son por categoría: cada una juega su propio torneo.</p>
      )}
    </Tarjeta>
  );
}
