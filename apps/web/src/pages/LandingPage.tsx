import { PORCENTAJE_COMISION } from '@setpoint/shared';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { IconoMas } from '../components/IconoMas';
import { Logo } from '../components/Logo';
import { Numero } from '../components/Numero';

// El margen de los costados de cada sección: 16 px en el celular, hasta 40 en el escritorio.
const margen = 'px-[clamp(16px,4vw,40px)]';
const tituloDeSeccion = 'text-[clamp(30px,3.8vw,44px)] leading-[1.08] font-semibold tracking-[-0.04em]';

// Una barra por partido: jugado, con fecha, sin coordinar o vencido. Suman 31 de 48.
type EstadoPartido = 'j' | 'f' | 's' | 'v';

const colorPartido: Record<EstadoPartido, string> = {
  j: 'bg-negro',
  f: 'bg-gris-400',
  s: 'bg-linea',
  v: 'bg-rojo',
};

const zonas: [string, string][] = [
  ['A', 'jjjfss'],
  ['B', 'jjjjjf'],
  ['C', 'jjjjfs'],
  ['D', 'jjjfsv'],
  ['E', 'jjjjjj'],
  ['F', 'jjjjfs'],
  ['G', 'jjffss'],
  ['H', 'jjjjfs'],
];

const preguntas: { pregunta: string; respuesta: ReactNode }[] = [
  {
    pregunta: '¿Mis jugadores tienen que instalar algo?',
    respuesta:
      'Para mirar el ranking, las zonas o los cuadros, no: es un link. Para anotar fechas y recibir avisos va a estar la app para Android, que hoy está en prueba y entra con el email, sin contraseña.',
  },
  {
    pregunta: 'Ya tengo un ranking en Excel. ¿Lo pierdo?',
    respuesta:
      'No. Subís una planilla por categoría y entran los jugadores con sus puntos. Las categorías y los torneos del calendario que todavía no tenés se crean solos. Lo que no cierra, lo revisás antes de guardar.',
  },
  {
    pregunta: '¿Sirve si mi circuito no lleva ranking?',
    respuesta:
      'Sí. Empezás con un torneo suelto, sin configurar nada, y cada torneo da sus posiciones finales. Si después querés ranking anual, lo activás.',
  },
  {
    pregunta: '¿Y si alguien me paga en efectivo?',
    respuesta: 'Lo inscribís a mano, mientras haya lugar.',
  },
  {
    pregunta: '¿Cuánto cuesta?',
    respuesta: (
      <>
        Nada por usarlo. De cada inscripción cobrada por MercadoPago, SetPoint se queda con el{' '}
        <Numero>{PORCENTAJE_COMISION}%</Numero>. Lo que cobrás en mano no tiene comisión.
      </>
    ),
  },
  {
    pregunta: '¿Puede anotarse cualquiera?',
    respuesta: 'Lo decidís vos: solo los de tu padrón, cualquiera con tu aprobación, o inscripción abierta.',
  },
];

function Encabezado() {
  const seccion =
    'flex min-h-12 items-center text-linea hover:text-white hover:shadow-[inset_0_-2px_0_var(--color-lima)]';
  return (
    <header className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-x-8 gap-y-2 border-b border-borde-oscuro py-4">
      <Link to="/" className="mr-auto flex min-h-11 items-center">
        <Logo sobreNegro grande />
      </Link>
      <nav className="flex flex-wrap items-center gap-x-8 gap-y-1 text-[17px] font-medium">
        <a href="#producto" className={seccion}>
          Producto
        </a>
        <a href="#funciones" className={seccion}>
          Funciones
        </a>
        <a href="#preguntas" className={seccion}>
          Preguntas
        </a>
      </nav>
      <div className="flex flex-wrap items-center gap-2.5">
        <Link
          to="/ingresar"
          className="flex h-[46px] items-center rounded-[11px] border border-gris-700 px-[18px] text-base font-medium text-white"
        >
          Ingresar
        </Link>
        <Link
          to="/registro"
          className="flex h-[46px] items-center rounded-[11px] bg-lima px-5 text-base font-semibold text-negro"
        >
          Crear mi circuito
        </Link>
      </div>
    </header>
  );
}

