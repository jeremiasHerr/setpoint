import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Boton } from '../../components/Boton';
import { Etiqueta } from '../../components/Etiqueta';
import { IconoMas } from '../../components/IconoMas';
import { Numero } from '../../components/Numero';
import { Tarjeta } from '../../components/Tarjeta';
import { ResumenOrganizacion } from './ResumenOrganizacion';

// Tres barras de distinta altura: el ranking.
function IconoRanking({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" aria-hidden="true" className={className}>
      <path d="M6 20v-6M12 20V6M18 20v-10" />
    </svg>
  );
}

type Paso = { titulo: string; detalle: string };

type PropsCamino = {
  icono: ReactNode;
  titulo: string;
  etiqueta: ReactNode;
  descripcion: string;
  pasos: Paso[];
  boton: string;
  alElegir: () => void;
  nota: ReactNode;
};

// Las dos formas de arrancar se muestran iguales, una al lado de la otra (decisión 088): solo cambia
// lo que dice cada una.
function Camino({ icono, titulo, etiqueta, descripcion, pasos, boton, alElegir, nota }: PropsCamino) {
  return (
    <section className="flex flex-col gap-[22px] rounded-superficie border border-linea p-7">
      <div className="flex flex-col gap-4">
        {icono}
        <div className="flex flex-col gap-[9px]">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-[22px] font-semibold tracking-[-0.025em]">{titulo}</h2>
            {etiqueta}
          </div>
          <p className="text-[15px] leading-normal text-gris-500">{descripcion}</p>
        </div>
      </div>

      <ol className="flex flex-col gap-2">
        {pasos.map(({ titulo, detalle }, i) => (
          <li key={titulo} className="flex items-start gap-3 rounded-xl bg-fondo p-3.5">
            <Numero className="pt-px text-xs text-gris-500">{i + 1}</Numero>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold">{titulo}</span>
              <span className="text-[13px] text-gris-500">{detalle}</span>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-auto flex flex-col gap-2.5">
        <Boton variante="organizador" grande className="w-full" onClick={alElegir}>
          {boton}
        </Boton>
        <span className="text-center text-sm text-gris-500">{nota}</span>
      </div>
    </section>
  );
}

const pasosTorneo: Paso[] = [
  { titulo: 'Formato', detalle: 'Zonas y cuadros, con cuántos jugadores' },
  { titulo: 'Inscripción', detalle: 'Precio, cupo y hasta cuándo se anotan' },
  { titulo: 'Link', detalle: 'Lo pasás por el grupo y se anotan pagando' },
];

const pasosCircuito: Paso[] = [
  { titulo: 'Categorías', detalle: 'Las que tenga tu circuito, cada una con su ranking' },
  { titulo: 'Torneos del calendario', detalle: 'Los que se repiten cada año' },
  { titulo: 'Tabla de puntos', detalle: 'Cuánto suma cada instancia' },
];

const icono = 'flex size-[52px] shrink-0 items-center justify-center rounded-tarjeta';

type Props = {
  nombre: string;
  jugadores: number;
  usaRanking: boolean;
};

// Primera vez: dos caminos con el mismo peso. Un torneo suelto no pide configurar nada antes; el
// circuito con ranking se configura primero. Cualquiera de los dos deja hacer el otro después.
export function InicioSinTorneos({ nombre, jugadores, usaRanking }: Props) {
  const navegar = useNavigate();

  return (
    <>
      <div className="flex flex-col gap-[7px] px-7 pt-[26px] pb-[22px]">
        <h1 className="text-[30px] font-semibold tracking-[-0.035em]">Hola, {nombre}</h1>
        <p className="text-[15px] text-gris-500">Todavía no tenés torneos. Elegí cómo arrancar: el otro camino lo podés sumar después.</p>
      </div>

      <main className="grid items-start gap-[22px] px-7 pb-7 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-4 md:grid-cols-2">
          <Camino
            icono={
              <div className={`${icono} bg-lima text-negro`}>
                <IconoMas className="size-[22px] stroke-[2.4]" />
              </div>
            }
            titulo="Crear un torneo"
            etiqueta={<Etiqueta>Lo más rápido</Etiqueta>}
            descripcion="Elegís el formato, la fecha y el precio, y compartís el link de inscripción. Al terminar tenés la tabla de posiciones."
            pasos={pasosTorneo}
            boton="Crear mi primer torneo"
            alElegir={() => navegar('/torneos/nuevo')}
            nota={
              <>
                Te lleva <Numero>2</Numero> minutos
              </>
            }
          />
          <Camino
            icono={
              <div className={`${icono} bg-negro text-white`}>
                <IconoRanking className="size-[22px] stroke-[2.4]" />
              </div>
            }
            titulo="Armar un circuito"
            etiqueta={<Etiqueta variante="negra">Con ranking anual</Etiqueta>}
            descripcion="Cargás tus categorías, los torneos del calendario y la tabla de puntos. Cada torneo va sumando y el ranking se arma solo."
            pasos={pasosCircuito}
            boton="Configurar mi circuito"
            alElegir={() => navegar('/circuito')}
            nota="Ahora o después de tu primer torneo"
          />
        </div>

        <aside className="flex flex-col gap-4">
          <ResumenOrganizacion
            titulo="Tu organización"
            filas={[
              { rotulo: 'Torneos', valor: 0 },
              { rotulo: 'Jugadores en el padrón', valor: jugadores },
              { rotulo: 'Ranking anual', valor: usaRanking ? 'activo' : 'sin activar', variante: 'texto' },
            ]}
          />

          <Tarjeta className="flex flex-col gap-[9px] bg-fondo p-[18px]">
            <h2 className="text-sm font-semibold">¿Ya tenés tus jugadores en un Excel?</h2>
            <p className="text-sm leading-normal text-gris-500">
              Subilo y los cargamos al padrón, con sus puntos si los tiene. Revisás todo antes de guardar.
            </p>
            <Link to="/padron/importar" className="mt-0.5 self-start text-sm font-medium hover:text-gris-500">
              Importar padrón →
            </Link>
          </Tarjeta>
        </aside>
      </main>
    </>
  );
}
