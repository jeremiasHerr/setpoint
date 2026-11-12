import { useState, type FormEvent, type ReactNode } from 'react';
import type { DatosRegistroOrganizacion } from '@setpoint/shared';
import { Boton } from '../Boton';
import { Campo } from '../Campo';
import { CampoCodigo } from '../CampoCodigo';
import { CampoContrasena } from '../CampoContrasena';
import { Numero } from '../Numero';
import { Tarjeta } from '../Tarjeta';

export type DatosRegistro = DatosRegistroOrganizacion;

export type ErroresRegistro = {
  campos?: Partial<Record<keyof DatosRegistro, ReactNode>>;
  // El del código que se escribió: incorrecto, vencido o agotado.
  codigo?: ReactNode;
  general?: string;
};

type Props = {
  // La organización se crea con el código que llega al email (decisión 087): primero los datos,
  // después el código, en la misma tarjeta.
  paso?: 'datos' | 'codigo';
  alEnviar?: (datos: DatosRegistro) => void;
  alConfirmar?: (codigo: string) => void;
  alReenviar?: () => void;
  alCambiarEmail?: () => void;
  enviando?: boolean;
  reenviando?: boolean;
  errores?: ErroresRegistro;
};

const LARGO_MINIMO_CONTRASENA = 8;

