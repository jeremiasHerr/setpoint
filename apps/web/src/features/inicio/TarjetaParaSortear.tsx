import { useNavigate } from 'react-router-dom';
import { Boton } from '../../components/Boton';
import { CuentaDelCupo, TarjetaDeColumna } from './TarjetaDeColumna';
import type { TorneoParaSortear } from './tiposDeInicio';

// La inscripción cerró y falta el sorteo: es lo próximo que hay que hacer con esta categoría.
export function TarjetaParaSortear({ torneo }: { torneo: TorneoParaSortear }) {
  const navegar = useNavigate();

  return (
    <TarjetaDeColumna
      calendario={torneo.calendario}
      nombre={torneo.nombre}
      detalle={torneo.detalle}
      acciones={
        <>
          <Boton variante="organizador" className="grow font-semibold" onClick={() => navegar(`/torneos/${torneo.id}/sorteo`)}>
            Sortear las zonas
          </Boton>
          <Boton onClick={() => navegar(`/torneos/${torneo.id}/inscripciones`)}>Inscripciones</Boton>
        </>
      }
    >
      <CuentaDelCupo pagaron={torneo.pagaron} cupo={torneo.cupo} />
    </TarjetaDeColumna>
  );
}
