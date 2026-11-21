import { useState } from 'react';
import { Link } from 'react-router-dom';
import { IconoMas } from '../../components/IconoMas';
import { Numero } from '../../components/Numero';
import { AvisosAtencion } from './AvisosAtencion';
import { Columna } from './Columna';
import { EncabezadoDelCircuito } from './EncabezadoDelCircuito';
import { PocosInscriptos } from './PocosInscriptos';
import { VinculacionesParaRevisar } from './VinculacionesParaRevisar';
import { TarjetaBorrador } from './TarjetaBorrador';
import { TarjetaInscripcionAbierta } from './TarjetaInscripcionAbierta';
import { TarjetaParaSortear } from './TarjetaParaSortear';
import { TarjetaTerminado } from './TarjetaTerminado';
import { TarjetaTorneoEnJuego } from './TarjetaTorneoEnJuego';
import type { TorneosDeInicio } from './tiposDeInicio';

// Cuántos terminados se ven antes de desplegar el resto.
const TERMINADOS_VISIBLES = 4;

// Con torneos: arriba el circuito, y abajo sus torneos en cuatro columnas, por el momento en que
// está cada uno (decisión 094).
export function InicioConTorneos({ torneos, slug }: { torneos: TorneosDeInicio; slug: string }) {
  const { borradores, enJuego, conInscripcionAbierta, paraSortear, terminados, avisos, pocosInscriptos } = torneos;
  const [todosLosTerminados, setTodosLosTerminados] = useState(false);
  const terminadosVisibles = todosLosTerminados ? terminados : terminados.slice(0, TERMINADOS_VISIBLES);
  const ocultos = terminados.length - terminadosVisibles.length;

  return (
    <>
      <EncabezadoDelCircuito torneos={torneos} />

      {/* Lo único urgente: en rojo, que en el sistema solo significa vencimiento. */}
      {avisos.length > 0 && (
        <div className="px-4 pt-6 md:px-7">
          <AvisosAtencion avisos={avisos} />
        </div>
      )}

      {pocosInscriptos.length > 0 && (
        <div className="px-4 pt-6 md:px-7">
          <PocosInscriptos avisos={pocosInscriptos} />
        </div>
      )}

      <div className="px-4 pt-6 empty:hidden md:px-7">
        <VinculacionesParaRevisar slug={slug} />
      </div>

      <main className="grid items-start gap-4 px-4 pt-6 pb-8 md:grid-cols-2 md:px-7 xl:grid-cols-4">
        <Columna
          titulo="En preparación"
          marca="border-[1.5px] border-dashed border-amarillo-claro"
          cantidad={borradores.length}
          ayuda="Borradores: todavía no los ve nadie"
          vacia="No hay ninguno a medio armar."
          pie={
            <Link
              to="/torneos/nuevo"
              className="flex min-h-[72px] items-center justify-center gap-2 rounded-tarjeta border-[1.5px] border-dashed border-pizarra-400 text-sm font-medium text-white hover:border-white"
            >
              <IconoMas className="size-[13px] stroke-[2.4]" />
              Armar el próximo torneo
            </Link>
          }
        >
          {borradores.map((torneo) => (
            <TarjetaBorrador key={torneo.id} torneo={torneo} />
          ))}
        </Columna>

        {/* Primero las que ya cerraron: el sorteo es lo próximo que hay que hacer con ellas. */}
        <Columna
          titulo="Inscripción"
          marca="bg-lona"
          cantidad={paraSortear.length + conInscripcionAbierta.length}
          ayuda="Se cobra desde el link de cada una"
          vacia="Cuando publiques un torneo, la inscripción se sigue desde acá."
        >
          {paraSortear.map((torneo) => (
            <TarjetaParaSortear key={torneo.id} torneo={torneo} />
          ))}
          {conInscripcionAbierta.map((torneo) => (
            <TarjetaInscripcionAbierta key={torneo.id} torneo={torneo} />
          ))}
        </Columna>

        <Columna
          titulo="En juego"
          marca="bg-azul-claro"
          cantidad={enJuego.length}
          ayuda="Del sorteo al cierre"
          vacia="Cuando confirmes un sorteo, el torneo pasa acá."
        >
          {enJuego.map((torneo) => (
            <TarjetaTorneoEnJuego key={torneo.id} torneo={torneo} />
          ))}
        </Columna>

        <Columna
          titulo="Terminados"
          marca="bg-pizarra-400"
          cantidad={terminados.length}
          ayuda={torneos.usaRanking ? 'Sus puntos ya están en el ranking' : 'Cada uno con sus posiciones finales'}
          vacia="Todavía no terminó ninguno."
          pie={
            ocultos > 0 && (
              <button
                type="button"
                onClick={() => setTodosLosTerminados(true)}
                className="min-h-11 rounded-tarjeta text-sm font-medium text-white underline-offset-4 hover:underline"
              >
                Ver los <Numero>{ocultos}</Numero> anteriores
              </button>
            )
          }
        >
          {terminadosVisibles.map((torneo) => (
            <TarjetaTerminado key={torneo.id} torneo={torneo} />
          ))}
        </Columna>
      </main>
    </>
  );
}
