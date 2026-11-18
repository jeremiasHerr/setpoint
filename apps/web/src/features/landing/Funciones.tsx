import type { ReactNode } from 'react';
import { MARCA, type EstadoDeMarca } from '../../components/marcas';
import { Numero } from '../../components/Numero';
import { TituloDeHoja } from './HojaClara';

// El cupo del torneo de ejemplo: 28 pagaron, 1 está reservando y 3 lugares siguen libres.
const CUPO: EstadoDeMarca[] = Array.from({ length: 32 }, (_, i) => (i < 28 ? 'hecho' : i === 28 ? 'en-curso' : 'pendiente'));

const CASILLEROS = [
  { etapa: 'prim', puntos: 10 },
  { etapa: 'ver', puntos: 15 },
  { etapa: 'pre', puntos: 50 },
  { etapa: 'oto', puntos: 15 },
  { etapa: 'inv', puntos: 75, nuevo: true },
];

// Una función por fila, como una tabla: el texto a la izquierda y la miniatura a la derecha.
function Funcion({ titulo, texto, children }: { titulo: string; texto: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_360px] items-center gap-x-12 gap-y-5 border-t border-linea py-8 max-[860px]:grid-cols-[minmax(0,1fr)]">
      <div>
        <h3 className="text-[20px] leading-[1.2] font-semibold tracking-[-0.02em]">{titulo}</h3>
        <p className="mt-2 max-w-[48ch] text-[15px] text-pizarra-500">{texto}</p>
      </div>
      <div aria-hidden>{children}</div>
    </div>
  );
}

export function Funciones() {
  return (
    <section id="funciones" className="scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
        <TituloDeHoja>Lo que antes llevaba una planilla y cien mensajes</TituloDeHoja>
        <p className="max-w-[380px] text-[17px] text-pizarra-500">Pensado con el reglamento de un circuito real.</p>
      </div>
      <div className="mt-10 border-b border-linea">
        <Funcion
          titulo="Traés tu planilla"
          texto="Jugadores, puntos, categorías y torneos del calendario entran solos. Revisás solo lo dudoso."
        >
          <div className="flex flex-col gap-2 rounded-tarjeta border border-linea bg-papel p-3.5 text-sm">
            <Numero className="text-xs text-pizarra-500">ranking-tercera-2026.xlsx</Numero>
            <div className="flex justify-between gap-2.5">
              <span>Importados</span>
              <Numero className="font-medium">74</Numero>
            </div>
            <div className="flex justify-between gap-2.5">
              <span>Para revisar</span>
              <Numero className="font-medium">3</Numero>
            </div>
          </div>
        </Funcion>
        <Funcion titulo="Inscripciones que se cobran solas" texto="Pagan con MercadoPago desde el link. Si se llena, hay lista de espera.">
          <div className="flex flex-col gap-2.5">
            <Numero className="text-[15px] font-medium">
              Pagaron 28 <span className="text-pizarra-500">/ 32</span>
            </Numero>
            <div className="flex gap-0.5">
              {CUPO.map((estado, i) => (
                <i key={i} className={`block h-6 flex-1 rounded-[2px] ${MARCA[estado]}`} />
              ))}
            </div>
          </div>
        </Funcion>
        <Funcion
          titulo="Zonas y cuadros sin cuentas"
          texto="Sorteo sembrado por ranking, desempates del reglamento, cuadro principal y consuelo."
        >
          <div className="flex flex-wrap gap-1.5 text-sm font-medium">
            {['Serpentina', 'Directa', 'Bombos'].map((modo, i) => (
              <span
                key={modo}
                className={`flex h-8 items-center rounded-control px-3 ${
                  i === 0 ? 'bg-noche text-white' : 'border border-linea bg-papel'
                }`}
              >
                {modo}
              </span>
            ))}
          </div>
        </Funcion>
        <Funcion titulo="Ranking al día" texto="Como en la ATP: cada torneo reemplaza los puntos del año anterior.">
          <div className="grid grid-cols-5 gap-1">
            {CASILLEROS.map(({ etapa, puntos, nuevo }) => (
              <div
                key={etapa}
                className={`flex flex-col items-center gap-0.5 rounded-control border py-[7px] ${
                  nuevo ? 'border-lona-borde bg-lona-fondo' : 'border-linea bg-papel'
                }`}
              >
                <Numero className={`text-[11px] ${nuevo ? '' : 'text-pizarra-500'}`}>{etapa}</Numero>
                <Numero className="text-[15px] font-medium">{puntos}</Numero>
              </div>
            ))}
          </div>
        </Funcion>
      </div>
    </section>
  );
}
