import { BotonLink } from '../../components/Boton';
import { CuentaDelCupo, TarjetaDeColumna } from './TarjetaDeColumna';
import type { TorneoParaSortear } from './tiposDeInicio';

// La inscripción cerró y falta el sorteo: es lo próximo que hay que hacer con esta categoría.
export function TarjetaParaSortear({ torneo }: { torneo: TorneoParaSortear }) {

  return (
    <TarjetaDeColumna
      calendario={torneo.calendario}
      nombre={torneo.nombre}
      detalle={torneo.detalle}
      acciones={
        <>
          <BotonLink variante="organizador" className="grow font-semibold" to={`/torneos/${torneo.id}/sorteo`}>
            Sortear las zonas
          </BotonLink>
          <BotonLink to={`/torneos/${torneo.id}/inscripciones`}>Inscripciones</BotonLink>
        </>
      }
    >
      <CuentaDelCupo pagaron={torneo.pagaron} cupo={torneo.cupo} />
    </TarjetaDeColumna>
  );
}
