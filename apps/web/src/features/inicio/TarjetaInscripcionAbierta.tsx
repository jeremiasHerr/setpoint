import { useNavigate } from 'react-router-dom';
import { Boton } from '../../components/Boton';
import { BotonCopiarLink } from './BotonCopiarLink';
import { CuentaDelCupo, TarjetaDeColumna } from './TarjetaDeColumna';
import type { TorneoConInscripcionAbierta } from './tiposDeInicio';

export function TarjetaInscripcionAbierta({ torneo }: { torneo: TorneoConInscripcionAbierta }) {
  const navegar = useNavigate();

  return (
    <TarjetaDeColumna
      calendario={torneo.calendario}
      nombre={torneo.nombre}
      detalle={torneo.detalle}
      acciones={
        <>
          <Boton className="grow" onClick={() => navegar(`/torneos/${torneo.id}/inscripciones`)}>
            Inscripciones
          </Boton>
          <BotonCopiarLink ruta={`/torneos/${torneo.id}`} />
        </>
      }
    >
      <CuentaDelCupo pagaron={torneo.pagaron} cupo={torneo.cupo} />
    </TarjetaDeColumna>
  );
}
