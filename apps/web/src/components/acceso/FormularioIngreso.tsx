import { useState, type FormEvent } from 'react';
import { Aviso } from '../Aviso';
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

// En una tarjeta noche, que es lo único de la pantalla (decisión 148).
export function FormularioIngreso({ alEnviar, enviando = false, error }: Props) {
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');

  function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    alEnviar?.({ email, contrasena });
  }

  return (
    <Tarjeta variante="noche">
      <form onSubmit={manejarEnvio} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-display font-semibold tracking-[-0.02em]">Ingresar</h1>
          <p className="text-[15px] text-pizarra-400">Con el email y la contraseña que usaste al registrar tu organización.</p>
        </div>

        <div className="flex flex-col gap-3.5">
          <Campo
            id="ingreso-email"
            rotulo="Email"
            type="email"
            autoComplete="email"
            required
            sobreNoche
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <CampoContrasena
            id="ingreso-contrasena"
            rotulo="Contraseña"
            autoComplete="current-password"
            required
            sobreNoche
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            accesorio={
              <Link
                to="/recuperar-contrasena"
                className="rounded-[4px] text-[13px] font-medium text-white underline-offset-[3px] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Olvidé mi contraseña
              </Link>
            }
          />
        </div>

        <div className="flex flex-col gap-[11px]">
          {error && <Aviso sobreNoche>{error}</Aviso>}
          <Boton type="submit" variante="claro" grande className="w-full" disabled={enviando}>
            {enviando ? 'Ingresando…' : 'Ingresar'}
          </Boton>
        </div>
      </form>
    </Tarjeta>
  );
}
