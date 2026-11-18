import { MARCA, type EstadoDeMarca } from '../../../components/marcas';
import { Alternativa } from './piezas';
import { ZONAS, type Zona } from './datos';
import type { Bandera } from './lineaDeTiempo';

// La barra de marcas del circuito: una marca por partido, un bloque por zona (design.md, Barra de marcas).
// En el demo la zona G cambia: su tercera marca pasa a jugado y la cuenta sube de 2/6 a 3/6.
type Variante = 'tablero' | 'celular' | 'hoja';

const CONTENEDOR: Record<Variante, string> = {
  tablero: 'flex gap-5',
  celular: 'grid grid-cols-4 gap-x-5 gap-y-3.5',
  // Con la tarjeta angosta pasa a cuatro columnas, como en el celular.
  hoja: 'flex flex-wrap gap-x-4 gap-y-[18px] @max-[600px]:grid @max-[600px]:grid-cols-4 @max-[600px]:gap-x-5 @max-[600px]:gap-y-3.5',
};

const ZONA: Record<Variante, string> = {
  tablero: 'flex-1 basis-0',
  celular: '',
  hoja: 'flex-1 basis-0',
};

const MARCAS: Record<Variante, string> = {
  tablero: 'h-9 max-w-[10px] flex-1 basis-0',
  celular: 'h-7 w-2 shrink-0',
  hoja: 'h-9 max-w-[10px] flex-1 basis-0 @max-[600px]:h-7 @max-[600px]:max-w-2',
};

function estadosDeLaZona(z: Zona): EstadoDeMarca[] {
  return [
    ...Array<EstadoDeMarca>(z.jugados).fill('hecho'),
    ...Array<EstadoDeMarca>(z.conFecha).fill('en-curso'),
    ...Array<EstadoDeMarca>(z.sinCoordinar).fill('pendiente'),
    ...Array<EstadoDeMarca>(z.vencidos).fill('vencido'),
  ];
}

export function MarcasDeZonas({ variante, banderas }: { variante: Variante; banderas?: ReadonlySet<Bandera> }) {
  return (
    <div className={CONTENEDOR[variante]}>
      {ZONAS.map((z) => {
        const esLaQueCambia = banderas !== undefined && z.letra === 'G';
        const cuenta = `${z.jugados}/6`;
        return (
          <div
            key={z.letra}
            className={`grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-y-2 ${ZONA[variante]}`}
          >
            <div className="col-span-2 flex gap-[3px]">
              {estadosDeLaZona(z).map((estado, i) => {
                // La marca que se completa: la primera con fecha de la zona G.
                const sube = esLaQueCambia && i === 2 && banderas.has('marca');
                return (
                  <i
                    key={i}
                    className={`block origin-bottom rounded-[2px] ${MARCAS[variante]} ${
                      sube ? `${MARCA.hecho} animate-marca-sube` : MARCA[estado]
                    } ${banderas ? 'transition-colors duration-300' : ''}`}
                  />
                );
              })}
            </div>
            <span className={`font-sans text-[13px] leading-4 font-semibold ${z.vencidos ? 'text-rojo-texto' : ''}`}>
              {z.letra}
            </span>
            <span className="font-mono text-[12px] leading-4 text-pizarra-500 tabular-nums">
              {esLaQueCambia ? (
                <Alternativa
                  cambia={banderas.has('zona')}
                  a={cuenta}
                  b={`${z.jugados + 1}/6`}
                  suave
                />
              ) : (
                cuenta
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
