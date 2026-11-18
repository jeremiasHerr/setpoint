import { FILA_VENCIDA, FILAS_SIN_COORDINAR } from './demo/datos';
import { MarcasDeZonas } from './demo/MarcasDeZonas';
import { ChipSinFecha } from './demo/piezas';
import { useEscala } from './demo/useEscala';
import { TituloDeHoja } from './HojaClara';

const FILAS = [
  { zona: 'D', partido: FILA_VENCIDA.partido, vencida: true },
  { zona: 'A', partido: FILAS_SIN_COORDINAR[0].partido },
  { zona: 'C', partido: FILAS_SIN_COORDINAR[2].partido },
];

// Cuándo juego, a 390 de ancho: una foto de la app del jugador, achicada al ancho que hay.
function CelularDelJugador() {
  const [ref, escala] = useEscala(390);
  const boton = 'flex h-14 items-center justify-center rounded-control text-[16px] font-semibold';
  return (
    <div className="w-[300px] max-w-full overflow-hidden rounded-[36px] border border-linea bg-papel p-2" aria-hidden="true">
      <div ref={ref} className="overflow-hidden rounded-[28px]">
        <div style={{ zoom: escala, width: 390 }}>
          <div className="flex h-[844px] w-[390px] flex-col bg-niebla font-sans text-noche">
            <div className="flex justify-between px-[30px] pt-3 pb-1 font-mono text-[14px] font-semibold">
              <span>9:41</span>
              <span>5G</span>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-4 pt-1 pb-6">
              <div className="flex min-h-12 items-center justify-between gap-2.5 text-[16px] font-semibold">
                <span>Liga Amateur del Valle</span>
                <span className="inline-flex h-[34px] items-center rounded-full border border-linea px-3 font-mono text-[15px] font-normal text-pizarra-500">
                  Primavera 26
                </span>
              </div>
              <p className="font-display text-[26px] leading-[30px] font-semibold tracking-[-0.02em]">Cuándo juego</p>
              <div className="flex flex-col gap-2.5 rounded-superficie bg-noche p-[22px] text-white">
                <div className="flex items-center justify-between text-[15px] text-pizarra-400">
                  <span>Tu próximo partido</span>
                  <span className="inline-flex h-7 items-center rounded-full border border-borde-noche px-2.5 font-mono text-[14px]">
                    zona C
                  </span>
                </div>
                <p className="font-display text-[34px] leading-9 font-semibold tracking-[-0.025em]">Marcelo Sanhueza</p>
                <hr className="my-1.5 border-0 border-t border-borde-noche" />
                <p className="font-mono text-[26px] leading-[30px] font-medium tabular-nums">sáb 21 · 10:00</p>
                <p className="text-[16px] text-pizarra-400">Club Alta Barda, cancha 3</p>
                <span className={`${boton} mt-1 border border-lona-borde bg-lona text-noche-900`}>Escribirle a Marcelo</span>
              </div>
              <div className="flex items-baseline justify-between text-[20px] font-semibold tracking-[-0.01em]">
                <span>Te falta coordinar</span>
                <span className="font-mono text-[15px] font-normal text-pizarra-500">1 de 3</span>
              </div>
              <div className="flex flex-col gap-3 rounded-tarjeta border border-linea bg-papel p-[18px]">
                <div className="flex items-baseline justify-between gap-2">
                  <b className="text-[20px] font-semibold">Pablo Ojeda</b>
                  <span className="font-mono text-[15px] text-pizarra-700">quedan 8 días</span>
                </div>
                <p className="text-[16px] leading-normal text-pizarra-500">
                  Todavía nadie anotó la fecha. La puede cargar cualquiera de los dos.
                </p>
                <span className={`${boton} bg-noche text-white`}>Anotar la fecha</span>
              </div>
            </div>
            <div className="flex h-16 items-center justify-around border-t border-linea bg-papel text-[15px] text-pizarra-500">
              <span className="font-semibold text-noche">Cuándo juego</span>
              <span>Mi zona</span>
              <span>Ranking</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// La hoja: lo mismo, visto por quien organiza, por quien juega y por cualquiera con el link.
export function CadaUnoVeLoQueNecesita() {
  return (
    <section id="producto" className="scroll-mt-24">
      <TituloDeHoja>Cada uno ve lo que necesita</TituloDeHoja>
      <div className="mt-12 grid grid-cols-[minmax(0,1fr)_300px] items-start gap-12 max-[860px]:grid-cols-[minmax(0,1fr)]">
        <div>
          <div className="@container flex flex-col gap-2 rounded-tarjeta border border-linea bg-papel p-[22px]">
            <h3 className="text-[16px] leading-[22px] font-semibold">La organización, desde la compu</h3>
            <p className="mb-3 text-[15px] leading-[22px] text-pizarra-500">El tablero dice qué partidos faltan y a quién apurar.</p>
            <MarcasDeZonas variante="hoja" />
            <div className="mt-3 flex flex-col border-t border-linea-suave pt-3">
              {FILAS.map(({ zona, partido, vencida }) => (
                <div
                  key={partido}
                  className={`grid grid-cols-[76px_minmax(0,1fr)] gap-x-3 gap-y-1 border-b border-linea-suave py-2.5 last:border-b-0 ${
                    vencida ? '-mx-[22px] border-l-2 border-l-rojo bg-rojo-fondo pr-[22px] pl-5' : ''
                  }`}
                >
                  <span className="self-center font-mono text-[12px] leading-[18px] text-pizarra-500">zona {zona}</span>
                  <span className="self-center text-[14px] leading-5 font-medium">{partido}</span>
                  <span
                    className={`col-start-2 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[12px] leading-[18px] tabular-nums ${
                      vencida ? 'text-rojo-texto' : 'text-pizarra-500'
                    }`}
                  >
                    {/* En el celular la tarjeta es angosta: el plazo baja debajo del chip en vez de salirse. */}
                    {vencida ? (
                      'venció ayer'
                    ) : (
                      <>
                        <ChipSinFecha />
                        <span className="whitespace-nowrap">quedan 8 días</span>
                      </>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8">
            <h3 className="text-[16px] leading-[22px] font-semibold">Y cualquiera con el link</h3>
            <p className="mt-1 text-[15px] leading-[22px] text-pizarra-500">
              El ranking y los cuadros se ven sin instalar nada ni crear una cuenta.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-[16px] leading-[22px] font-semibold">El jugador, desde el celular</h3>
          <p className="mb-3 text-[15px] leading-[22px] text-pizarra-500">Cuándo juega, contra quién y dónde. Nada más.</p>
          <CelularDelJugador />
        </div>
      </div>
    </section>
  );
}
