import { useNavigate } from 'react-router-dom';
import { Boton } from '../../components/Boton';
import { IconoMas } from '../../components/IconoMas';
import { Numero } from '../../components/Numero';
import { BotonCopiarLink } from './BotonCopiarLink';
import type { MomentoDeEtapa, TorneosDeInicio } from './tiposDeInicio';

const momentos: Record<MomentoDeEtapa, { texto: string; punto: string }> = {
  'sin-edicion': { texto: 'sin edición todavía', punto: 'border border-gris-500' },
  borrador: { texto: 'en preparación', punto: 'border border-dashed border-gris-400' },
  inscripcion: { texto: 'inscripción', punto: 'bg-lima' },
  'en-juego': { texto: 'en juego', punto: 'bg-white' },
  terminado: { texto: 'terminado', punto: 'bg-gris-500' },
};

// La franja negra de arriba del inicio: de quién son los torneos de abajo (decisión 094). Con
// ranking, cada torneo del calendario con su última edición; y las cifras del circuito.
export function EncabezadoDelCircuito({ torneos }: { torneos: TorneosDeInicio }) {
  const navegar = useNavigate();
  const cifras = [
    { rotulo: 'Jugadores', valor: String(torneos.jugadores), acento: false },
    { rotulo: 'Categorías', valor: String(torneos.categorias), acento: false },
    {
      rotulo: 'Recaudado en inscripciones abiertas',
      valor: `$${torneos.recaudadoEnInscripcionesAbiertas.toLocaleString('es-AR')}`,
      acento: true,
    },
  ];

  return (
    <section className="bg-negro px-7 pb-7">
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6 border-t border-borde-oscuro pt-5">
        <div className="flex min-w-0 flex-col gap-2">
          <span className="font-mono text-xs text-gris-400">tu circuito</span>
          <h1 className="text-[32px] leading-[1.05] font-semibold tracking-[-0.04em] text-white">{torneos.organizacion}</h1>
          {torneos.etapas.length > 0 ? (
            <ul aria-label="Torneos del calendario" className="flex flex-wrap gap-1.5 pt-1">
              {torneos.etapas.map(({ nombre, edicion, momento }) => (
                <li
                  key={nombre}
                  className="flex h-[30px] items-center gap-[7px] rounded-full border border-borde-oscuro px-[11px] text-[13px] text-white"
                >
                  <span className={`size-[7px] shrink-0 rounded-full ${momentos[momento].punto}`} />
                  {edicion}
                  <span className="text-gris-400">· {momentos[momento].texto}</span>
                </li>
              ))}
            </ul>
          ) : (
            !torneos.usaRanking && (
              <p className="text-sm text-gris-400">Sin ranking anual: cada torneo termina con su propia tabla de posiciones.</p>
            )
          )}
        </div>

        <div className="flex flex-wrap items-end gap-x-7 gap-y-4">
          {cifras.map(({ rotulo, valor, acento }) => (
            <div key={rotulo} className="flex flex-col gap-0.5">
              <span className="text-[13px] text-gris-400">{rotulo}</span>
              <Numero className={`text-[26px] leading-tight font-medium ${acento ? 'text-lima' : 'text-white'}`}>{valor}</Numero>
            </div>
          ))}
          <div className="flex flex-wrap gap-2.5">
            {torneos.usaRanking && (
              // El enlace del ranking para el grupo, que hoy recibe la planilla por mensaje (F09).
              <BotonCopiarLink
                ruta="/ranking"
                variante="organizador"
                texto="Copiar el link del ranking"
                className="border border-borde-oscuro text-sm"
              />
            )}
            <Boton variante="principal" className="text-sm font-semibold" onClick={() => navegar('/torneos/nuevo')}>
              <IconoMas className="size-[13px] stroke-[2.6]" />
              Nuevo torneo
            </Boton>
          </div>
        </div>
      </div>
    </section>
  );
}
