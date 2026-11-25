import { Link } from 'react-router-dom';
import { BotonLink } from '../../components/Boton';
import { IconoEngranaje } from '../../components/IconoEngranaje';
import { BotonCopiarLink } from './BotonCopiarLink';
import { CuentaDelCupo, TarjetaDeColumna } from './TarjetaDeColumna';
import type { TorneoConInscripcionAbierta } from './tiposDeInicio';

export function TarjetaInscripcionAbierta({ torneo }: { torneo: TorneoConInscripcionAbierta }) {

  return (
    <TarjetaDeColumna
      calendario={torneo.calendario}
      nombre={torneo.nombre}
      detalle={torneo.detalle}
      esquina={
        // Solo mientras se puede editar: si apareciera para decir que no, confundiría (decisión 101).
        // El área de toque es de 44; el margen negativo la deja sin agrandar la fila.
        torneo.sePuedeEditar && (
          <Link
            to={`/torneos/${torneo.convocatoriaId}`}
            state={{ desde: torneo.id }}
            aria-label="Editar el torneo"
            title="Editar el torneo"
            className="-m-2.5 flex size-11 shrink-0 items-center justify-center rounded-control text-pizarra-500 hover:text-noche"
          >
            <IconoEngranaje className="size-5" />
          </Link>
        )
      }
      acciones={
        <>
          <BotonLink className="grow" to={`/torneos/${torneo.id}/inscripciones`}>
            Inscripciones
          </BotonLink>
          <BotonCopiarLink torneo={torneo} />
        </>
      }
    >
      <CuentaDelCupo pagaron={torneo.pagaron} cupo={torneo.cupo} />
    </TarjetaDeColumna>
  );
}
