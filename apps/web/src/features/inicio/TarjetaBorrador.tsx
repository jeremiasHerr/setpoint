import { useNavigate } from 'react-router-dom';
import { Boton } from '../../components/Boton';
import { TarjetaDeColumna } from './TarjetaDeColumna';
import type { TorneoEnBorrador } from './tiposDeInicio';

// Los borradores no los ve ningún jugador: lo único que se puede hacer con ellos es terminarlos.
export function TarjetaBorrador({ torneo }: { torneo: TorneoEnBorrador }) {
  const navegar = useNavigate();
  return (
    <TarjetaDeColumna
      calendario={torneo.calendario}
      nombre={torneo.nombre}
      detalle={torneo.detalle}
      acciones={
        <Boton className="grow" onClick={() => navegar(`/torneos/${torneo.id}`)}>
          Seguir editando
        </Boton>
      }
    />
  );
}
