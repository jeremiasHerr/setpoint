import { useState, type FormEvent } from 'react';
import { Boton } from '../Boton';
import { Campo } from '../Campo';
import { CampoContrasena } from '../CampoContrasena';
import { Tarjeta } from '../Tarjeta';

export type DatosRegistro = {
  organizacion: string;
  nombre: string;
  email: string;
  contrasena: string;
};

type Props = {
  alEnviar?: (datos: DatosRegistro) => void;
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

export function FormularioRegistro({ alEnviar }: Props) {
  const [datos, setDatos] = useState<DatosRegistro>({ organizacion: '', nombre: '', email: '', contrasena: '' });

  function cambiar(campo: keyof DatosRegistro, valor: string) {
    setDatos({ ...datos, [campo]: valor });
  }

  function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    alEnviar?.(datos);
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
            />
            <p className="font-mono text-xs text-gris-500 tabular-nums">
              setpoint.com.ar/{aSlug(datos.organizacion) || 'tu-circuito'} · así lo van a ver los jugadores
            </p>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2">
            <Campo
              id="registro-nombre"
              rotulo="Tu nombre"
              autoComplete="name"
              required
              value={datos.nombre}
              onChange={(e) => cambiar('nombre', e.target.value)}
            />
            <Campo
              id="registro-email"
              rotulo="Tu email"
              type="email"
              autoComplete="email"
              required
              value={datos.email}
              onChange={(e) => cambiar('email', e.target.value)}
            />
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
            />
            <p className="text-xs text-gris-500">
              Al menos <span className="font-mono tabular-nums">{LARGO_MINIMO_CONTRASENA}</span> caracteres.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-[11px]">
          <Boton type="submit" variante="organizador" grande className="w-full">
            Crear la organización
          </Boton>
          <p className="text-center text-[13px] leading-[1.45] text-gris-500">Al continuar aceptás los términos del servicio.</p>
        </div>
      </form>
    </Tarjeta>
  );
}
