import { BotonLink } from '../../components/Boton';
import { IconoMas } from '../../components/IconoMas';
import { Numero } from '../../components/Numero';
import { BotonCopiarLink } from './BotonCopiarLink';
import type { TorneosDeInicio } from './tiposDeInicio';

// Arriba del inicio: de quién son los torneos de abajo (decisión 094), con las cifras del circuito.
// Va sobre el fondo blanco de la página, sin una franja propia, y sin los torneos del calendario:
// repetían lo que ya dicen las columnas (decisión 116). Sin rótulo arriba del nombre (decisión 123).
export function EncabezadoDelCircuito({ torneos }: { torneos: TorneosDeInicio }) {
  const cifras = [
    { rotulo: 'Jugadores', valor: String(torneos.jugadores) },
    { rotulo: 'Categorías', valor: String(torneos.categorias) },
    {
      rotulo: 'Recaudado en inscripciones abiertas',
      valor: `$${torneos.recaudadoEnInscripcionesAbiertas.toLocaleString('es-AR')}`,
    },
  ];

  return (
    <section className="px-4 pt-6 md:px-7">
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
        <div className="flex min-w-0 flex-col gap-2">
          <h1 className="text-[32px] leading-[1.05] font-display font-semibold tracking-[-0.02em] text-noche">{torneos.organizacion}</h1>
          {!torneos.usaRanking && (
            <p className="text-sm text-pizarra-500">Sin ranking anual: cada torneo termina con su propia tabla de posiciones.</p>
          )}
        </div>

        <div className="flex flex-wrap items-end gap-x-7 gap-y-4">
          {cifras.map(({ rotulo, valor }) => (
            <div key={rotulo} className="flex flex-col gap-0.5">
              <span className="text-[13px] text-pizarra-500">{rotulo}</span>
              <Numero className="text-[26px] leading-tight font-medium text-noche">{valor}</Numero>
            </div>
          ))}
          <div className="flex flex-wrap gap-2.5">
            {torneos.usaRanking && (
              // El enlace del ranking para el grupo, que hoy recibe la planilla por mensaje (F09).
              <BotonCopiarLink ruta="/ranking" texto="Copiar el link del ranking" className="text-sm" />
            )}
            <BotonLink variante="principal" className="text-sm font-semibold" to="/torneos/nuevo">
              <IconoMas className="size-[13px] stroke-[2.6]" />
              Nuevo torneo
            </BotonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
