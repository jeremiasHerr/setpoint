import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { Numero } from '../components/Numero';
import { Tarjeta } from '../components/Tarjeta';

type EstadoPartido = 'jugado' | 'coordinado' | 'pendiente' | 'vencido';

const colorPartido: Record<EstadoPartido, string> = {
  jugado: 'bg-lima',
  coordinado: 'bg-gris-700',
  pendiente: 'bg-borde-oscuro',
  vencido: 'bg-rojo',
};

const zonas: { nombre: string; partidos: EstadoPartido[] }[] = [
  { nombre: 'A', partidos: ['jugado', 'jugado', 'jugado', 'coordinado', 'pendiente', 'pendiente'] },
  { nombre: 'B', partidos: ['jugado', 'jugado', 'jugado', 'jugado', 'jugado', 'coordinado'] },
  { nombre: 'C', partidos: ['jugado', 'jugado', 'jugado', 'jugado', 'coordinado', 'pendiente'] },
  { nombre: 'D', partidos: ['jugado', 'jugado', 'jugado', 'coordinado', 'pendiente', 'vencido'] },
];

const comparaciones = [
  {
    hoy: 'El ranking vive en un Excel que actualiza una sola persona',
    conSetPoint: 'Se actualiza solo al cerrar cada torneo, con cada punto trazable al partido que lo generó',
  },
  {
    hoy: 'Los 78 resultados de cada torneo se leen del grupo y se anotan a mano',
    conSetPoint: 'Se cargan una vez y recalculan tabla, desempates y cuadro en el momento',
  },
  {
    hoy: 'Cuando dos empatan en la zona hay que ir al reglamento y contar sets y games',
    conSetPoint: 'El desempate lo resuelve la cascada del reglamento, escrita de antemano',
  },
  {
    hoy: 'Las inscripciones se cobran por transferencia, con comprobante y verificación manual',
    conSetPoint: 'Checkout que confirma solo, con reserva de cupo y lista de espera',
  },
  {
    hoy: 'Para saber cuándo juega, el jugador le pregunta al organizador',
    conSetPoint: 'Lo ve en su teléfono, y le avisa una notificación cuando cambia algo',
  },
];

const funciones: { titulo: string; texto: string; icono: ReactNode }[] = [
  {
    titulo: 'Zonas con siembra por ranking',
    texto:
      'Serpentina, directa o por bombos. Con 32 inscriptos arma 8 zonas de 4 y los 48 partidos, y todas las zonas suman el mismo ranking acumulado.',
    icono: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 10h18M9 10v10M15 10v10" />
      </>
    ),
  },
  {
    titulo: 'Dos cuadros en paralelo',
    texto:
      'Campeonato y Complementaria corren juntos y cada uno define su campeón. Nadie queda afuera después de la fase de grupos.',
    icono: <path d="M4 6h5v12H4M15 4h5v6h-5M15 14h5v6h-5M9 12h6" />,
  },
  {
    titulo: 'Coordinación entre jugadores',
    texto:
      'Siguen arreglando por WhatsApp, pero la fecha queda anotada y confirmada por los dos. El organizador ve qué falta sin revisar el scroll del grupo.',
    icono: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </>
    ),
  },
  {
    titulo: 'Cobro con MercadoPago',
    texto:
      'El lugar se reserva quince minutos mientras el jugador paga, y la inscripción se confirma sola. Con lista de espera y conciliación por torneo.',
    icono: (
      <>
        <rect x="2.5" y="6" width="19" height="12" rx="2" />
        <path d="M2.5 10h19" />
      </>
    ),
  },
  {
    titulo: 'Ranking por casilleros',
    texto:
      'El mismo mecanismo que usa la ATP: cada etapa tiene su casillero y los puntos nuevos reemplazan a los del año anterior. Configurable por circuito.',
    icono: <path d="M4 19V9M10 19V5M16 19v-7M4 19h16" />,
  },
  {
    titulo: 'Importación de tu planilla',
    texto:
      'Subís el Excel que ya usás. Reconoce a los jugadores aunque el nombre esté escrito distinto y te muestra qué va a pasar antes de guardar nada.',
    icono: <path d="M5 4h14v16l-7-4-7 4z" />,
  },
];