function Portada() {
  return (
    <section className={`bg-negro pb-[300px] ${margen}`}>
      <Encabezado />
      <div className="mx-auto flex max-w-[860px] flex-col items-center gap-6 pt-[88px] text-center">
        <span className="flex h-[34px] items-center gap-[9px] rounded-full border border-borde-oscuro px-3.5 text-sm text-gris-400">
          <span className="size-[7px] rounded-full bg-lima" />
          Torneos, ranking e inscripciones
        </span>
        <h1 className="text-[clamp(40px,6vw,72px)] leading-[1.02] font-semibold tracking-[-0.045em] text-balance text-white">
          Tu circuito de tenis, en un solo lugar.
        </h1>
        <p className="max-w-[640px] text-[clamp(17px,1.6vw,20px)] leading-normal text-gris-400">
          Inscripciones con MercadoPago, zonas, cuadros y ranking que se calculan solos. Vos cargás los resultados; tus
          jugadores lo ven en el celular.
        </p>
        <Link
          to="/registro"
          className="mt-1.5 flex h-[52px] items-center rounded-xl bg-lima px-6 text-base font-semibold text-negro"
        >
          Crear mi circuito
        </Link>
        <span className="text-sm text-gris-400">
          Web para la organización · App Android, en prueba · Link público para todos
        </span>
      </div>
    </section>
  );
}

function FilaDelTablero({
  zona,
  partido,
  estado,
  accion,
  vencido = false,
}: {
  zona: string;
  partido: string;
  estado: string;
  accion: string;
  vencido?: boolean;
}) {
  return (
    <div
      className={`flex flex-wrap items-center gap-x-3.5 gap-y-2 px-[18px] py-[11px] ${
        vencido ? 'border-b border-rojo-linea bg-rojo-fondo' : 'border-b border-linea-suave last:border-b-0'
      }`}
    >
      <Numero className={`text-xs ${vencido ? 'text-rojo-texto' : 'text-gris-500'}`}>{zona}</Numero>
      <span className={`flex-[1_1_160px] text-[15px] ${vencido ? 'font-semibold' : ''}`}>{partido}</span>
      <Numero className={`text-[13px] ${vencido ? 'text-rojo-texto' : 'text-gris-500'}`}>{estado}</Numero>
      <span
        className={`flex h-8 items-center rounded-lg px-3 text-[13px] ${
          vencido ? 'bg-negro font-semibold text-white' : 'border border-linea font-medium'
        }`}
      >
        {accion}
      </span>
    </div>
  );
}

