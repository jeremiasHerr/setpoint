import type { ResultadoDeshacer } from '@setpoint/shared';
import { useState } from 'react';
import { Boton } from '../../components/Boton';
import { Confirmacion } from '../../components/Confirmacion';
import { ErrorApi } from '../../lib/api';
import { useDeshacerImportacion } from './useImportacion';

type Props = {
  slug: string;
  id: number;
  grande?: boolean;
  alDeshacer: (resultado: ResultadoDeshacer) => void;
};

function errorDeDeshacer(error: Error | null) {
  if (!error) return undefined;
  switch (error instanceof ErrorApi ? error.codigo : null) {
    case 'IMPORTACION_NO_APLICADA':
      return 'Esta importación ya se deshizo. Recargá la página.';
    case 'SIN_CONEXION':
      return 'No pudimos conectarnos. Revisá tu conexión y probá de nuevo.';
    default:
      return 'No pudimos deshacer la importación. Probá de nuevo en unos minutos.';
  }
}

// Como lo seguro se importa sin que nadie lo mire, la importación entera se puede deshacer
// (decisión 118). Borra datos, así que se confirma con el modal de lo que no se deshace (decisión 096).
export function DeshacerImportacion({ slug, id, grande = false, alDeshacer }: Props) {
  const [abierta, setAbierta] = useState(false);
  const deshacer = useDeshacerImportacion(slug, id);

  return (
    <>
      <Boton grande={grande} onClick={() => setAbierta(true)}>
        Deshacer la importación
      </Boton>
      <Confirmacion
        abierta={abierta}
        titulo="¿Deshacer la importación?"
        consecuencias={[
          'Se borran todos los puntos que cargó esta importación.',
          'Se borran del padrón los jugadores que dio de alta, salvo los que ya se inscribieron, jugaron o tienen cuenta.',
          'Las categorías y los torneos del calendario que creó quedan en tu circuito.',
        ]}
        accion="Deshacer la importación"
        accionEnCurso="Deshaciendo…"
        enCurso={deshacer.isPending}
        error={errorDeDeshacer(deshacer.error)}
        alCancelar={() => {
          deshacer.reset();
          setAbierta(false);
        }}
        alConfirmar={() =>
          deshacer.mutate(undefined, {
            onSuccess: (resultado) => {
              setAbierta(false);
              alDeshacer(resultado);
            },
          })
        }
      />
    </>
  );
}