function BarraZonas() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-borde-oscuro bg-carbon p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-white">Fase de grupos</span>
        <Numero className="text-xs text-gris-400">31 de 48</Numero>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {zonas.map(({ nombre, partidos }) => (
          <div key={nombre} className="flex flex-col gap-[7px]">
            <div className="flex gap-0.5">
              {partidos.map((estado, i) => (
                <div key={i} className={`h-[30px] grow rounded-[2px] ${colorPartido[estado]}`} />
              ))}
            </div>
            <Numero className="text-[11px] text-gris-500">
              {nombre} · {partidos.filter((p) => p === 'jugado').length}/{partidos.length}
            </Numero>
          </div>
        ))}
      </div>
      <div className="h-px bg-borde-oscuro" />
      <div className="flex flex-col gap-[9px]">
        <div className="flex items-center justify-between gap-2.5">
          <span className="text-[13px] text-white">Curihual · Nieva</span>
          <Numero className="text-xs text-rojo">venció ayer</Numero>
        </div>
        <div className="flex items-center justify-between gap-2.5">
          <span className="text-[13px] text-white">Roa · Peralta</span>
          <Numero className="text-xs text-gris-400">sin coordinar</Numero>
        </div>
      </div>
    </div>
  );
}

function FilaComparacion({ hoy, conSetPoint }: { hoy: string; conSetPoint: string }) {
  return (
    <div className="grid border-b border-linea-suave last:border-b-0 sm:grid-cols-[minmax(0,1fr)_44px_minmax(0,1fr)] sm:items-center">
      <p className="px-[22px] pt-4 text-base text-gris-500 sm:py-[18px]">{hoy}</p>
      <div className="hidden items-center justify-center sm:flex">
        <div className="size-1.5 rounded-full bg-lima" />
      </div>
      <p className="px-[22px] pt-1.5 pb-4 text-base font-medium sm:py-[18px]">{conSetPoint}</p>
    </div>
  );
}