// Una captura del tablero dibujada con HTML: es ilustración, así que no la lee el lector de pantalla.
function TableroDeEjemplo() {
  return (
    <div
      aria-hidden
      className="min-w-0 flex-[1_1_640px] overflow-hidden rounded-2xl border border-borde-oscuro bg-carbon"
    >
      <div className="flex h-10 items-center gap-3.5 px-4">
        <span className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-borde-oscuro" />
          <span className="size-2.5 rounded-full bg-borde-oscuro" />
          <span className="size-2.5 rounded-full bg-borde-oscuro" />
        </span>
        <Numero className="min-w-0 flex-1 truncate text-center text-xs text-gris-400">Tablero · Primavera 26 · Tercera</Numero>
        <span className="w-[42px]" />
      </div>
      <div className="flex flex-col bg-white">
        <div className="flex flex-wrap items-center gap-x-[18px] gap-y-1.5 border-b border-linea px-[22px] py-3 text-[13px] text-gris-500">
          <span className="flex items-center gap-[7px] font-semibold text-negro">
            <span className="flex size-[18px] items-center justify-center rounded-[5px] bg-lima">
              <span className="size-1.5 rounded-full bg-negro" />
            </span>
            Polenta Team Tenis
          </span>
          <span className="ml-auto">Inicio</span>
          <span>Circuito</span>
          <span>Padrón</span>
        </div>
        <div className="flex flex-col gap-5 p-[22px]">
          <div className="flex flex-wrap items-end justify-between gap-x-5 gap-y-2.5">
            <div className="flex flex-col gap-1">
              <Numero className="text-xs text-gris-500">grupos en curso</Numero>
              <span className="text-[26px] leading-[1.1] font-semibold tracking-[-0.035em]">Fase de grupos</span>
              <span className="text-sm text-gris-500">8 zonas de 4 · terminan el sábado 20</span>
            </div>
            <span className="flex h-[38px] items-center rounded-control bg-negro px-3.5 text-sm font-semibold text-white">
              Cargar resultado
            </span>
          </div>
          <div className="flex flex-col gap-3 rounded-tarjeta border border-linea px-[18px] py-4">
            <div className="flex items-baseline justify-between gap-2.5">
              <span className="text-sm font-semibold">Partidos de la fase de grupos</span>
              <Numero className="text-sm">
                31 <span className="text-gris-500">/ 48</span>
              </Numero>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(76px,1fr))] gap-3.5">
              {zonas.map(([nombre, partidos]) => (
                <div key={nombre} className="flex flex-col gap-[7px]">
                  <div className="flex gap-[3px]">
                    {[...partidos].map((estado, i) => (
                      <div key={i} className={`h-9 flex-1 rounded-[3px] ${colorPartido[estado as EstadoPartido]}`} />
                    ))}
                  </div>
                  <Numero className="text-xs text-gris-500">
                    {nombre} · {partidos.split('j').length - 1}/6
                  </Numero>
                </div>
              ))}
            </div>
          </div>
          <div className="overflow-hidden rounded-tarjeta border border-linea">
            <FilaDelTablero zona="zona D" partido="Curihual · Nieva" estado="venció ayer" accion="Resolver" vencido />
            <FilaDelTablero zona="zona A" partido="Roa · Peralta" estado="sin coordinar · quedan 6 días" accion="Escribirles" />
            <FilaDelTablero zona="zona G" partido="Bustos · Millán" estado="sáb 14 · 10:00" accion="Cargar" />
          </div>
        </div>
      </div>
    </div>
  );
}

function CelularDeEjemplo() {
  return (
    <div aria-hidden className="flex-[0_1_300px] rounded-[40px] border border-borde-oscuro bg-carbon p-2.5">
      <div className="flex flex-col gap-3.5 rounded-[31px] bg-white px-4 pt-[26px] pb-[18px]">
        <span className="text-[26px] leading-[1.1] font-semibold tracking-[-0.032em]">Cuándo juego</span>
        <div className="flex flex-col gap-2.5 rounded-2xl bg-negro px-4 py-[18px]">
          <span className="text-[15px] font-medium text-gris-400">Tu próximo partido</span>
          <span className="text-[26px] leading-[1.08] font-semibold tracking-[-0.032em] text-white">
            Marcelo Sanhueza
          </span>
          <Numero className="text-lg font-medium text-lima">sáb 14 · 10:00</Numero>
          <span className="text-[15px] text-gris-400">Club Alta Barda · cancha 3</span>
          <span className="mt-1 flex h-12 items-center justify-center rounded-xl bg-lima text-base font-semibold text-negro">
            Escribirle
          </span>
        </div>
        <span className="text-[17px] font-semibold tracking-[-0.02em]">Te falta coordinar</span>
        <div className="flex items-center justify-between gap-2 rounded-xl border border-linea px-3.5 py-3">
          <span className="text-base font-medium">Diego Roa</span>
          <Numero className="text-[15px] text-gris-500">6 días</Numero>
        </div>
      </div>
    </div>
  );
}

function Producto() {
  return (
    <section id="producto" className={`-mt-[240px] scroll-mt-6 ${margen}`}>
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-end justify-center gap-6">
        <TableroDeEjemplo />
        <CelularDeEjemplo />
      </div>
    </section>
  );
}

function QuienLoUsa() {
  return (
    <section className={`pt-10 ${margen}`}>
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-center gap-x-7 gap-y-2 text-[15px] text-gris-500">
        <span>
          Lo usa <span className="font-semibold text-negro">Polenta Team Tenis</span>, de Neuquén
        </span>
        <Numero>77 jugadores</Numero>
        <Numero>2 categorías</Numero>
        <Numero>5 torneos por año</Numero>
      </div>
    </section>
  );
}

