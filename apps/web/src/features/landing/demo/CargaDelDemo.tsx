import type { ReactNode } from 'react';
import { Numero } from '../../../components/Numero';
import { CHIPS_DE_ZONA, PARTIDOS_DE_A, PARTIDOS_DE_G, type PartidoDeZona } from './datos';
import type { Bandera, CeldaDeSet, Objetivo } from './lineaDeTiempo';
import { Alternativa, BotonDelDemo } from './piezas';
import type { RegistroDeElementos } from './registro';
import { EncabezadoDelProducto } from './TableroDelDemo';

// Cargar resultado (decisiones 031, 032 y 070): elegir el partido arriba, la carga abajo. Es la misma
// pantalla en la compu y en el celular; `celu` cambia solo las medidas.
type Props = {
  banderas: ReadonlySet<Bandera>;
  foco: CeldaDeSet | null;
  apretado: Objetivo | null;
  // Cuánto bajó la pantalla.
  desplazo: number;
  reg: RegistroDeElementos['reg'];
  celu?: boolean;
};

const TARJETA = 'overflow-hidden rounded-tarjeta border border-linea bg-papel text-noche';

function ChipDeZona({
  letra,
  faltan,
  activa,
  apretada,
  celu,
  refDelGuion,
}: {
  letra: string;
  faltan?: number;
  activa: boolean;
  apretada: boolean;
  celu: boolean;
  refDelGuion?: (el: HTMLElement | null) => void;
}) {
  return (
    <span
      ref={refDelGuion}
      className={`inline-flex items-center rounded-control border text-[14px] leading-none whitespace-nowrap transition-transform duration-[120ms] ${
        celu ? 'h-8 gap-1.5 px-2.5 text-[13px]' : 'h-[34px] gap-[7px] px-[13px]'
      } ${
        activa ? 'border-noche bg-noche font-semibold text-white' : 'border-linea font-medium text-pizarra-700'
      } ${apretada ? 'scale-[.97]' : ''}`}
    >
      Zona {letra}
      {faltan !== undefined && (
        <Numero className={`text-[12px] ${activa ? 'text-lona-borde' : 'text-pizarra-500'}`}>{faltan}</Numero>
      )}
    </span>
  );
}

