import { MARCA } from '../../../components/marcas';
import { Numero } from '../../../components/Numero';
import { FILA_VENCIDA, FILAS_SIN_COORDINAR, type FilaDeFalta } from './datos';
import type { Bandera } from './lineaDeTiempo';
import { MarcasDeZonas } from './MarcasDeZonas';
import { BotonDelDemo, ChipSinFecha, MarcaDelLogo, Rueda } from './piezas';
import type { RegistroDeElementos } from './registro';

const PESTANAS = ['Inscripciones', 'Zonas', 'Tablero', 'Resultados', 'Cierre'];

// El encabezado del organizador y la franja del torneo: lo que comparten el Tablero y Cargar resultado.
// Es una foto del producto, con "Liga Amateur del Valle" como organización de ejemplo.
export function EncabezadoDelProducto({ activa }: { activa: 'Tablero' | 'Resultados' }) {
  const menu = ['Inicio', 'Torneos', 'Circuito', 'Padrón'];
  return (
    <>
      <div className="flex h-14 items-center gap-4 bg-noche px-7 text-white">
        <span className="flex items-center gap-2 font-display text-[16px] leading-none font-semibold tracking-[-0.02em]">
          <MarcaDelLogo className="h-3.5 w-[17px]" />
          Setpoint
        </span>
        <span className="text-pizarra-400">Liga Amateur del Valle</span>
        <span className="ml-auto flex gap-1">
          {menu.map((item) => (
            <span
              key={item}
              className={`rounded-control px-3 py-1.5 font-medium ${
                item === 'Torneos' ? 'bg-noche-2 text-white' : 'text-pizarra-400'
              }`}
            >
              {item}
            </span>
          ))}
        </span>
      </div>
      <div className="border-b border-linea bg-papel px-7 pt-3.5">
        <p className="flex items-center gap-1.5 text-[14px] leading-5 text-pizarra-500">
          Inicio
          <svg
            viewBox="0 0 10 10"
            className="size-2.5 fill-none stroke-pizarra-400 stroke-[1.7]"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3.5 1.5 L7 5 L3.5 8.5" />
          </svg>
          <b className="font-medium text-noche">Primavera 26 · Tercera</b>
        </p>
        <div className="mt-2 flex gap-6">
          {PESTANAS.map((nombre) => (
            <span
              key={nombre}
              className={`flex h-10 items-center border-b-2 ${
                nombre === activa ? 'border-noche font-semibold text-noche' : 'border-transparent text-pizarra-500'
              }`}
            >
              {nombre}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

function Grupo({ rojo, titulo, cantidad, detalle }: { rojo?: boolean; titulo: string; cantidad: number; detalle: string }) {
  return (
    <div
      className={`flex flex-wrap items-center gap-x-[9px] gap-y-0.5 border-b px-4 py-2.5 text-[14px] leading-5 ${
        rojo ? 'border-rojo-linea bg-rojo-fondo text-rojo-texto' : 'border-linea bg-niebla'
      }`}
    >
      <i className={`size-2 flex-none rounded-[2px] ${rojo ? 'bg-rojo' : 'bg-linea'}`} />
      <b className="font-semibold">
        {titulo} · <Numero>{cantidad}</Numero>
      </b>
      <span className={rojo ? '' : 'text-pizarra-500'}>{detalle}</span>
    </div>
  );
}

function Fila({ fila, vencida }: { fila: FilaDeFalta; vencida?: boolean }) {
  return (
    <div className="grid h-[52px] grid-cols-[76px_minmax(0,1fr)_320px_auto] items-center gap-3 overflow-hidden border-b border-linea-suave px-4 py-2">
      <span className={`font-mono text-[12px] leading-4 ${vencida ? 'text-rojo-texto' : 'text-pizarra-500'}`}>
        {vencida && <span className="mr-1.5 inline-block size-1.5 rounded-full bg-rojo align-[1px]" />}
        zona {fila.zona}
      </span>
      <span className={vencida ? 'font-semibold' : 'font-medium'}>{fila.partido}</span>
      <span
        className={`flex min-w-0 items-center gap-2.5 font-mono text-[13px] leading-[18px] ${
          vencida ? 'text-rojo-texto' : 'text-pizarra-500'
        }`}
      >
        {vencida ? (
          'venció ayer'
        ) : (
          <>
            <ChipSinFecha />
            quedan 8 días
          </>
        )}
      </span>
      <span className="grid grid-cols-[100px_136px] justify-end gap-2">
        {/* Escribirles y la acción principal, siempre en el mismo lugar. */}
        <BotonDelDemo chico className="justify-center">
          Escribirles
        </BotonDelDemo>
        <BotonDelDemo chico principal={vencida} className="justify-center">
          {vencida ? 'Resolver' : 'Anotar fecha'}
        </BotonDelDemo>
      </span>
    </div>
  );
}

const LEYENDA = [
  { texto: 'jugado', marca: MARCA.hecho },
  { texto: 'con fecha', marca: MARCA['en-curso'] },
  { texto: 'sin coordinar', marca: MARCA.pendiente },
  { texto: 'vencido', marca: MARCA.vencido },
];

type Props = {
  banderas: ReadonlySet<Bandera>;
  apretado: boolean;
  reg: RegistroDeElementos['reg'];
};

// El Tablero de Primavera 26 · Tercera, a 1280 de ancho. `apretado` es el botón Cargar resultado.
export function TableroDelDemo({ banderas, apretado, reg }: Props) {
  return (
    <div className="w-[1280px] bg-niebla font-sans text-[14px] leading-[1.43] text-noche">
      <EncabezadoDelProducto activa="Tablero" />
      <div className="flex h-[681px] flex-col gap-5 overflow-hidden px-7 py-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-display text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">Fase de grupos</p>
            <p className="mt-1 text-[14.5px] leading-5 text-pizarra-500">8 zonas de 4. Terminan el sábado 28.</p>
          </div>
          <div className="flex gap-2">
            <BotonDelDemo>Ver cuadros</BotonDelDemo>
            <BotonDelDemo principal apretado={apretado} refDelGuion={reg('cargar')}>
              Cargar resultado
            </BotonDelDemo>
          </div>
        </div>

        <div className="rounded-tarjeta border border-linea bg-papel">
          <div className="flex items-center justify-between gap-3 border-b border-linea-suave px-5 pt-4 pb-3.5 text-[16px] leading-[22px] font-semibold">
            <span>Los 48 partidos, zona por zona</span>
            <span className="inline-flex items-baseline">
              <Rueda nuevo={banderas.has('cuenta')} viejo="31" nuevoValor="32" />
              <span className="font-mono text-[15px] whitespace-pre text-pizarra-500"> / 48</span>
            </span>
          </div>
          <div className="flex flex-col gap-4 px-5 pt-3.5 pb-5">
            <div className="flex gap-[18px] text-[13px] leading-[18px] text-pizarra-500">
              {LEYENDA.map(({ texto, marca }) => (
                <span key={texto} className="flex items-center gap-1.5">
                  <i className={`block size-[9px] rounded-[2px] ${marca}`} />
                  {texto}
                </span>
              ))}
            </div>
            <MarcasDeZonas variante="tablero" banderas={banderas} />
          </div>
        </div>

        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[17px] leading-6 font-semibold tracking-[-0.01em]">Lo que falta</p>
          <p className="text-[14px] leading-5 text-pizarra-500">Ordenado por urgencia</p>
        </div>
        <div className="overflow-hidden rounded-tarjeta border border-linea bg-papel">
          <Grupo rojo titulo="Vencidos sin jugarse" cantidad={1} detalle="Los resolvés vos: cargá el W.O. que corresponda" />
          <Fila fila={FILA_VENCIDA} vencida />
          <Grupo titulo="Sin coordinar" cantidad={7} detalle="Nadie anotó fecha todavía" />
          {FILAS_SIN_COORDINAR.map((fila) => (
            <Fila key={fila.partido} fila={fila} />
          ))}
        </div>
      </div>
    </div>
  );
}
