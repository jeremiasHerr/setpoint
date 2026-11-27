import type { FaseDelTorneo, Formato, TorneoPublico } from '@setpoint/shared';
import { ConCifras } from '../../components/Numero';

type Paso = { nombre: string; detalle: string; fase: FaseDelTorneo | 'final' };

// 'AAAA-MM-DD' -> "14/12"
const corta = (fecha: string) => `${Number(fecha.slice(8, 10))}/${Number(fecha.slice(5, 7))}`;
const mayuscula = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);
const duracion = (dias: number) =>
  dias % 7 === 0 ? (dias === 7 ? 'una semana' : `${dias / 7} semanas`) : dias === 1 ? '1 día' : `${dias} días`;

// El cronograma de la convocatoria (decisión 160), que el reglamento pide anunciar al convocar. Las
// zonas van con sus fechas, que salen del inicio y su plazo. Las rondas, con su plazo: una ronda que
// se atrasa corre todas las que vienen, y la página no tiene que prometer una fecha que se mueve.
export function Cronograma({ torneo, formato }: { torneo: TorneoPublico; formato: Formato }) {
  const [zonas, ...rondas] = formato.cronograma;
  const final = rondas.at(-1);
  const antesDeLaFinal = rondas.slice(0, -1);

  const pasos: Paso[] = [
    {
      nombre: 'Inscripción',
      detalle: torneo.cierreInscripcion ? `hasta el ${corta(torneo.cierreInscripcion)}` : 'hasta que cierre',
      fase: 'inscripcion',
    },
    { nombre: 'Sorteo', detalle: 'después del cierre', fase: 'sorteo' },
    {
      nombre: 'Zonas',
      detalle: zonas.desde && zonas.hasta ? `del ${corta(zonas.desde)} al ${corta(zonas.hasta)}` : duracion(zonas.dias),
      fase: 'zonas',
    },
  ];
  if (antesDeLaFinal.length > 0) {
    const primera = mayuscula(antesDeLaFinal[0].nombre);
    pasos.push({
      nombre: antesDeLaFinal.length === 1 ? primera : `${primera} a ${antesDeLaFinal.at(-1)!.nombre}`,
      detalle: `${duracion(torneo.plazoPorRondaDias)} cada ronda`,
      fase: 'cuadros',
    });
  }
  if (final) {
    pasos.push({
      nombre: 'Final',
      detalle: final.desde ? `semana del ${corta(final.desde)}, estimada` : duracion(final.dias),
      // Con solo la final, los cuadros son la final.
      fase: antesDeLaFinal.length === 0 ? 'cuadros' : 'final',
    });
  }

  // Hasta dónde llegó el torneo: lo de antes ya pasó, y el que coincide con la fase es el de ahora.
  const actual = torneo.fase === 'terminado' ? pasos.length : pasos.findIndex((p) => p.fase === torneo.fase);

  return (
    <section className="flex flex-col gap-4 rounded-[16px] border border-linea bg-papel p-[18px]">
      <h2 className="text-base font-semibold">Cronograma</h2>
      {/* En el celular, una lista hacia abajo; en la compu, una línea de izquierda a derecha. */}
      <ol className="relative flex flex-col gap-4 lg:grid lg:auto-cols-fr lg:grid-flow-col lg:gap-3">
        <span className="absolute top-2 bottom-2 left-[6px] w-px bg-linea lg:top-[6px] lg:right-2 lg:bottom-auto lg:left-2 lg:h-px lg:w-auto" aria-hidden />
        {pasos.map((paso, i) => {
          const estado = i < actual ? 'paso' : i === actual ? 'ahora' : 'falta';
          return (
            <li key={paso.nombre} className="relative flex gap-3 lg:flex-col lg:gap-2" aria-current={estado === 'ahora' ? 'step' : undefined}>
              <span
                className={`relative mt-1 size-[13px] shrink-0 rounded-full border-2 lg:mt-0 ${
                  estado === 'ahora'
                    ? 'border-lona-texto bg-lona-texto ring-4 ring-lona-fondo'
                    : estado === 'paso'
                      ? 'border-noche bg-noche'
                      : 'border-pizarra-400 bg-papel'
                }`}
                aria-hidden
              />
              <div className="flex flex-col gap-0.5">
                <span className={`text-[15px] font-semibold ${estado === 'falta' ? 'text-pizarra-700' : ''}`}>
                  {paso.nombre}
                  {estado === 'ahora' && <span className="sr-only"> (ahora)</span>}
                </span>
                <ConCifras className="text-[13px] text-pizarra-500">{paso.detalle}</ConCifras>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
