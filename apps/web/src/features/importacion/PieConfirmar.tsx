import { Boton } from '../../components/Boton';
import { MensajeError } from '../torneos/MensajeError';

type Props = {
  aImportar: number;
  enviando: boolean;
  error?: string;
  alCancelar: () => void;
  alConfirmar: () => void;
};

export function PieConfirmar({ aImportar, enviando, error, alCancelar, alConfirmar }: Props) {
  return (
    <footer className="sticky bottom-0 flex flex-wrap items-center justify-between gap-5 border-t border-linea bg-white px-7 py-[18px]">
      <div className="flex flex-col gap-1">
        <span className="text-[15px] font-semibold">Todavía no se guardó nada</span>
        <span className="text-sm text-gris-500">
          Podés volver a subir la planilla cada vez que haya altas: solo se carga lo que cambió.
        </span>
        <MensajeError id="importacion-error-confirmar">{error}</MensajeError>
      </div>
      <div className="flex gap-2.5">
        <Boton grande onClick={alCancelar} disabled={enviando}>
          Cancelar
        </Boton>
        <Boton grande variante="organizador" onClick={alConfirmar} disabled={enviando || aImportar === 0}>
          {aImportar === 1 ? 'Importar 1 jugador' : `Importar ${aImportar} jugadores`}
        </Boton>
      </div>
    </footer>
  );
}