function ListaDePartidos({
  partidos,
  visible,
  destacado,
  apretado,
  celu,
  refDelGuion,
}: {
  partidos: PartidoDeZona[];
  visible: boolean;
  // El partido abierto: al llegar el primero sin resultado; después, el que se eligió.
  destacado: boolean;
  apretado: boolean;
  celu: boolean;
  refDelGuion?: (el: HTMLElement | null) => void;
}) {
  return (
    <ul
      className={`col-start-1 row-start-1 m-0 grid list-none content-start p-0 ${
        celu ? 'grid-cols-1 gap-2' : 'grid-cols-3 gap-2.5'
      } ${visible ? 'visible' : 'invisible'}`}
    >
      {partidos.map(({ partido, gano }, i) => {
        const abierto = destacado && i === 0;
        return (
          <li
            key={partido}
            ref={i === 0 ? refDelGuion : undefined}
            className={`flex min-w-0 rounded-[8px] bg-papel transition-transform duration-[120ms] ${
              celu ? 'flex-row items-baseline justify-between gap-2.5' : 'flex-col gap-1'
            } ${
              abierto
                ? `border-2 border-noche ring-[3px] ring-lona-borde ${celu ? 'px-[11px] py-[7px]' : 'px-[13px] py-[9px]'}`
                : `border border-linea ${celu ? 'px-3 py-2' : 'px-3.5 py-2.5'}`
            } ${i === 0 && apretado ? 'scale-[.97]' : ''}`}
          >
            <b className={`min-w-0 truncate text-[14px] leading-5 ${abierto ? 'font-semibold' : 'font-normal'}`}>{partido}</b>
            <span className={`text-[13px] leading-[18px] ${celu ? 'flex-none' : ''} ${gano ? 'text-pizarra-500' : 'text-pizarra-700'}`}>
              {gano ? `ganó ${gano}` : 'falta'}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

// Una celda de la grilla de sets. `valores` son los que se ven según el avance de la carga.
function Celda({ foco, celu, children }: { foco: boolean; celu: boolean; children: ReactNode }) {
  return (
    <span
      className={`grid place-items-center rounded-control border border-borde-campo bg-papel ${celu ? 'h-[46px]' : 'h-14'} ${
        foco ? 'outline-2 -outline-offset-1 outline-noche' : ''
      }`}
    >
      {children}
    </span>
  );
}

function Valor({ visible, celu, children }: { visible: boolean; celu: boolean; children: ReactNode }) {
  return (
    <span
      className={`col-start-1 row-start-1 font-mono leading-7 font-medium tabular-nums text-noche transition-opacity duration-[120ms] ${
        celu ? 'text-[19px]' : 'text-[22px]'
      } ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      {children}
    </span>
  );
}

// Las dos tarjetas de Cargar resultado, dentro de la pantalla que se desplaza (`mov`).
export function TarjetasDeCarga({ banderas: f, foco, apretado, desplazo, reg, celu = false }: Props) {
  const nombre = (cambia: boolean, a: string, b: string) => <Alternativa cambia={cambia} a={a} b={b} />;
  const gana = f.has('gana');
  const rotulo = `text-center font-mono text-pizarra-500 ${celu ? 'text-[11px] leading-[13px]' : 'text-[12px] leading-4'}`;
  const nom = (clase: string) =>
    `flex min-w-0 items-center font-sans leading-6 transition-colors duration-200 ${
      celu ? 'gap-2 text-[16px]' : 'gap-2.5 text-[18px]'
    } ${clase}`;

  return (
    <div
      ref={reg('mov')}
      className={`flex flex-col transition-transform duration-[480ms] ease-[cubic-bezier(.4,0,.2,1)] ${
        celu ? 'gap-3 p-4' : 'gap-4 px-7 pt-7 pb-10'
      }`}
      style={{ transform: `translateY(${desplazo}px)` }}
    >
      <div className={TARJETA}>
        <p className={`border-b border-linea font-semibold ${celu ? 'px-4 py-3 text-[14px] leading-5' : 'px-6 py-4 text-[15px] leading-5'}`}>
          Elegí el partido
        </p>
        <div className={`flex flex-col ${celu ? 'gap-3 px-4 py-3.5' : 'gap-4 px-6 py-5'}`}>
          <div className="flex flex-wrap gap-[5px]">
            {CHIPS_DE_ZONA.map(({ letra, faltan }) => {
              const esG = letra === 'G';
              return (
                <ChipDeZona
                  key={letra}
                  letra={letra}
                  faltan={faltan}
                  celu={celu}
                  activa={esG ? f.has('zg') : letra === 'A' && !f.has('zg')}
                  apretada={esG && apretado === 'zonaG'}
                  refDelGuion={esG ? reg('zonaG') : undefined}
                />
              );
            })}
          </div>
          <div className="grid">
            <ListaDePartidos
              partidos={PARTIDOS_DE_A}
              visible={!f.has('zg')}
              destacado={!f.has('bm')}
              apretado={false}
              celu={celu}
            />
            <ListaDePartidos
              partidos={PARTIDOS_DE_G}
              visible={f.has('zg')}
              destacado={f.has('bm')}
              apretado={apretado === 'partido'}
              celu={celu}
              refDelGuion={reg('partido')}
            />
          </div>
        </div>
      </div>

      <div ref={reg('carga')} className={`${TARJETA} ${celu ? 'self-stretch' : 'w-[720px] self-center'}`}>
        <div className={`flex flex-col border-b border-linea ${celu ? 'gap-1 px-4 py-3.5' : 'gap-[5px] px-6 py-5'}`}>
          <p className={`font-display font-semibold tracking-[-0.02em] ${celu ? 'text-[19px] leading-6' : 'text-[22px] leading-7'}`}>
            {nombre(f.has('bm'), 'Roa · Peralta', 'Bustos · Millán')}
          </p>
          <p className={`font-mono text-pizarra-500 ${celu ? 'text-[12px] leading-4' : 'text-[13px] leading-[18px]'}`}>
            {nombre(f.has('bm'), 'zona A · fase de grupos', 'zona G · fase de grupos')}
          </p>
        </div>

        <div className={`flex flex-col ${celu ? 'p-4' : 'px-6 pt-6 pb-5'}`}>
          <div
            className={`grid items-center justify-start ${
              celu
                ? 'grid-cols-[minmax(0,1fr)_50px_50px_62px] gap-x-2 gap-y-2'
                : 'grid-cols-[minmax(0,200px)_84px_84px_118px] gap-x-3.5 gap-y-2.5'
            }`}
          >
            <span />
            <span className={rotulo}>set 1</span>
            <span className={rotulo}>set 2</span>
            <span className={rotulo}>super tie-break</span>

            <span className={nom('font-semibold')}>
              <i className={`size-[7px] flex-none rounded-full transition-colors duration-200 ${gana ? 'bg-lona' : 'bg-linea'}`} />
              {nombre(f.has('bm'), 'Roa', 'Bustos')}
            </span>
            <Celda foco={foco === 'b1'} celu={celu}>
              <Valor visible={f.has('c1')} celu={celu}>6</Valor>
            </Celda>
            <Celda foco={foco === 'b2'} celu={celu}>
              <Valor visible={f.has('c3')} celu={celu}>4</Valor>
            </Celda>
            <Celda foco={foco === 'btb'} celu={celu}>
              <Valor visible={f.has('c5a') && !f.has('c5')} celu={celu}>1</Valor>
              <Valor visible={f.has('c5')} celu={celu}>10</Valor>
            </Celda>

            <span className={nom(gana ? 'font-medium text-pizarra-700' : 'font-semibold')}>
              <i className="size-[7px] flex-none rounded-full bg-linea" />
              {nombre(f.has('bm'), 'Peralta', 'Millán')}
            </span>
            <Celda foco={foco === 'm1'} celu={celu}>
              <Valor visible={f.has('c2')} celu={celu}>3</Valor>
            </Celda>
            <Celda foco={foco === 'm2'} celu={celu}>
              <Valor visible={f.has('c4')} celu={celu}>6</Valor>
            </Celda>
            <Celda foco={foco === 'mtb'} celu={celu}>
              <Valor visible={f.has('c6')} celu={celu}>7</Valor>
            </Celda>
          </div>

          <div
            className={`grid transition-[grid-template-rows] duration-[240ms] ease-out ${
              f.has('resumen') ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            }`}
          >
            <div className="min-h-0 overflow-hidden">
              <div
                className={`flex flex-wrap items-center rounded-tarjeta bg-lona-fondo ${
                  celu ? 'mt-3 gap-x-2.5 gap-y-0.5 px-3 py-2.5' : 'mt-4 gap-x-3 gap-y-1 px-4 py-3'
                }`}
              >
                <i className="size-2 flex-none rounded-full bg-lona-texto" />
                <b className={`font-semibold ${celu ? 'text-[14px] leading-5' : 'text-[15px] leading-[22px]'}`}>
                  Gana Bustos, <Numero>2</Numero> sets a <Numero>1</Numero>
                </b>
                <span className={`font-mono text-pizarra-500 ${celu ? 'text-[12px] leading-4' : 'text-[13px] leading-[18px]'}`}>
                  el tercer set se definió por super tie-break
                </span>
              </div>
            </div>
          </div>

          <div className={`flex flex-wrap ${celu ? 'mt-3 gap-2' : 'mt-4 gap-[9px]'}`}>
            {['Fue walkover', 'Hubo abandono'].map((tipo) => (
              <span
                key={tipo}
                className={`inline-flex items-center rounded-control border border-linea font-medium text-pizarra-700 ${
                  celu ? 'h-8 px-[11px] text-[13px]' : 'h-[34px] px-[13px] text-[14px]'
                }`}
              >
                {tipo}
              </span>
            ))}
          </div>
        </div>

        <div className={`flex flex-col border-t border-linea bg-niebla ${celu ? 'gap-2 px-4 py-3.5' : 'gap-2.5 px-6 py-[18px]'}`}>
          <h4 className="text-[13px] leading-[18px] font-semibold text-pizarra-500">Al guardar</h4>
          <div
            className={`grid [&>*]:col-start-1 [&>*]:row-start-1 [&>*]:transition-opacity [&>*]:duration-[180ms] ${
              celu ? 'text-[14px] leading-5' : 'text-[15px] leading-[22px]'
            }`}
          >
            <p className={`text-pizarra-500 ${f.has('calc') ? 'opacity-0' : ''}`}>
              Completá el resultado para ver cómo queda la zona.
            </p>
            <p className={`text-pizarra-500 ${f.has('calc') && !f.has('previa') ? '' : 'opacity-0'}`}>
              Calculando cómo queda la zona…
            </p>
            <ul className={`flex list-none flex-col gap-[7px] ${f.has('previa') ? '' : 'opacity-0'}`}>
              {[
                <>
                  Bustos queda <Numero>1</Numero>.º de la zona G con <Numero>2</Numero> partidos ganados y por ahora clasifica
                  a Campeonato.
                </>,
                <>
                  Millán queda <Numero>2</Numero>.º y por ahora clasifica a Campeonato.
                </>,
                <>
                  Faltan <Numero>3</Numero> partidos en la zona G.
                </>,
              ].map((linea, i) => (
                <li key={i} className="flex gap-2.5">
                  <span aria-hidden className={`size-[5px] flex-none rounded-full bg-noche ${celu ? 'mt-2' : 'mt-[9px]'}`} />
                  <span>{linea}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className={`flex justify-between border-t border-linea ${
            celu ? 'flex-col items-stretch gap-3 px-4 py-3.5' : 'items-center gap-4 px-6 py-[18px]'
          }`}
        >
          <div className="grid min-w-0 flex-1 [&>p]:col-start-1 [&>p]:row-start-1 [&>p]:self-center">
            <p className={`text-pizarra-500 ${celu ? 'text-[13px] leading-[18px]' : 'text-[14px] leading-5'} ${f.has('guardado') ? 'opacity-0' : ''}`}>
              Podés corregirlo después, mientras no cambie a quién ya se ubicó en los cuadros.
            </p>
            <p className={`text-[15px] leading-[22px] font-semibold ${f.has('guardado') ? '' : 'opacity-0'}`}>Resultado guardado.</p>
          </div>
          <div className="grid flex-none [&>div]:col-start-1 [&>div]:row-start-1 [&>div]:flex [&>div]:justify-end [&_span]:justify-center">
            <div className={`${f.has('guardado') ? 'invisible' : ''} ${celu ? 'flex-col-reverse gap-2' : 'gap-2.5'}`}>
              <BotonDelDemo>Cancelar</BotonDelDemo>
              <BotonDelDemo principal tenue={!gana} apretado={apretado === 'guardar'} refDelGuion={reg('guardar')}>
                Guardar resultado
              </BotonDelDemo>
            </div>
            <div className={`${f.has('guardado') ? '' : 'invisible'} ${celu ? 'flex-col-reverse gap-2' : 'gap-2.5'}`}>
              <BotonDelDemo apretado={apretado === 'volver'} refDelGuion={reg('volver')}>
                Volver al tablero
              </BotonDelDemo>
              <BotonDelDemo principal>Cargar el siguiente partido</BotonDelDemo>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// La pantalla de la compu: el encabezado del producto con Resultados activa, y la carga debajo. Tapa el
// Tablero cuando se abre.
export function CargaDelDemo(props: Omit<Props, 'celu'>) {
  return (
    <div className={`absolute inset-0 ${props.banderas.has('res') ? 'block' : 'hidden'}`}>
      <div className="w-[1280px] bg-niebla font-sans text-[14px] leading-[1.43] text-noche">
        <EncabezadoDelProducto activa="Resultados" />
        <div className="h-[681px] overflow-hidden bg-niebla">
          <TarjetasDeCarga {...props} />
        </div>
      </div>
    </div>
  );
}
