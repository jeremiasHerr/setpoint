import { Link, useNavigate } from 'react-router-dom';
import { Boton } from '../../components/Boton';
import { Etiqueta } from '../../components/Etiqueta';
import { IconoMas } from '../../components/IconoMas';
import { Numero } from '../../components/Numero';
import { Tarjeta } from '../../components/Tarjeta';
import { ResumenOrganizacion } from './ResumenOrganizacion';

const pasos = [
  { titulo: 'Formato', detalle: 'Zonas y cuadros, con cuántos jugadores' },
  { titulo: 'Inscripción', detalle: 'Precio, cupo y hasta cuándo se anotan' },
  { titulo: 'Link', detalle: 'Lo pasás por el grupo y se anotan pagando' },
];

type Props = {
  nombre: string;
  jugadores: number;
  usaRanking: boolean;
};

// Primera vez: el camino principal es crear un torneo, que no pide configurar nada antes.
// El circuito con ranking queda como segunda opción.
export function InicioSinTorneos({ nombre, jugadores, usaRanking }: Props) {
  const navegar = useNavigate();

  return (
    <>
      <div className="flex flex-col gap-[7px] px-7 pt-[26px] pb-[22px]">
        <h1 className="text-[30px] font-semibold tracking-[-0.035em]">Hola, {nombre}</h1>
        <p className="text-[15px] text-gris-500">Todavía no tenés torneos. Empezá por uno: no hace falta configurar nada antes.</p>
      </div>

      <main className="grid items-start gap-[22px] px-7 pb-7 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-4">
          <section className="flex flex-col gap-[22px] rounded-superficie border-2 border-negro p-7">
            <div className="flex items-start justify-between gap-5">
              <div className="flex flex-col gap-[9px]">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-[22px] font-semibold tracking-[-0.025em]">Crear un torneo</h2>
                  <Etiqueta>Lo más rápido</Etiqueta>
                </div>
                <p className="max-w-[520px] text-[15px] leading-normal text-gris-500">
                  Elegís el formato, la fecha y el precio, y compartís el link de inscripción. Al terminar tenés la tabla de
                  posiciones del torneo.
                </p>
              </div>
              <div className="flex size-[52px] shrink-0 items-center justify-center rounded-tarjeta bg-lima">
                <IconoMas className="size-[22px] stroke-[2.4]" />
              </div>
            </div>

            <ol className="grid gap-3 sm:grid-cols-3">
              {pasos.map(({ titulo, detalle }, i) => (
                <li key={titulo} className="flex flex-col gap-1.5 rounded-xl bg-fondo p-3.5">
                  <Numero className="text-xs text-gris-500">{i + 1}</Numero>
                  <span className="text-sm font-semibold">{titulo}</span>
                  <span className="text-[13px] text-gris-500">{detalle}</span>
                </li>
              ))}
            </ol>

            <div className="flex flex-wrap items-center gap-3.5">
              <Boton variante="organizador" grande onClick={() => navegar('/torneos/nuevo')}>
                Crear mi primer torneo
              </Boton>
              <span className="text-sm text-gris-500">
                Te lleva <Numero>2 minutos</Numero>
              </span>
            </div>
          </section>

          <Tarjeta className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:gap-6">
            <div className="flex flex-col gap-1.5">
              <h2 className="text-[17px] font-semibold">¿Organizás un circuito con ranking anual?</h2>
              <p className="max-w-[560px] text-sm leading-normal text-gris-500">
                Cargá tus categorías, etapas y la tabla de puntos. Los torneos van sumando y el ranking se arma solo. Podés
                hacerlo ahora o después de tu primer torneo.
              </p>
            </div>
            <Boton className="shrink-0" onClick={() => navegar('/circuito')}>
              Configurar mi circuito
            </Boton>
          </Tarjeta>
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