// Solo es una vista previa: el slug definitivo lo asigna la API.
function aSlug(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function MensajeError({ id, children }: { id: string; children?: ReactNode }) {
  if (!children) return null;
  return (
    <p id={id} className="text-[13px] text-rojo-texto">
      {children}
    </p>
  );
}

function ErrorGeneral({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="rounded-control border border-rojo-linea bg-rojo-fondo px-3.5 py-2.5 text-sm text-rojo-texto">
      {children}
    </p>
  );
}

type PropsPasoCodigo = Pick<Props, 'alConfirmar' | 'alReenviar' | 'alCambiarEmail' | 'enviando' | 'reenviando'> & {
  email: string;
  errores: ErroresRegistro;
};

function PasoCodigo({ email, alConfirmar, alReenviar, alCambiarEmail, enviando, reenviando, errores }: PropsPasoCodigo) {
  const [codigo, setCodigo] = useState('');

  function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    alConfirmar?.(codigo);
  }

  function reenviar() {
    setCodigo('');
    alReenviar?.();
  }

  return (
    <form onSubmit={manejarEnvio} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-[-0.03em]">Revisá tu email</h1>
        <p className="text-[15px] text-gris-500">
          Te mandamos un código de <Numero>6</Numero> dígitos a <span className="font-medium text-negro">{email}</span>.
          Escribilo para crear la organización.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <CampoCodigo valor={codigo} onChange={setCodigo} onCompleto={(valor) => alConfirmar?.(valor)} apagado={enviando} />
        {errores.codigo ? (
          <p role="alert" className="text-[13px] text-rojo-texto">
            {errores.codigo}
          </p>
        ) : (
          <p className="text-xs text-gris-500">
            Vence en <Numero>10</Numero> minutos. ¿No te llegó? Fijate en spam o en correo no deseado.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-[11px]">
        <ErrorGeneral>{errores.general}</ErrorGeneral>
        <Boton type="submit" variante="organizador" grande className="w-full" disabled={enviando || codigo.length < 6}>
          {enviando ? 'Creando la organización…' : 'Crear la organización'}
        </Boton>
        <div className="flex items-center justify-between gap-3 text-sm">
          <button type="button" onClick={reenviar} disabled={reenviando} className="font-medium underline underline-offset-[3px]">
            {reenviando ? 'Mandando…' : 'Reenviar el código'}
          </button>
          <button type="button" onClick={alCambiarEmail} className="font-medium text-gris-500 underline underline-offset-[3px]">
            Cambiar el email
          </button>
        </div>
      </div>
    </form>
  );
}

export function FormularioRegistro({
  paso = 'datos',
  alEnviar,
  alConfirmar,
  alReenviar,
  alCambiarEmail,
  enviando = false,
  reenviando = false,
  errores = {},
}: Props) {
  const campos = errores.campos ?? {};

  // Vive acá y no en cada paso: al volver con "Cambiar el email" los datos siguen escritos.
  const [datos, setDatos] = useState<DatosRegistro>({ organizacion: '', nombre: '', email: '', contrasena: '' });

  function cambiar(campo: keyof DatosRegistro, valor: string) {
    setDatos({ ...datos, [campo]: valor });
  }

  function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    alEnviar?.(datos);
  }

  if (paso === 'codigo') {
    return (
      <Tarjeta className="p-6">
        <PasoCodigo
          email={datos.email.trim().toLowerCase()}
          alConfirmar={alConfirmar}
          alReenviar={alReenviar}
          alCambiarEmail={alCambiarEmail}
          enviando={enviando}
          reenviando={reenviando}
          errores={errores}
        />
      </Tarjeta>
    );
  }

  return (
    <Tarjeta className="p-6">
      <form onSubmit={manejarEnvio} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-semibold tracking-[-0.03em]">Registrar tu organización</h1>
          <p className="text-[15px] text-gris-500">
            Es gratis y no hace falta tarjeta. Después elegís si armás un circuito con ranking o un torneo suelto.
          </p>
        </div>

        <div className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-2">
            <Campo
              id="registro-organizacion"
              rotulo="Nombre del circuito o grupo"
              autoComplete="organization"
              required
              value={datos.organizacion}
              onChange={(e) => cambiar('organizacion', e.target.value)}
              aria-invalid={campos.organizacion ? true : undefined}
              aria-describedby={campos.organizacion ? 'registro-organizacion-error' : undefined}
            />
            <MensajeError id="registro-organizacion-error">{campos.organizacion}</MensajeError>
            <p className="font-mono text-xs text-gris-500 tabular-nums">
              setpoint.com.ar/{aSlug(datos.organizacion) || 'tu-circuito'} · así lo van a ver los jugadores
            </p>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Campo
                id="registro-nombre"
                rotulo="Tu nombre"
                autoComplete="name"
                required
                value={datos.nombre}
                onChange={(e) => cambiar('nombre', e.target.value)}
                aria-invalid={campos.nombre ? true : undefined}
                aria-describedby={campos.nombre ? 'registro-nombre-error' : undefined}
              />
              <MensajeError id="registro-nombre-error">{campos.nombre}</MensajeError>
            </div>
            <div className="flex flex-col gap-2">
              <Campo
                id="registro-email"
                rotulo="Tu email"
                type="email"
                autoComplete="email"
                required
                value={datos.email}
                onChange={(e) => cambiar('email', e.target.value)}
                aria-invalid={campos.email ? true : undefined}
                aria-describedby={campos.email ? 'registro-email-error' : undefined}
              />
              <MensajeError id="registro-email-error">{campos.email}</MensajeError>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <CampoContrasena
              id="registro-contrasena"
              rotulo="Contraseña"
              autoComplete="new-password"
              required
              minLength={LARGO_MINIMO_CONTRASENA}
              value={datos.contrasena}
              onChange={(e) => cambiar('contrasena', e.target.value)}
              aria-invalid={campos.contrasena ? true : undefined}
              aria-describedby={campos.contrasena ? 'registro-contrasena-error' : undefined}
            />
            <MensajeError id="registro-contrasena-error">{campos.contrasena}</MensajeError>
            <p className="text-xs text-gris-500">
              Al menos <span className="font-mono tabular-nums">{LARGO_MINIMO_CONTRASENA}</span> caracteres.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-[11px]">
          <ErrorGeneral>{errores.general}</ErrorGeneral>
          <Boton type="submit" variante="organizador" grande className="w-full" disabled={enviando}>
            {enviando ? 'Mandando el código…' : 'Continuar'}
          </Boton>
          <p className="text-center text-[13px] leading-[1.45] text-gris-500">Al continuar aceptás los términos del servicio.</p>
        </div>
      </form>
    </Tarjeta>
  );
}
