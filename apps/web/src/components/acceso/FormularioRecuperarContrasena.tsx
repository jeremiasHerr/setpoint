import { useState, type FormEvent } from 'react';
import { Aviso } from '../Aviso';
import { Link } from 'react-router-dom';
import { Boton } from '../Boton';
import { Campo } from '../Campo';
import { Tarjeta } from '../Tarjeta';

type Props = {
  alEnviar?: (email: string) => void;
  enviando?: boolean;
  // La API ya respondió: se muestra el aviso en lugar del formulario.
  enviado?: boolean;
  error?: string;
};

export function FormularioRecuperarContrasena({ alEnviar, enviando = false, enviado = false, error }: Props) {
  const [email, setEmail] = useState('');

  function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    alEnviar?.(email);
  }

  if (enviado) {
    return (
      <Tarjeta variante="noche" className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-display font-semibold tracking-[-0.02em]">Revisá tu email</h1>
          {/* No confirmamos si la cuenta existe, para no revelar qué emails están registrados. */}
          <p className="text-[15px] text-pizarra-400">
            Si hay una cuenta con <span className="font-medium text-white">{email}</span>, te mandamos un link para elegir una
            contraseña nueva. Vale por una hora.
          </p>
        </div>
        <Link
          to="/ingresar"
          className="inline-flex h-12 items-center justify-center rounded-control border border-borde-noche text-[15px] font-medium text-white hover:bg-noche-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Volver a ingresar
        </Link>
      </Tarjeta>
    );
  }

  return (
    <Tarjeta variante="noche">
      <form onSubmit={manejarEnvio} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-display font-semibold tracking-[-0.02em]">Recuperar la contraseña</h1>
          <p className="text-[15px] text-pizarra-400">Escribí el email de tu cuenta y te mandamos un link para elegir una nueva.</p>
        </div>

        <Campo
          id="recuperar-email"
          sobreNoche
          rotulo="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="flex flex-col gap-[11px]">
          {error && (
            <Aviso sobreNoche>
              {error}
            </Aviso>
          )}
          <Boton type="submit" variante="claro" grande className="w-full" disabled={enviando}>
            {enviando ? 'Mandando…' : 'Mandarme el link'}
          </Boton>
        </div>
      </form>
    </Tarjeta>
  );
}
