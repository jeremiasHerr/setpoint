import type { ReactNode } from 'react';
import { Boton } from '../../components/Boton';
import { MensajeError } from '../../components/Aviso';

type Props = {
  // Dónde está la importación: si ya se guardó algo y qué se puede hacer todavía (decisión 118).
  titulo: string;
  detalle: string;
  accion: string;
  enviando: boolean;
  // Falta algo para poder confirmar, como la categoría de una planilla que no la dice.
  falta?: boolean;
  error?: string;
  // Descartar, antes de importar; deshacer, después.
  secundario: ReactNode;
  alConfirmar: () => void;
};

export function PieConfirmar({ titulo, detalle, accion, enviando, falta = false, error, secundario, alConfirmar }: Props) {
  return (
    <footer className="sticky bottom-0 flex flex-wrap items-center justify-between gap-5 border-t border-linea bg-papel px-4 md:px-7 py-[18px]">
      <div className="flex flex-col gap-1">
        <span className="text-[15px] font-semibold">{titulo}</span>
        <span className="text-sm text-pizarra-500">{detalle}</span>
        <MensajeError id="importacion-error-confirmar">{error}</MensajeError>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {secundario}
        <Boton grande variante="organizador" onClick={alConfirmar} disabled={enviando || falta}>
          {accion}
        </Boton>
      </div>
    </footer>
  );
}