function Pantalla({ superficie, titulo, texto, children }: { superficie: string; titulo: string; texto: string; children: ReactNode }) {
  return (
    <div className="flex flex-[1_1_320px] flex-col gap-[18px] rounded-superficie border border-linea p-6">
      <Numero className="text-[13px] text-gris-500">{superficie}</Numero>
      <div className="flex flex-col gap-2">
        <h3 className="text-[22px] leading-[1.15] font-semibold tracking-[-0.03em]">{titulo}</h3>
        <p className="text-[15px] text-gris-500">{texto}</p>
      </div>
      <div aria-hidden className="mt-auto">
        {children}
      </div>
    </div>
  );
}

function FilaDeEjemplo({ children, ultima = false }: { children: ReactNode; ultima?: boolean }) {
  return (
    <div className={`flex justify-between gap-2.5 px-3.5 py-[11px] ${ultima ? '' : 'border-b border-linea-suave'}`}>
      {children}
    </div>
  );
}

function PuestoDeEjemplo({ puesto, nombre, puntos, ultimo = false }: { puesto: number; nombre: string; puntos: number; ultimo?: boolean }) {
  return (
    <div
      className={`grid grid-cols-[22px_minmax(0,1fr)_auto] gap-2 px-3.5 py-2.5 ${ultimo ? '' : 'border-b border-linea-suave'}`}
    >
      <Numero className="text-gris-500">{puesto}</Numero>
      <span className="font-medium">{nombre}</span>
      <Numero>{puntos}</Numero>
    </div>
  );
}

function TresPantallas() {
  return (
    <section className={`pt-28 ${margen}`}>
      <div className="mx-auto flex max-w-[1180px] flex-col gap-10">
        <div className="flex flex-col items-center gap-3.5 text-center">
          <Numero className="text-[13px] text-gris-500">un torneo, tres pantallas</Numero>
          <h2 className={`max-w-[720px] text-balance ${tituloDeSeccion}`}>Cada uno ve lo que necesita, siempre al día</h2>
        </div>
        <div className="flex flex-wrap gap-[18px]">
          <Pantalla
            superficie="web · la organización"
            titulo="Todo el torneo desde la compu"
            texto="Inscripciones, sorteo, resultados y cierre. El tablero dice qué partidos faltan y a quién apurar."
          >
            <div className="flex flex-col rounded-xl border border-linea text-sm">
              <FilaDeEjemplo>
                <span>Inscripciones</span>
                <Numero>28 / 32</Numero>
              </FilaDeEjemplo>
              <FilaDeEjemplo>
                <span>Sorteo</span>
                <Numero className="text-gris-500">confirmado</Numero>
              </FilaDeEjemplo>
              <FilaDeEjemplo ultima>
                <span>Resultados</span>
                <Numero>31 / 48</Numero>
              </FilaDeEjemplo>
            </div>
          </Pantalla>
          <Pantalla
            superficie="app android, en prueba · los jugadores"
            titulo="Cuándo juega, contra quién y dónde"
            texto="Anota la fecha que arregló, el rival la confirma con un toque y le llega un aviso antes del partido."
          >
            <div className="flex flex-col gap-1.5 rounded-tarjeta bg-negro p-4">
              <span className="text-sm text-gris-400">Tu próximo partido</span>
              <span className="text-xl font-semibold tracking-[-0.03em] text-white">Marcelo Sanhueza</span>
              <Numero className="text-[15px] text-lima">sáb 14 · 10:00</Numero>
            </div>
          </Pantalla>
          <Pantalla
            superficie="link · cualquiera"
            titulo="El ranking y los cuadros, sin cuenta"
            texto="Un link que compartís en el grupo y se abre en cualquier celular, sin instalar nada."
          >
            <div className="flex flex-col rounded-xl border border-linea text-[15px]">
              <PuestoDeEjemplo puesto={1} nombre="M. Sanhueza" puntos={165} />
              <PuestoDeEjemplo puesto={2} nombre="P. Curihual" puntos={110} />
              <PuestoDeEjemplo puesto={3} nombre="D. Roa" puntos={100} ultimo />
            </div>
          </Pantalla>
        </div>
      </div>
    </section>
  );
}

