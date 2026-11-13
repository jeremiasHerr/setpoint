import { useNavigate } from 'react-router-dom';
import { BarraDeMarcas } from '../../components/BarraDeMarcas';
import { Boton } from '../../components/Boton';
import { Etiqueta } from '../../components/Etiqueta';
import { Numero } from '../../components/Numero';
import { TarjetaDeColumna } from './TarjetaDeColumna';
import type { TorneoEnJuego } from './tiposDeInicio';

// Desde el sorteo confirmado hasta el cierre: lleva al tablero, que es donde se sigue el torneo (decisión 080).
export function TarjetaTorneoEnJuego({ torneo }: { torneo: TorneoEnJuego }) {
  const navegar = useNavigate();
  const { partidosJugados: jugados, partidosVencidos: vencidos, partidosTotales: total } = torneo;

  return (
    <TarjetaDeColumna
      calendario={torneo.calendario}
      nombre={torneo.nombre}
      detalle={torneo.detalle}
      etiqueta={<Etiqueta variante="negra">{torneo.fase}</Etiqueta>}
      acciones={
        <Boton variante="organizador" className="grow font-semibold" onClick={() => navegar(`/torneos/${torneo.id}/tablero`)}>
          Ver el tablero
        </Boton>
      }
    >
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-2 text-[13px]">
          <span className="text-gris-700">Partidos jugados</span>
          <Numero className="text-sm font-medium">
            {jugados} <span className="text-gris-400">/ {total}</span>
          </Numero>
        </div>
        <BarraDeMarcas
          rotulo={`${jugados} de ${total} partidos jugados${vencidos > 0 ? `, ${vencidos} vencidos` : ''}`}
          tramos={[
            { cantidad: jugados, color: 'negro' },
            { cantidad: vencidos, color: 'rojo' },
            { cantidad: total - jugados - vencidos, color: 'linea' },
          ]}
        />
        {vencidos > 0 && (
          <p className="text-[13px] text-rojo-texto">
            <Numero>{vencidos}</Numero> {vencidos === 1 ? 'vencido' : 'vencidos'} sin resultado
          </p>
        )}
      </div>
    </TarjetaDeColumna>
  );
}
