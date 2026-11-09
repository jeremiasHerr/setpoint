import { useNavigate } from 'react-router-dom';
import { BarraProgreso } from '../../components/BarraProgreso';
import { Boton } from '../../components/Boton';
import { Etiqueta } from '../../components/Etiqueta';
import { Numero } from '../../components/Numero';
import { Tarjeta } from '../../components/Tarjeta';
import type { TorneoEnJuego } from './torneosEjemplo';

// Desde el sorteo confirmado hasta el cierre: lleva al tablero, que es donde se sigue el torneo (decisión 080).
export function TarjetaTorneoEnJuego({ torneo }: { torneo: TorneoEnJuego }) {
  const navegar = useNavigate();
  return (
    <Tarjeta className="grid items-center gap-4 p-5 xl:grid-cols-[minmax(0,1fr)_260px_120px] xl:gap-6">
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <h3 className="text-lg font-semibold tracking-[-0.02em]">{torneo.nombre}</h3>
          <Etiqueta variante="negra">{torneo.fase}</Etiqueta>
        </div>
        <p className="text-sm text-gris-500">{torneo.detalle}</p>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <span className="text-[13px] text-gris-500">Partidos jugados</span>
          <Numero className="text-sm font-medium">
            {torneo.partidosJugados} <span className="text-gris-400">/ {torneo.partidosTotales}</span>
          </Numero>
        </div>
        <BarraProgreso valor={torneo.partidosJugados} total={torneo.partidosTotales} rotulo="Partidos jugados" />
        {torneo.partidosVencidos > 0 && (
          <p className="text-[13px] text-rojo-texto">
            <Numero>{torneo.partidosVencidos}</Numero> vencidos sin resultado
          </p>
        )}
      </div>

      <Boton onClick={() => navegar(`/torneos/${torneo.id}/tablero`)}>Ver tablero</Boton>
    </Tarjeta>
  );
}
