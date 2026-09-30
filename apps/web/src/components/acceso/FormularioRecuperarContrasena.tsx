import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Boton } from '../Boton';
import { Campo } from '../Campo';
import { Tarjeta } from '../Tarjeta';

type Props = {
  alEnviar?: (email: string) => void;
};

export function FormularioRecuperarContrasena({ alEnviar }: Props) {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);

  function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    alEnviar?.(email);
    setEnviado(true);
  }

  if (enviado) {
    return (
      <Tarjeta className="flex flex-col gap-5 p-6">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-semibold tracking-[-0.03em]">Revisá tu email</h1>
          {/* No confirmamos si la cuenta existe, para no revelar qué emails están registrados. */}
          <p className="text-[15px] text-gris-500">
            Si hay una cuenta con <span className="font-medium text-negro">{email}</span>, te mandamos un link para elegir una
            contraseña nueva.
          </p>
        </div>
        <Link
          to="/ingresar"
          className="inline-flex h-12 items-center justify-center rounded-control border border-linea text-[15px] font-medium text-negro hover:bg-fondo"
        >
          Volver a ingresar
        </Link>
      </Tarjeta>
    );
  }

  return (
    <Tarjeta className="p-6">
      <form onSubmit={manejarEnvio} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-semibold tracking-[-0.03em]">Recuperar la contraseña</h1>
          <p className="text-[15px] text-gris-500">Escribí el email de tu cuenta y te mandamos un link para elegir una nueva.</p>
        </div>

        <Campo
          id="recuperar-email"
          rotulo="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Boton type="submit" variante="organizador" grande className="w-full">
          Mandarme el link
        </Boton>
      </form>
    </Tarjeta>
  );
}
