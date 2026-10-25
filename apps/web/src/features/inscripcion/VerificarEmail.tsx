import { useState } from 'react';
import { CampoCodigo } from '../../components/CampoCodigo';
import { Numero } from '../../components/Numero';
import { ErrorApi } from '../../lib/api';
import { Aviso, Ayuda, BotonPrincipal, BotonSecundario, Caja, Titulo } from './piezas';
import type { SesionJugador } from './sesionJugador';
import { usePedirCodigo, useVerificarCodigo } from './useInscripcion';

function codigoDe(error: Error | null) {
  return error instanceof ErrorApi ? error.codigo : error ? 'DESCONOCIDO' : null;
}

function mensaje(codigo: string | null): string | null {
  switch (codigo) {
    case null:
      return null;
    case 'DATOS_INVALIDOS':
      return 'El email no es válido.';
    case 'DEMASIADOS_PEDIDOS':
      return 'Pediste muchos códigos seguidos. Esperá unos minutos y probá de nuevo.';
    case 'SIN_CONEXION':
      return 'No pudimos conectarnos. Revisá tu conexión y probá de nuevo.';
    default:
      return 'Algo salió mal. Probá de nuevo en unos minutos.';
  }
}

// Email y código antes de pagar (decisión 049): pasos 1 y 2 de identificacion.html. Los errores
// del código son los de cuenta-e-ingreso.html.
export function VerificarEmail({ onVerificado }: { onVerificado: (sesion: SesionJugador) => void }) {
  const pedirCodigo = usePedirCodigo();
  const verificar = useVerificarCodigo();
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [paso, setPaso] = useState<'email' | 'codigo'>('email');

  const mandarCodigo = () =>
    pedirCodigo.mutate(
      { email },
      {
        onSuccess: () => {
          setCodigo('');
          verificar.reset();
          setPaso('codigo');
        },
      },
    );

  const confirmar = (valor = codigo) => verificar.mutate({ email, codigo: valor }, { onSuccess: onVerificado });

  const cambiarEmail = () => {
    setCodigo('');
    verificar.reset();
    pedirCodigo.reset();
    setPaso('email');
  };

  if (paso === 'email') {
    return (
      <form
        className="flex grow flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          mandarCodigo();
        }}
      >
        <div className="flex flex-col gap-2.5">
          <label htmlFor="email" className="text-[15px] font-semibold">
            Tu email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="h-[60px] rounded-[12px] border border-gris-300 px-4 text-lg outline-none placeholder:text-gris-400 focus:border-2 focus:border-negro focus:px-[15px]"
          />
          <Ayuda>Te mandamos un código para confirmar que es tuyo. Ese email es tu cuenta: no hay contraseña.</Ayuda>
        </div>
        <Caja>
          <strong className="mb-1 block font-semibold text-negro">¿Ya te inscribiste antes?</strong>
          Usá el mismo email y vas directo a tu perfil.
        </Caja>
        <Aviso mensaje={mensaje(codigoDe(pedirCodigo.error))} />
        <div className="mt-auto flex flex-col gap-3">
          <BotonPrincipal type="submit" disabled={pedirCodigo.isPending}>
            {pedirCodigo.isPending ? 'Mandando…' : 'Mandarme el código'}
          </BotonPrincipal>
          <p className="text-center text-[15px] text-gris-500">No necesitás registrarte.</p>
        </div>
      </form>
    );
  }

  const error = codigoDe(verificar.error);

  if (error === 'CODIGO_VENCIDO' || error === 'DEMASIADOS_INTENTOS') {
    return (
      <div className="flex grow flex-col gap-5">
        <div className="flex flex-col gap-2">
          {error === 'CODIGO_VENCIDO' && (
            <span className="self-start rounded-full border border-rojo-linea bg-rojo-fondo px-3 py-1 font-mono text-[15px] font-medium text-rojo-texto">
              venció
            </span>
          )}
          <Titulo>{error === 'CODIGO_VENCIDO' ? 'Este código ya no sirve' : 'Probaste 5 veces'}</Titulo>
          <Ayuda>
            {error === 'CODIGO_VENCIDO'
              ? `Los códigos duran 10 minutos. Pedí uno nuevo: llega a ${email}.`
              : 'Por seguridad, ese código dejó de servir. Pedí uno nuevo y usá el último que te llegue.'}
          </Ayuda>
        </div>
        <Aviso mensaje={mensaje(codigoDe(pedirCodigo.error))} />
        <div className="mt-auto flex flex-col gap-3">
          <BotonPrincipal onClick={mandarCodigo} disabled={pedirCodigo.isPending}>
            {pedirCodigo.isPending ? 'Mandando…' : 'Mandarme un código nuevo'}
          </BotonPrincipal>
          <BotonSecundario onClick={cambiarEmail}>Cambiar el email</BotonSecundario>
        </div>
      </div>
    );
  }

  return (
    <div className="flex grow flex-col gap-5">
      <div className="flex flex-col gap-2 pt-2">
        <Titulo>Revisá tu email</Titulo>
        <Ayuda>
          Te mandamos un código de <Numero>6</Numero> dígitos a <span className="font-medium text-negro">{email}</span>.
        </Ayuda>
      </div>
      <div className="flex flex-col gap-3">
        <CampoCodigo valor={codigo} onChange={setCodigo} onCompleto={confirmar} />
        {error === 'CODIGO_INCORRECTO' ? (
          <p role="alert" className="rounded-[12px] border border-negro px-3.5 py-3 text-[15px] leading-[1.42]">
            <strong className="font-semibold">Ese código no es. </strong>
            {(verificar.error as ErrorApi).campos.codigo}. Revisá que sea el último que te mandamos.
          </p>
        ) : (
          <Ayuda>
            Vence en <Numero>10</Numero> minutos.
          </Ayuda>
        )}
        {error !== 'CODIGO_INCORRECTO' && <Aviso mensaje={mensaje(error)} />}
      </div>
      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={mandarCodigo} disabled={pedirCodigo.isPending} className="text-[15px] font-medium underline underline-offset-[3px]">
          {pedirCodigo.isPending ? 'Mandando…' : 'Reenviar el código'}
        </button>
        <button type="button" onClick={cambiarEmail} className="text-[15px] font-medium text-gris-500 underline underline-offset-[3px]">
          Cambiar el email
        </button>
      </div>
      <Caja>¿No te llegó? Fijate en spam o en correo no deseado. Puede tardar un minuto.</Caja>
      <div className="mt-auto">
        <BotonPrincipal onClick={() => confirmar()} disabled={verificar.isPending || codigo.length < 6}>
          {verificar.isPending ? 'Confirmando…' : 'Confirmar'}
        </BotonPrincipal>
      </div>
    </div>
  );
}