function Funcion({ titulo, texto, oscura = false, children }: { titulo: string; texto: string; oscura?: boolean; children: ReactNode }) {
  return (
    <div className={`flex flex-col gap-[18px] rounded-superficie p-6 ${oscura ? 'bg-negro' : 'border border-linea'}`}>
      <div className="flex flex-col gap-2">
        <h3 className={`text-xl leading-[1.15] font-semibold tracking-[-0.03em] ${oscura ? 'text-white' : ''}`}>{titulo}</h3>
        <p className={`text-[15px] ${oscura ? 'text-gris-400' : 'text-gris-500'}`}>{texto}</p>
      </div>
      <div aria-hidden className="mt-auto">
        {children}
      </div>
    </div>
  );
}

const casilleros = [
  { etapa: 'prim', puntos: 10 },
  { etapa: 'ver', puntos: 15 },
  { etapa: 'pre', puntos: 50 },
  { etapa: 'oto', puntos: 15 },
  { etapa: 'inv', puntos: 75, nuevo: true },
];

function Funciones() {
  return (
    <section id="funciones" className={`scroll-mt-6 pt-28 ${margen}`}>
      <div className="mx-auto flex max-w-[1180px] flex-col gap-9">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <h2 className={`max-w-[620px] ${tituloDeSeccion}`}>Lo que antes llevaba una planilla y cien mensajes</h2>
          <p className="max-w-[380px] text-[17px] text-gris-500">Pensado con el reglamento de un circuito real.</p>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
          <Funcion
            titulo="Traés tu planilla"
            texto="Jugadores, puntos, categorías y torneos del calendario entran solos. Revisás solo lo dudoso."
          >
            <div className="flex flex-col gap-2 rounded-xl border border-linea bg-white p-3.5 text-sm">
              <Numero className="text-xs text-gris-500">ranking-tercera-2026.xlsx</Numero>
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
          <Funcion
            titulo="Inscripciones que se cobran solas"
            texto="Pagan con MercadoPago desde el link. Si se llena, hay lista de espera."
            oscura
          >
            <div className="flex flex-col gap-2.5">
              <div className="flex items-baseline justify-between gap-2.5">
                <span className="text-sm text-gris-400">Pagaron</span>
                <Numero className="text-lg font-medium text-white">
                  28 <span className="text-gris-400">/ 32</span>
                </Numero>
              </div>
              {/* El cupo: 28 pagados, 1 reservando, 3 libres. */}
              <div className="flex gap-0.5">
                {Array.from({ length: 32 }, (_, i) => (
                  <div
                    key={i}
                    className={`h-6 flex-1 rounded-[2px] ${i < 28 ? 'bg-lima' : i === 28 ? 'bg-gris-400' : 'bg-borde-oscuro'}`}
                  />
                ))}
              </div>
            </div>
          </Funcion>
          <Funcion
            titulo="Zonas y cuadros sin cuentas"
            texto="Sorteo sembrado por ranking, desempates del reglamento, cuadro principal y consuelo."
          >
            <div className="flex flex-wrap gap-1.5 text-sm font-medium">
              <span className="flex h-8 items-center rounded-full bg-negro px-3 text-white">Serpentina</span>
              <span className="flex h-8 items-center rounded-full border border-linea px-3">Directa</span>
              <span className="flex h-8 items-center rounded-full border border-linea px-3">Bombos</span>
            </div>
          </Funcion>
          <Funcion titulo="Ranking al día" texto="Como en la ATP: cada torneo reemplaza los puntos del año anterior.">
            <div className="grid grid-cols-5 gap-1">
              {casilleros.map(({ etapa, puntos, nuevo }) => (
                <div
                  key={etapa}
                  className={`flex flex-col items-center gap-0.5 rounded-[7px] py-[7px] ${nuevo ? 'bg-lima' : 'bg-fondo'}`}
                >
                  <Numero className={`text-[11px] ${nuevo ? '' : 'text-gris-500'}`}>{etapa}</Numero>
                  <Numero className="text-[15px] font-medium">{puntos}</Numero>
                </div>
              ))}
            </div>
          </Funcion>
        </div>
      </div>
    </section>
  );
}

