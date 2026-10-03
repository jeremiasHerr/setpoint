import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import type { DatosIngreso } from '@setpoint/shared';
import { Boton } from '../Boton';
import { Campo } from '../Campo';
import { CampoContrasena } from '../CampoContrasena';
import { Tarjeta } from '../Tarjeta';

type Props = {
  alEnviar?: (datos: DatosIngreso) => void;
  enviando?: boolean;
  error?: string;
};

export function FormularioIngreso({ alEnviar, enviando = false, error }: Props) {
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');

  function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    alEnviar?.({ email, contrasena });
  }

  return (
    <Tarjeta className="p-6">
      <form onSubmit={manejarEnvio} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-semibold tracking-[-0.03em]">Ingresar</h1>
          <p className="text-[15px] text-gris-500">Con el email y la contraseña que usaste al registrar tu organización.</p>
        </div>

        <div className="flex flex-col gap-3.5">
          <Campo
            id="ingreso-email"
            rotulo="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <CampoContrasena
            id="ingreso-contrasena"
            rotulo="Contraseña"
            autoComplete="current-password"
            required
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            accesorio={
              <Link to="/recuperar-contrasena" className="text-[13px] font-medium text-negro hover:text-gris-500">
                Olvidé mi contraseña
              </Link>
            }
          />
        </div>

        <div className="flex flex-col gap-[11px]">
          {error && (
            <p role="alert" className="rounded-control border border-rojo-linea bg-rojo-fondo px-3.5 py-2.5 text-sm text-rojo-texto">
              {error}
            </p>
          )}
          <Boton type="submit" variante="organizador" grande className="w-full" disabled={enviando}>
            {enviando ? 'Ingresando…' : 'Ingresar'}
          </Boton>
        </div>
      </form>
    </Tarjeta>
  );
}
