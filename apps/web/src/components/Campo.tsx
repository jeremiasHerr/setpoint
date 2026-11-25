import { useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { IconoInfo } from './IconoInfo';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  rotulo: string;
  numerico?: boolean;
  // Texto de ayuda a la derecha, dentro del campo: "zonas", "por zona".
  sufijo?: string;
  // Dentro de una tarjeta noche, como el formulario de Ingresar (decisión 148).
  sobreNoche?: boolean;
  // Qué es el dato, cuando el rótulo no alcanza: una (i) al lado del rótulo lo abre debajo (decisión 150).
  ayuda?: ReactNode;
};

// Inválido, el borde se marca grueso como con el foco: en noche y no en rojo (decisión 099). Sobre
// noche, en blanco, y el autocompletado del navegador no pinta el campo de celeste.
const CAMPO = {
  claro: 'border-borde-campo text-noche focus:border-noche aria-invalid:border-noche',
  noche:
    'border-borde-campo bg-noche-900 text-white focus:border-white aria-invalid:border-white autofill:shadow-[inset_0_0_0_1000px_var(--color-noche-900)] autofill:[-webkit-text-fill-color:var(--color-papel)]',
};

export function Campo({ id, rotulo, numerico = false, sufijo, sobreNoche = false, ayuda, className = '', ...props }: Props) {
  const [conAyuda, setConAyuda] = useState(false);
  // Una fecha, en el celular: Android y iOS la dibujan angosta y, vacía, no muestran nada, ni el
  // "dd/mm/aaaa" de la compu. Ocupa el ancho como los demás campos, con el valor a la izquierda, y vacía
  // dice qué hay que hacer.
  const esFecha = props.type === 'date';
  const pista = esFecha && !props.value ? 'Elegí el día' : null;
  const input = (
    <input
      id={id}
      className={`h-12 rounded-control border px-3.5 text-[15px] outline-none ${sobreNoche ? 'placeholder:text-pizarra-400' : 'placeholder:text-pizarra-450'} focus:border-2 focus:px-[13px] aria-invalid:border-2 aria-invalid:px-[13px] ${
        CAMPO[sobreNoche ? 'noche' : 'claro']
      } ${numerico ? 'font-mono tabular-nums' : ''} ${
        esFecha ? 'w-full min-w-0 pointer-coarse:appearance-none [&::-webkit-date-and-time-value]:text-left' : ''
      } ${pista ? 'peer pointer-coarse:not-focus:text-transparent' : ''}`}
      {...props}
    />
  );

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center gap-1.5">
        <label htmlFor={id} className={`text-[13px] font-semibold ${sobreNoche ? 'text-pizarra-400' : 'text-pizarra-500'}`}>
          {rotulo}
        </label>
        {/* El dibujo es de 15 y se toca en 44: el margen negativo no corre el rótulo ni el campo. */}
        {ayuda && (
          <button
            type="button"
            aria-expanded={conAyuda}
            aria-controls={`${id}-ayuda`}
            aria-label={`Qué es «${rotulo}»`}
            title={`Qué es «${rotulo}»`}
            onClick={() => setConAyuda(!conAyuda)}
            className={`-m-3.5 flex size-11 shrink-0 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-[-11px] ${
              sobreNoche
                ? 'text-pizarra-400 hover:text-white focus-visible:outline-white aria-expanded:text-white'
                : 'text-pizarra-500 hover:text-noche focus-visible:outline-noche aria-expanded:text-noche'
            }`}
          >
            <IconoInfo className="size-[15px]" />
          </button>
        )}
      </div>
      {ayuda && conAyuda && (
        <p id={`${id}-ayuda`} className={`text-[13px] leading-[1.45] ${sobreNoche ? 'text-pizarra-400' : 'text-pizarra-500'}`}>
          {ayuda}
        </p>
      )}
      {sufijo || pista ? (
        <div className="relative flex flex-col">
          {input}
          {/* Solo en pantallas táctiles: en la compu, la fecha vacía ya muestra "dd/mm/aaaa". Una
              pantalla táctil con el Chrome de la compu también lo dibuja: hasta tocar el campo, ese
              texto queda transparente, y al tocarlo se ve y la pista se esconde. */}
          {pista && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3.5 hidden -translate-y-1/2 text-[15px] text-pizarra-400 pointer-coarse:block peer-focus:invisible"
            >
              {pista}
            </span>
          )}
          {sufijo && (
            <span
              className={`pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-[13px] ${
                sobreNoche ? 'text-pizarra-400' : 'text-pizarra-500'
              }`}
            >
              {sufijo}
            </span>
          )}
        </div>
      ) : (
        input
      )}
    </div>
  );
}
