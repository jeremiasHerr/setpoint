import type { DatosCrearJugador, JugadorPadron } from '@setpoint/shared';
import { useState, type FormEvent, type ReactNode } from 'react';
import { Boton } from '../../components/Boton';
import { Campo } from '../../components/Campo';
import { Numero } from '../../components/Numero';
import { Tarjeta } from '../../components/Tarjeta';

export type ErroresJugador = {
  campos?: Partial<Record<keyof DatosCrearJugador, string>>;
  general?: string;
};

type Props = {
  categorias: string[];
  conRanking: boolean;
  // Sin jugador, el panel da de alta; con jugador, lo edita.
  jugador?: JugadorPadron;
  enviando?: boolean;
  errores?: ErroresJugador;
  alGuardar: (datos: DatosCrearJugador) => void;
  alCambiarActivo?: (activo: boolean) => void;
  alDesvincular?: () => void;
  alCancelar?: () => void;
};

// El select vacío es "sin categoría": la API lo recibe como null.
const SIN_CATEGORIA = '';

function MensajeError({ id, children }: { id: string; children?: ReactNode }) {
  if (!children) return null;
  return (
    <p id={id} className="text-[13px] text-rojo-texto">
      {children}
    </p>
  );
}

export function PanelJugador({
  categorias,
  conRanking,
  jugador,
  enviando = false,
  errores = {},
  alGuardar,
  alCambiarActivo,
  alDesvincular,
  alCancelar,
}: Props) {
  const campos = errores.campos ?? {};
  const editando = jugador !== undefined;

  const [nombre, setNombre] = useState(jugador?.nombre ?? '');
  const [apellido, setApellido] = useState(jugador?.apellido ?? '');
  const [categoria, setCategoria] = useState(editando ? (jugador.categoria ?? SIN_CATEGORIA) : (categorias[0] ?? SIN_CATEGORIA));
  const [telefono, setTelefono] = useState(jugador?.telefono ?? '');

  function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    alGuardar({ nombre, apellido, categoria: categoria === SIN_CATEGORIA ? null : categoria, telefono });
  }

  function propsDeError(campo: keyof DatosCrearJugador) {
    return campos[campo]
      ? { 'aria-invalid': true, 'aria-describedby': `jugador-${campo}-error` }
      : {};
  }

  return (
    <Tarjeta className="p-5">
      <form onSubmit={manejarEnvio} className="flex flex-col gap-4">
        <h2 className="text-[17px] font-semibold">{editando ? 'Editar jugador' : 'Agregar jugador'}</h2>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <Campo
              id="jugador-nombre"
              rotulo="Nombre"
              autoComplete="off"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              {...propsDeError('nombre')}
            />
            <MensajeError id="jugador-nombre-error">{campos.nombre}</MensajeError>
          </div>
          <div className="flex flex-col gap-2">
            <Campo
              id="jugador-apellido"
              rotulo="Apellido"
              autoComplete="off"
              required
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              {...propsDeError('apellido')}
            />
            <MensajeError id="jugador-apellido-error">{campos.apellido}</MensajeError>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="jugador-categoria" className="text-[13px] font-semibold text-gris-500">
            Categoría
          </label>
          <div className="relative">
            <select
              id="jugador-categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="h-12 w-full appearance-none rounded-control border border-gris-300 bg-white pr-10 pl-3.5 text-[15px] text-negro outline-none focus:border-2 focus:border-negro focus:pl-[13px]"
              {...propsDeError('categoria')}
            >
              {categorias.map((nombreCategoria) => (
                <option key={nombreCategoria} value={nombreCategoria}>
                  {nombreCategoria}
                </option>
              ))}
              <option value={SIN_CATEGORIA}>Sin categoría</option>
            </select>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className="pointer-events-none absolute top-1/2 right-3.5 size-[13px] -translate-y-1/2 text-gris-500" aria-hidden="true">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
          <MensajeError id="jugador-categoria-error">{campos.categoria}</MensajeError>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="jugador-telefono" className="text-[13px] font-semibold text-gris-500">
            Teléfono <span className="font-normal">— opcional</span>
          </label>
          <input
            id="jugador-telefono"
            type="tel"
            autoComplete="off"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="Para avisarle cambios de horario"
            className="h-12 rounded-control border border-gris-300 px-3.5 font-mono text-[15px] text-negro tabular-nums outline-none placeholder:font-sans placeholder:text-gris-400 focus:border-2 focus:border-negro focus:px-[13px]"
            {...propsDeError('telefono')}
          />
          <MensajeError id="jugador-telefono-error">{campos.telefono}</MensajeError>
        </div>

        {conRanking && (
          <p className="rounded-control bg-fondo p-[13px] text-[13px] leading-[1.45] text-gris-500">
            {editando ? (
              'Si le cambiás la categoría, suma desde cero en la nueva. Sus puntos de la anterior quedan guardados.'
            ) : (
              <>
                Entra con <Numero className="text-negro">0</Numero> puntos y sube cuando juegue. Le toma unos cuatro torneos
                alcanzar a la mayoría.
              </>
            )}
          </p>
        )}

        {errores.general && (
          <p role="alert" className="rounded-control border border-rojo-linea bg-rojo-fondo px-3.5 py-2.5 text-sm text-rojo-texto">
            {errores.general}
          </p>
        )}

        <div className="flex flex-col gap-2.5">
          <Boton type="submit" variante="organizador" className="h-11 w-full" disabled={enviando}>
            {editando ? 'Guardar cambios' : 'Agregar al padrón'}
          </Boton>

          {editando && (
            <>
              <Boton className="w-full" disabled={enviando} onClick={() => alCambiarActivo?.(!jugador.activo)}>
                {jugador.activo ? 'Dar de baja' : 'Reactivar'}
              </Boton>
              <p className="text-[13px] leading-[1.45] text-gris-500">
                {jugador.activo
                  ? 'Deja de aparecer en el ranking. Sus puntos y sus partidos quedan guardados por si vuelve.'
                  : 'Vuelve al ranking con los puntos que tenía.'}
              </p>

              {jugador.cuenta && (
                <div className="flex flex-col gap-2.5 border-t border-linea pt-4">
                  <h3 className="text-sm font-semibold">Cuenta vinculada</h3>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[15px]">{jugador.cuenta.nombre}</span>
                    <span className="truncate font-mono text-[13px] text-gris-500">{jugador.cuenta.email}</span>
                  </div>
                  <Boton className="w-full" disabled={enviando} onClick={alDesvincular}>
                    Desvincular cuenta
                  </Boton>
                  <p className="text-[13px] leading-[1.45] text-gris-500">
                    Sus puntos y partidos no cambian. El jugador podrá vincular su cuenta de nuevo.
                  </p>
                </div>
              )}
              <button
                type="button"
                onClick={alCancelar}
                className="self-center text-sm font-medium text-negro hover:text-gris-500"
              >
                Cancelar
              </button>
            </>
          )}
        </div>
      </form>
    </Tarjeta>
  );
}