function Preguntas() {
  return (
    <section id="preguntas" className={`scroll-mt-6 pt-28 ${margen}`}>
      <div className="mx-auto flex max-w-[1180px] flex-wrap gap-x-14 gap-y-8">
        <h2 className={`flex-[1_1_300px] ${tituloDeSeccion}`}>Preguntas frecuentes</h2>
        {/* Cerradas al principio: se abren con un clic o con el teclado, sin estado en React. */}
        <div className="flex flex-[2_1_560px] flex-col border-b border-linea">
          {preguntas.map(({ pregunta, respuesta }) => (
            <details key={pregunta} className="group border-t border-linea">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-2 text-lg font-semibold tracking-[-0.02em] [&::-webkit-details-marker]:hidden">
                {pregunta}
                <span className="flex size-8 flex-none items-center justify-center rounded-full border border-linea transition-transform group-open:rotate-45">
                  <IconoMas className="size-3.5 stroke-[1.8]" />
                </span>
              </summary>
              <p className="pr-12 pb-[22px] text-base text-gris-700">{respuesta}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Llamado() {
  return (
    <section className={`pt-28 pb-20 ${margen}`}>
      <div className="mx-auto flex max-w-[1180px] flex-col items-center gap-5 rounded-3xl bg-negro px-[clamp(20px,4vw,48px)] py-[clamp(40px,6vw,72px)] text-center">
        <h2 className="max-w-[680px] text-[clamp(30px,4vw,48px)] leading-[1.06] font-semibold tracking-[-0.04em] text-balance text-white">
          Tu próximo torneo, sin Excel ni comprobantes
        </h2>
        <p className="max-w-[520px] text-[17px] leading-normal text-gris-400">
          Creá tu circuito y publicá un torneo suelto. Si llevás ranking, lo activás después, sin rehacer nada.
        </p>
        <Link
          to="/registro"
          className="mt-1.5 flex h-[52px] items-center rounded-xl bg-lima px-[26px] text-base font-semibold text-negro"
        >
          Crear mi circuito
        </Link>
      </div>
    </section>
  );
}

function Pie() {
  const enlace = 'flex min-h-10 items-center text-gris-700 hover:text-negro';
  return (
    <footer className={`mt-auto ${margen}`}>
      <div className="mx-auto flex max-w-[1180px] flex-col gap-14 border-t border-linea pt-[72px] pb-8">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-x-12 gap-y-10 text-[15px]">
          <div className="flex flex-col gap-3.5">
            <Logo grande />
            <span className="max-w-[240px] text-gris-500">Torneos, ranking e inscripciones para circuitos de tenis.</span>
            <Numero className="text-[13px] text-gris-500">Neuquén, Argentina</Numero>
          </div>
          <nav aria-label="Producto" className="flex flex-col gap-0.5">
            <Numero className="pb-2.5 text-[13px] text-gris-500">producto</Numero>
            <a href="#producto" className={enlace}>
              Cómo se ve
            </a>
            <a href="#funciones" className={enlace}>
              Funciones
            </a>
            <a href="#preguntas" className={enlace}>
              Preguntas
            </a>
          </nav>
          <nav aria-label="Cuenta" className="flex flex-col gap-0.5">
            <Numero className="pb-2.5 text-[13px] text-gris-500">cuenta</Numero>
            <Link to="/ingresar" className={enlace}>
              Ingresar
            </Link>
            <Link to="/registro" className={enlace}>
              Crear mi circuito
            </Link>
          </nav>
        </div>
        <div className="flex flex-wrap justify-between gap-x-6 gap-y-2 border-t border-linea-suave pt-6 text-sm text-gris-500">
          <span>© {new Date().getFullYear()} SetPoint</span>
          <span>Pensado con el reglamento de un circuito real</span>
        </div>
      </div>
    </footer>
  );
}

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white leading-[1.45] text-negro">
      <Portada />
      <Producto />
      <QuienLoUsa />
      <TresPantallas />
      <Funciones />
      <Preguntas />
      <Llamado />
      <Pie />
    </div>
  );
}
