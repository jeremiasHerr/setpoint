import type { ReactNode } from 'react';
import { Numero } from '../../components/Numero';
import { importe } from '../torneo-publico/convocatoria';

// Piezas que se repiten en los pasos de la inscripción (docs/pantallas/jugador/identificacion.html).

export function Titulo({ children }: { children: ReactNode }) {
  return <h2 className="text-xl leading-[1.2] font-semibold tracking-[-0.025em]">{children}</h2>;
}

export function Ayuda({ children }: { children: ReactNode }) {
  return <p className="text-[15px] leading-[1.42] text-gris-500">{children}</p>;
}

export function Caja({ children }: { children: ReactNode }) {
  return <div className="rounded-[12px] bg-fondo px-4 py-3.5 text-[15px] leading-[1.42] text-gris-700">{children}</div>;
}

// El rojo es solo para vencimientos (design.md §3): los errores van en gris sobre fondo.
export function Aviso({ mensaje }: { mensaje: string | null }) {
  if (!mensaje) return null;
  return (
    <p role="alert" className="rounded-control bg-fondo px-3.5 py-3 text-[15px] font-medium text-gris-700">
      {mensaje}
    </p>
  );
}

export function BotonPrincipal({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className="flex h-14 w-full items-center justify-center gap-2.5 rounded-[12px] bg-lima text-[17px] font-semibold disabled:opacity-40"
      {...props}
    >
      {children}
    </button>
  );
}

export function BotonSecundario({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className="flex h-[52px] w-full items-center justify-center rounded-[12px] border border-linea text-base font-medium hover:bg-fondo disabled:opacity-40"
      {...props}
    >
      {children}
    </button>
  );
}

export function Tilde() {
  return (
    <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-negro">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#CDF546" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </span>
  );
}

// El email verificado arriba de cada paso. "Cambiar" cierra la sesión en este dispositivo.
export function CuentaVerificada({ email, onCambiar }: { email: string; onCambiar: () => void }) {
  return (
    <div className="flex h-[52px] items-center justify-between gap-3 rounded-[12px] bg-fondo px-4">
      <div className="flex min-w-0 items-center gap-2.5">
        <Tilde />
        <span className="truncate text-base">{email}</span>
      </div>
      <button type="button" onClick={onCambiar} className="shrink-0 text-[15px] font-medium text-gris-500 underline underline-offset-[3px]">
        Cambiar
      </button>
    </div>
  );
}

// "Al mandarla" en una solicitud, que todavía no es una inscripción.
export function Consentimiento({ organizacion, al = 'Al inscribirte' }: { organizacion: string; al?: string }) {
  return (
    <p className="rounded-[12px] border border-linea px-4 py-3.5 text-[15px] leading-[1.42] text-gris-700">
      {al}, {organizacion} va a ver tu nombre y tu email.
    </p>
  );
}

export function Monto({ precio }: { precio: number }) {
  return (
    <div className="flex items-center justify-between gap-3 px-1">
      <span className="text-base text-gris-500">Inscripción</span>
      <Numero className="text-2xl font-medium tracking-[-0.02em]">{importe(precio)}</Numero>
    </div>
  );
}

export function AvisoReserva({ minutos }: { minutos: number }) {
  return (
    <div className="flex items-start gap-2.5 px-1 text-[15px] leading-[1.42] text-gris-500">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mt-px shrink-0" aria-hidden>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5V12l3 2" />
      </svg>
      <span>
        Te guardamos el lugar <Numero>{minutos}</Numero> minutos mientras pagás.
      </span>
    </div>
  );
}
