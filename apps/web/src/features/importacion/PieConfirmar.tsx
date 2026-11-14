import { Boton } from '../../components/Boton';
import { MensajeError } from '../../components/Aviso';

type Props = {
  aImportar: number;
  enviando: boolean;
  // Falta algo para poder confirmar, como la categoría de una planilla que no la dice.
  falta?: boolean;
  error?: string;
  alCancelar: () => void;
  alConfirmar: () => void;
};

export function PieConfirmar({ aImportar, enviando, falta = false, error, alCancelar, alConfirmar }: Props) {
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
        <Boton grande variante="organizador" onClick={alConfirmar} disabled={enviando || falta || aImportar === 0}>
          {aImportar === 1 ? 'Importar 1 jugador' : `Importar ${aImportar} jugadores`}
        </Boton>
      </div>
    </footer>
  );
}
