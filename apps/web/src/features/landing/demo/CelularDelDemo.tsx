import { Numero } from '../../../components/Numero';
import { TarjetasDeCarga } from './CargaDelDemo';
import type { Bandera, CeldaDeSet, Objetivo } from './lineaDeTiempo';
import { MarcasDeZonas } from './MarcasDeZonas';
import { BotonDelDemo, ChipSinFecha, MarcaDelLogo, Rueda } from './piezas';
import type { RegistroDeElementos } from './registro';

// El recorte de 360 × 480 que se ve por debajo de 1024 px: el mismo recorrido, con toques en vez de cursor.
type Props = {
  banderas: ReadonlySet<Bandera>;
  foco: CeldaDeSet | null;
  apretado: Objetivo | null;
  toque: { x: number; y: number; n: number } | null;
  desplazo: number;
  reg: RegistroDeElementos['reg'];
};

function Franja() {
  return (
    <div className="flex h-11 items-center justify-between bg-noche px-4 text-white">
      <span className="inline-flex items-center gap-2 font-display text-[14px] leading-none font-semibold">
        <MarcaDelLogo className="h-3 w-3.5" />
        Setpoint
      </span>
      <span className="font-mono text-[12px] text-pizarra-400">Primavera 26 · Tercera</span>
    </div>
  );
}

function Grupo({ rojo, titulo, cantidad }: { rojo?: boolean; titulo: string; cantidad: number }) {
  return (
    <div
      className={`flex items-center gap-[9px] border-b px-3.5 py-2 text-[13px] leading-[18px] ${
        rojo ? 'border-rojo-linea bg-rojo-fondo text-rojo-texto' : 'border-linea bg-niebla'
      }`}
    >
      <i className={`size-2 flex-none rounded-[2px] ${rojo ? 'bg-rojo' : 'bg-linea'}`} />
      <b className="font-semibold">
        {titulo} · <Numero>{cantidad}</Numero>
      </b>
    </div>
  );
}

function Fila({ partido, zona, vencida }: { partido: string; zona: string; vencida?: boolean }) {
  return (
    <div className="box-border flex h-[60px] flex-col justify-center gap-1 overflow-hidden border-b border-linea-suave px-3.5 py-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className={`text-[14px] leading-5 ${vencida ? 'font-semibold' : 'font-medium'}`}>{partido}</span>
        <span className="font-mono text-[12px] leading-4 whitespace-nowrap text-pizarra-500">zona {zona}</span>
      </div>
      <div
        className={`flex items-center gap-2 font-mono text-[12px] leading-4 ${vencida ? 'text-rojo-texto' : 'text-pizarra-500'}`}
      >
        {vencida ? (
          'venció ayer'
        ) : (
          <>
            <ChipSinFecha />
            quedan 8 días
          </>
        )}
      </div>
    </div>
  );
}

export function CelularDelDemo({ banderas, foco, apretado, toque, desplazo, reg }: Props) {
  return (
    <>
      <Franja />
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="font-display text-[18px] leading-6 font-semibold tracking-[-0.02em]">Fase de grupos</span>
          <BotonDelDemo chico principal apretado={apretado === 'cargar'} refDelGuion={reg('cargar')}>
            Cargar resultado
          </BotonDelDemo>
        </div>
        <div className="flex flex-col gap-3 rounded-tarjeta border border-linea bg-papel p-3.5">
          <div className="flex items-center justify-between text-[15px] leading-5 font-semibold">
            <span>Los 48 partidos</span>
            <span className="inline-flex items-baseline">
              <Rueda chica nuevo={banderas.has('cuenta')} viejo="31" nuevoValor="32" />
              <span className="font-mono text-[13px] whitespace-pre text-pizarra-500"> / 48</span>
            </span>
          </div>
          <MarcasDeZonas variante="celular" banderas={banderas} />
        </div>
        <div className="flex items-baseline justify-between text-[15px] leading-5 font-semibold">
          <span>Lo que falta</span>
          <span className="text-[12px] leading-4 font-normal text-pizarra-500">Ordenado por urgencia</span>
        </div>
        <div className="overflow-hidden rounded-tarjeta border border-linea bg-papel">
          <Grupo rojo titulo="Vencidos sin jugarse" cantidad={1} />
          <Fila partido="Curihual – Nieva" zona="D" vencida />
          <Grupo titulo="Sin coordinar" cantidad={7} />
          <Fila partido="Roa – Peralta" zona="A" />
          <Fila partido="Roa – Vidal" zona="A" />
        </div>
      </div>

      <div className={`absolute inset-0 bg-niebla ${banderas.has('res') ? 'block' : 'hidden'}`}>
        <Franja />
        <div className="absolute inset-x-0 top-11 bottom-0 overflow-hidden">
          <TarjetasDeCarga celu banderas={banderas} foco={foco} apretado={apretado} desplazo={desplazo} reg={reg} />
        </div>
      </div>

      {toque && (
        <span
          key={toque.n}
          aria-hidden
          className="pointer-events-none absolute z-5 -mt-5 -ml-5 size-10 animate-toque rounded-full bg-lona/45 opacity-0"
          style={{ left: toque.x, top: toque.y }}
        />
      )}
      <div
        className={`pointer-events-none absolute inset-x-0 top-11 bottom-0 z-6 bg-niebla transition-opacity duration-250 ${
          banderas.has('velado') ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </>
  );
}
