import type { JugadorDelCuadro, PartidoDelCuadro } from '@setpoint/shared';
import { useState } from 'react';
import { Numero } from '../../components/Numero';
import { cuandoSeJuega, marcadorDelLado, tieneResultado, type Destacado } from './cuadro';

// Para elegir un partido desde el cuadro (Cargar resultado): tocarlo lo elige en vez de abrirlo.
export type Eleccion = {
  elegido?: number;
  alElegir: (partido: PartidoDelCuadro) => void;
};

type Props = {
  partido: PartidoDelCuadro;
  destacado?: Destacado;
  eleccion?: Eleccion;
  className?: string;
};

// Un partido del cuadro: dos filas con el resultado en sets (design.md §6). Al tocarlo, cada fila
// muestra los games de cada set.
export function TarjetaPartido({ partido, destacado, eleccion, className = '' }: Props) {
  const [abierta, setAbierta] = useState(false);
  const elegido = eleccion?.elegido === partido.id;
  // Uno que espera a los ganadores de la ronda anterior todavía no se puede elegir.
  const sinJugadores = partido.jugadorA === null || partido.jugadorB === null;
  const borde = elegido
    ? 'border-2 border-negro rounded-[10px] ring-2 ring-lima'
    : destacado === 'principal'
      ? 'border-2 border-negro rounded-[10px]'
      : destacado
        ? 'border border-gris-300 rounded-[10px]'
        : 'border border-linea rounded-lg';
  const elegible = eleccion !== undefined && !sinJugadores;

  return (
    <button
      type="button"
      aria-expanded={eleccion ? undefined : abierta}
      aria-current={elegido ? 'true' : undefined}
      disabled={eleccion !== undefined && sinJugadores}
      onClick={() => (eleccion ? eleccion.alElegir(partido) : setAbierta(!abierta))}
      className={`flex flex-col overflow-hidden bg-white text-left disabled:cursor-default ${elegible ? 'hover:border-gris-500' : ''} ${borde} ${className}`}
    >
      {destacado && (
        <Numero
          className={`flex h-[26px] items-center justify-center text-[11px] ${
            destacado === 'principal' ? 'bg-lima font-semibold' : 'bg-linea-suave font-medium text-gris-700'
          }`}
        >
          {cuandoSeJuega(partido)}
        </Numero>
      )}
      <Fila partido={partido} lado="A" abierta={abierta} destacado={!!destacado} />
      <Fila partido={partido} lado="B" abierta={abierta} destacado={!!destacado} />
      {destacado && partido.sede && (
        <span className="flex h-7 items-center justify-center border-t border-linea-suave bg-fondo-tabla text-xs text-gris-500">
          {partido.sede}
        </span>
      )}
    </button>
  );
}

type PropsFila = { partido: PartidoDelCuadro; lado: 'A' | 'B'; abierta: boolean; destacado: boolean };

function Fila({ partido, lado, abierta, destacado }: PropsFila) {
  const jugador: JugadorDelCuadro | null = lado === 'A' ? partido.jugadorA : partido.jugadorB;
  const jugado = tieneResultado(partido);
  const gano = jugado && jugador !== null && partido.ganadorId === jugador.jugadorId;
  const perdio = jugado && !gano;

  const fondo = gano ? 'bg-lima-tenue' : '';
  const separador = lado === 'B' ? 'border-t border-linea-suave' : '';
  const nombre = !jugador ? 'text-gris-400' : gano || destacado ? 'font-semibold' : perdio ? 'text-gris-400' : '';

  return (
    <span className={`flex ${destacado ? 'h-[34px]' : 'h-[31px]'} items-center justify-between gap-2 px-2.5 ${fondo} ${separador}`}>
      <span
        className={`truncate ${destacado ? 'text-sm' : 'text-[13px]'} ${nombre}`}
        title={jugador ? `${jugador.nombre} ${jugador.apellido}` : undefined}
      >
        {jugador?.apellido ?? 'a definir'}
      </span>
      <Numero className={`shrink-0 text-xs ${gano ? 'font-semibold' : 'text-gris-400'}`}>{marcadorDelLado(partido, lado, abierta)}</Numero>
    </span>
  );
}
