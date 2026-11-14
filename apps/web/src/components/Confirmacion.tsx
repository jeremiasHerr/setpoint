import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Boton } from './Boton';

type Props = {
  abierta: boolean;
  titulo: ReactNode;
  // Lo que haga falta elegir antes de confirmar, como la devolución al dar de baja.
  children?: ReactNode;
  // Lo que va a pasar, dicho antes de que pase (design.md §2), con los números reales. Una por línea.
  consecuencias?: ReactNode[];
  accion: string;
  accionEnCurso: string;
  enCurso: boolean;
  // Mientras falte elegir algo, no se puede confirmar.
  falta?: boolean;
  error?: ReactNode;
  alCancelar: () => void;
  alConfirmar: () => void;
};

// La confirmación de una acción que no se deshace (decisión 096): un diálogo modal con el fondo
// desenfocado. Es el <dialog> del navegador, que ya atrapa el foco, cierra con Escape y deja inerte
// lo de atrás. El foco arranca en lo primero que se puede tocar, nunca en el botón que confirma: un
// Enter apurado no confirma. Mientras la acción está en curso no se cierra.
export function Confirmacion({
  abierta,
  titulo,
  children,
  consecuencias = [],
  accion,
  accionEnCurso,
  enCurso,
  falta = false,
  error,
  alCancelar,
  alConfirmar,
}: Props) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const idTitulo = useId();

  useEffect(() => {
    const elemento = dialogo.current;
    if (!elemento) return;
    if (abierta && !elemento.open) elemento.showModal();
    if (!abierta && elemento.open) elemento.close();
  }, [abierta]);

  function cancelar() {
    if (!enCurso) alCancelar();
  }

  return (
    <dialog
      ref={dialogo}
      aria-labelledby={idTitulo}
      // Escape: lo cierra la pantalla, para que su estado siga siendo el que manda.
      onCancel={(evento) => {
        evento.preventDefault();
        cancelar();
      }}
      // El clic en el fondo desenfocado le llega al <dialog> mismo: también cancela.
      onClick={(evento) => evento.target === evento.currentTarget && cancelar()}
      className="m-auto w-[min(560px,calc(100%-32px))] overflow-hidden rounded-superficie border border-linea bg-white p-0 text-negro backdrop:bg-negro/40 backdrop:backdrop-blur-[4px]"
    >
      {abierta && (
        <>
          <div className="flex flex-col gap-4 px-6 pt-6 pb-5">
            <h2 id={idTitulo} className="text-xl font-semibold tracking-[-0.025em]">
              {titulo}
            </h2>
            {children}
            {consecuencias.length > 0 && (
              <ul className="flex flex-col gap-2">
                {consecuencias.map((consecuencia, i) => (
                  <li key={i} className="flex gap-2.5 text-[15px] leading-normal text-gris-700">
                    <span aria-hidden="true" className="mt-[9px] size-[5px] shrink-0 rounded-full bg-negro" />
                    <span>{consecuencia}</span>
                  </li>
                ))}
              </ul>
            )}
            {error && <p className="text-sm text-rojo-texto">{error}</p>}
          </div>
          <div className="flex flex-wrap justify-end gap-2.5 border-t border-linea bg-fondo-tabla px-6 py-4">
            <Boton onClick={cancelar} disabled={enCurso}>
              Cancelar
            </Boton>
            <Boton variante="organizador" className="font-semibold" onClick={alConfirmar} disabled={enCurso || falta}>
              {enCurso ? accionEnCurso : accion}
            </Boton>
          </div>
        </>
      )}
    </dialog>
  );
}