function TarjetaFuncion({ titulo, texto, icono }: { titulo: string; texto: string; icono: ReactNode }) {
  return (
    <Tarjeta className="flex flex-col gap-2.5 p-[22px]">
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {icono}
      </svg>
      <h3 className="text-[17px] font-semibold">{titulo}</h3>
      <p className="text-[15px] leading-[1.45] text-gris-500">{texto}</p>
    </Tarjeta>
  );
}

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-negro">
      <header className="flex h-[68px] items-center justify-between gap-6 border-b border-linea px-4 sm:px-10">
        <Logo />
        <nav className="flex items-center gap-2">
          <a href="#como-funciona" className="hidden h-9 items-center px-[13px] text-sm text-gris-700 hover:text-negro md:flex">
            Cómo funciona
          </a>
          <a href="#para-jugadores" className="hidden h-9 items-center px-[13px] text-sm text-gris-700 hover:text-negro md:flex">
            Para jugadores
          </a>
          <Link to="/ingresar" className="flex h-9 items-center px-[13px] text-sm text-gris-700 hover:text-negro">
            Ingresar
          </Link>
          <Link
            to="/registro"
            className="flex h-10 items-center rounded-control bg-negro px-[17px] text-sm font-semibold text-white"
          >
            Crear mi circuito
          </Link>
        </nav>
      </header>

      <section className="flex flex-col gap-11 bg-negro px-4 pt-14 pb-[68px] sm:px-10 sm:pt-[76px]">
        <div className="grid items-center gap-[60px] lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="flex flex-col gap-[26px]">
            <div className="flex items-center gap-[9px]">
              <div className="size-[7px] rounded-full bg-lima" />
              <span className="font-mono text-[13px] text-lima">para circuitos de tenis amateur</span>
            </div>
            <h1 className="text-[40px] leading-[1.03] font-semibold tracking-[-0.042em] text-pretty text-white sm:text-[60px]">
              El cuadro, los horarios y el ranking dejan de perderse en el grupo.
            </h1>
            <p className="max-w-[620px] text-[17px] leading-normal text-gris-400 sm:text-[19px]">
              Un link siempre actualizado en lugar de veinte mensajes y una planilla que actualiza una sola persona. Los
              jugadores entran desde el celular y ven cuándo juegan, contra quién y dónde.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/registro"
                className="flex h-[52px] items-center rounded-xl bg-lima px-[22px] text-base font-semibold text-negro"
              >
                Crear mi circuito
              </Link>
              <button
                type="button"
                className="flex h-[52px] items-center rounded-xl border border-borde-oscuro px-[22px] text-base font-medium text-white"
              >
                Ver un torneo de ejemplo
              </button>
            </div>
            <p className="text-[15px] text-gris-500">
              Publicar un torneo no cuesta nada. El sistema cobra las inscripciones de los jugadores.
            </p>
          </div>

          <BarraZonas />
        </div>

        <div className="flex flex-wrap items-center gap-x-[26px] gap-y-2 border-t border-borde-oscuro pt-3.5">
          <span className="text-sm text-gris-500">Hecho con</span>
          <span className="text-[15px] font-semibold text-white">Polenta Team Tenis</span>
          <div className="hidden h-3.5 w-px bg-borde-oscuro sm:block" />
          <Numero className="text-sm text-gris-400">77 jugadores</Numero>
          <Numero className="text-sm text-gris-400">2 categorías</Numero>
          <Numero className="text-sm text-gris-400">5 torneos por año</Numero>
        </div>
      </section>

      <section id="como-funciona" className="flex flex-col gap-[34px] px-4 pt-[72px] pb-[60px] sm:px-10">
        <div className="flex max-w-[640px] flex-col gap-3">
          <h2 className="text-[30px] leading-[1.1] font-semibold tracking-[-0.035em] sm:text-[38px]">
            Lo que hoy se hace a mano
          </h2>
          <p className="text-[17px] leading-normal text-gris-500">
            No inventamos el problema. Es el circuito completo de un torneo, tal como funciona hoy en la mayoría de los
            circuitos amateur.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-linea">
          <div className="hidden grid-cols-[minmax(0,1fr)_44px_minmax(0,1fr)] border-b border-linea bg-fondo-tabla sm:grid">
            <span className="px-[22px] py-3 text-[13px] font-semibold text-gris-500">Hoy</span>
            <span />
            <span className="px-[22px] py-3 text-[13px] font-semibold">Con SetPoint</span>
          </div>
          {comparaciones.map((fila) => (
            <FilaComparacion key={fila.hoy} {...fila} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-[26px] px-4 pt-3 pb-[72px] sm:px-10">
        <h2 className="text-2xl font-semibold tracking-[-0.03em]">Lo que trae adentro</h2>
        <div className="grid gap-[18px] md:grid-cols-2 lg:grid-cols-3">
          {funciones.map((funcion) => (
            <TarjetaFuncion key={funcion.titulo} {...funcion} />
          ))}
        </div>
      </section>

      <section id="para-jugadores" className="px-4 pb-[72px] sm:px-10">
        <div className="grid items-center gap-12 rounded-[20px] bg-fondo p-6 sm:p-11 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex flex-col gap-4">
            <h2 className="text-[28px] leading-[1.12] font-semibold tracking-[-0.035em] sm:text-[32px]">
              Para el jugador, una app en el teléfono
            </h2>
            <p className="text-[17px] leading-normal text-gris-700">
              Ve su próximo partido con rival, club, día y hora. Anota la fecha que arregló y su rival la confirma con un
              toque. Y por primera vez tiene su historial: cuántos ganó, contra quién, y si alguna vez le ganó al que le
              toca el sábado.
            </p>
            <p className="text-base text-gris-500">
              Para mirar el ranking, los cuadros o una ficha no hace falta cuenta ni instalar nada: es un link.
            </p>
          </div>
          <div className="flex flex-col gap-3.5 rounded-2xl bg-negro p-5">
            <span className="text-[13px] text-gris-400">Tu próximo partido</span>
            <span className="text-[26px] leading-[1.1] font-semibold tracking-[-0.03em] text-white">Marcelo Sanhueza</span>
            <Numero className="text-[17px] text-lima">sáb 14 · 10:00</Numero>
            <span className="text-sm text-gris-400">Club Alta Barda · cancha 3</span>
          </div>
        </div>
      </section>

      <section className="flex flex-col items-center gap-[22px] px-4 pb-[76px] text-center sm:px-10">
        <h2 className="max-w-[620px] text-[28px] leading-[1.12] font-semibold tracking-[-0.035em] sm:text-[34px]">
          Empezá con un torneo suelto, sin configurar nada
        </h2>
        <p className="max-w-[560px] text-[17px] leading-normal text-gris-500">
          Si tu circuito lleva ranking anual, lo activás después. Publicar no cuesta nada.
        </p>
        <Link
          to="/registro"
          className="flex h-[52px] items-center rounded-xl bg-negro px-6 text-base font-semibold text-white"
        >
          Crear mi circuito
        </Link>
      </section>

      <footer className="mt-auto flex items-center justify-between gap-5 border-t border-linea px-4 py-[26px] sm:px-10">
        <Logo />
        <span className="font-mono text-[13px] text-gris-500">Neuquén, Argentina</span>
      </footer>
    </div>
  );
}
