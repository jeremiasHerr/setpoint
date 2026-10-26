import type { ReactNode } from 'react';
import { ErrorApi } from '../../lib/api';
import { Aviso, BotonPrincipal } from './piezas';
import { useReclamar } from './useInscripcion';

type Props = {
  slug: string;
  token: string;
  jugadorId: number;
  // Lo que se muestra cuando el aviso salió: el pie de cada pantalla es distinto.
  enviado: ReactNode;
  children?: ReactNode;
};

function mensaje(error: Error | null) {
  if (!error) return null;
  if (error instanceof ErrorApi && error.codigo === 'YA_ES_TUYO') return 'Ese perfil ya es tuyo. Recargá la página.';
  if (error instanceof ErrorApi && error.codigo === 'PERFIL_LIBRE') return 'Ese perfil ya está libre. Recargá la página para inscribirte.';
  if (error instanceof ErrorApi && error.codigo === 'SIN_CONEXION') return 'No pudimos conectarnos. Revisá tu conexión y probá de nuevo.';
  return 'No pudimos mandar el aviso. Probá de nuevo en unos minutos.';
}

// El botón del perfil vinculado a otra cuenta (decisión 051): crea el caso en "Para revisar" con el
// email verificado de quien reclama. No cambia nada hasta que la organización decide.
export function AvisarALaOrganizacion({ slug, token, jugadorId, enviado, children }: Props) {
  const reclamar = useReclamar(slug, token);
  if (reclamar.isSuccess) return <>{enviado}</>;

  return (
    <>
      {children}
      <div className="mt-auto flex flex-col gap-3">
        <Aviso mensaje={mensaje(reclamar.error)} />
        <BotonPrincipal onClick={() => reclamar.mutate({ jugadorId })} disabled={reclamar.isPending}>
          {reclamar.isPending ? 'Avisando…' : 'Avisarle a la organización'}
        </BotonPrincipal>
      </div>
    </>
  );
}

type PropsEnviado = {
  organizacion: string;
  perfil: string;
  email: string;
  // El torneo al que volver, si se llegó desde uno.
  torneo?: string;
  pie?: ReactNode;
};

// "Aviso enviado" de identificacion.html.
export function AvisoEnviado({ organizacion, perfil, email, torneo, pie }: PropsEnviado) {
  return (
    <>
      <div className="flex flex-col gap-4 pt-7">
        <span className="flex size-[46px] items-center justify-center rounded-full bg-fondo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M4 5.5h16v10.5H9.5L4 20z" />
          </svg>
        </span>
        <h2 className="text-[28px] leading-[1.12] font-semibold tracking-[-0.032em]">Le avisamos a {organizacion}</h2>
        <p className="text-base leading-[1.45] text-gris-500">
          La organización ve tu email y la cuenta que tiene el perfil de {perfil}, y decide de quién es. Te escriben a{' '}
          <span className="font-medium text-negro">{email}</span>.
        </p>
      </div>
      <p className="rounded-[12px] bg-fondo px-4 py-3.5 text-[15px] leading-[1.42] text-gris-700">
        {torneo
          ? `Todavía no estás inscripto en ${torneo}. Si la organización te pasa el perfil, inscribite desde el mismo link.`
          : 'Si la organización te pasa el perfil, inscribite desde el mismo link.'}
      </p>
      {pie && <div className="mt-auto">{pie}</div>}
    </>
  );
}
