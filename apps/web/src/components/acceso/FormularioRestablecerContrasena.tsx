import { LARGO_MINIMO_CONTRASENA } from '@setpoint/shared';
import { useState, type FormEvent, type ReactNode } from 'react';
import { Boton } from '../Boton';
import { CampoContrasena } from '../CampoContrasena';
import { Tarjeta } from '../Tarjeta';

type Props = {
  alEnviar?: (contrasena: string) => void;
  enviando?: boolean;
  error?: ReactNode;
};

export function FormularioRestablecerContrasena({ alEnviar, enviando = false, error }: Props) {
  const [contrasena, setContrasena] = useState('');
  // La repetición no viaja a la API: solo evita guardar una contraseña mal tipeada.
  const [repetida, setRepetida] = useState('');
  const [noCoinciden, setNoCoinciden] = useState(false);

  function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (contrasena !== repetida) {
      setNoCoinciden(true);
      document.getElementById('restablecer-repetir')?.focus();
      return;
    }
    alEnviar?.(contrasena);
  }

  return (
    <Tarjeta className="p-6">
      <form onSubmit={manejarEnvio} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-semibold tracking-[-0.03em]">Elegí una contraseña nueva</h1>
          <p className="text-[15px] text-gris-500">Es la que vas a usar para ingresar de ahora en más.</p>
        </div>

        <div className="flex flex-col gap-2">
          <CampoContrasena
            id="restablecer-contrasena"
            rotulo="Contraseña nueva"
            autoComplete="new-password"
            required
            minLength={LARGO_MINIMO_CONTRASENA}
            value={contrasena}
            onChange={(e) => {
              setContrasena(e.target.value);
              setNoCoinciden(false);
            }}
          />
          <p className="text-xs text-gris-500">
            Al menos <span className="font-mono tabular-nums">{LARGO_MINIMO_CONTRASENA}</span> caracteres.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <CampoContrasena
            id="restablecer-repetir"
            rotulo="Confirmá la contraseña nueva"
            autoComplete="new-password"
            required
            value={repetida}
            onChange={(e) => {
              setRepetida(e.target.value);
              setNoCoinciden(false);
            }}
            aria-invalid={noCoinciden ? true : undefined}
            aria-describedby={noCoinciden ? 'restablecer-repetir-error' : undefined}
          />
          {noCoinciden && (
            <p id="restablecer-repetir-error" className="text-[13px] text-rojo-texto">
              Las contraseñas no coinciden.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-[11px]">
          {error && (
            <p role="alert" className="rounded-control border border-rojo-linea bg-rojo-fondo px-3.5 py-2.5 text-sm text-rojo-texto">
              {error}
            </p>
          )}
          <Boton type="submit" variante="organizador" grande className="w-full" disabled={enviando}>
            {enviando ? 'Guardando…' : 'Guardar la contraseña'}
          </Boton>
        </div>
      </form>
    </Tarjeta>
  );
}
