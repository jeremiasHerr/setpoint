import type { DatosConvocatoria, InstanciaCronograma } from '@setpoint/shared';
import { Campo } from '../../components/Campo';
import { Numero } from '../../components/Numero';
import { Tarjeta } from '../../components/Tarjeta';
import { MensajeError } from './MensajeError';
import { aEntero, rangoDeDias } from './texto';
import type { ErroresConvocatoria } from './useConvocatoria';

const DIAS_POR_SEMANA = 7;
// Los topes de convocatoriaSchema (90 y 30 días), en semanas enteras.
const MAXIMO_SEMANAS_GRUPOS = 12;
const MAXIMO_SEMANAS_RONDA = 4;

type Plazos = Pick<DatosConvocatoria, 'plazoGruposDias' | 'plazoPorRondaDias' | 'fechaInicio'>;

type Props = Plazos & {
  // Sale de calcularFormato: una instancia por línea, con sus fechas si ya hay fecha de inicio.
  cronograma: InstanciaCronograma[];
  errores: ErroresConvocatoria;
  alCambiar: <K extends keyof Plazos>(campo: K, valor: DatosConvocatoria[K]) => void;
};

// La organización piensa los plazos en semanas; el schema los guarda en días.
const aSemanas = (dias: number) => Math.round(dias / DIAS_POR_SEMANA);

export function SeccionPlazos({ plazoGruposDias, plazoPorRondaDias, fechaInicio, cronograma, errores, alCambiar }: Props) {
  const semanasGrupos = aSemanas(plazoGruposDias);
  const semanasRonda = aSemanas(plazoPorRondaDias);

  return (
    <Tarjeta className="flex flex-col gap-4 p-5">
      <h2 className="text-[17px] font-semibold">Plazos</h2>

      <div className="grid gap-3.5 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Campo
            id="torneo-plazo-grupos"
            rotulo="Fase de grupos"
            numerico
            inputMode="numeric"
            sufijo={semanasGrupos === 1 ? 'semana' : 'semanas'}
            value={semanasGrupos || ''}
            onChange={(e) => alCambiar('plazoGruposDias', aEntero(e.target.value, MAXIMO_SEMANAS_GRUPOS) * DIAS_POR_SEMANA)}
            aria-invalid={errores.plazoGruposDias ? true : undefined}
            aria-describedby={errores.plazoGruposDias ? 'torneo-plazo-grupos-error' : undefined}
          />
          <MensajeError id="torneo-plazo-grupos-error">{errores.plazoGruposDias}</MensajeError>
        </div>
        <div className="flex flex-col gap-2">
          <Campo
            id="torneo-plazo-ronda"
            rotulo="Cada ronda eliminatoria"
            numerico
            inputMode="numeric"
            sufijo={semanasRonda === 1 ? 'semana' : 'semanas'}
            value={semanasRonda || ''}
            onChange={(e) => alCambiar('plazoPorRondaDias', aEntero(e.target.value, MAXIMO_SEMANAS_RONDA) * DIAS_POR_SEMANA)}
            aria-invalid={errores.plazoPorRondaDias ? true : undefined}
            aria-describedby={errores.plazoPorRondaDias ? 'torneo-plazo-ronda-error' : undefined}
          />
          <MensajeError id="torneo-plazo-ronda-error">{errores.plazoPorRondaDias}</MensajeError>
        </div>
        <div className="flex flex-col gap-2">
          <Campo
            id="torneo-fecha-inicio"
            rotulo="Empieza"
            type="date"
            numerico
            value={fechaInicio ?? ''}
            onChange={(e) => alCambiar('fechaInicio', e.target.value || null)}
            aria-invalid={errores.fechaInicio ? true : undefined}
            aria-describedby={errores.fechaInicio ? 'torneo-fecha-inicio-error' : undefined}
          />
          <MensajeError id="torneo-fecha-inicio-error">{errores.fechaInicio}</MensajeError>
        </div>
      </div>

      <div className="flex flex-col gap-[7px] rounded-control bg-fondo px-[15px] py-[13px]">
        {fechaInicio === null ? (
          <p className="text-[13px] text-gris-500">Elegí cuándo empieza para ver las fechas de cada instancia.</p>
        ) : (
          cronograma.map(
            ({ nombre, desde, hasta }) =>
              desde &&
              hasta && (
                <Numero key={nombre} className="text-[13px] text-gris-700">
                  {nombre} · {rangoDeDias(desde, hasta)}
                </Numero>
              ),
          )
        )}
      </div>
    </Tarjeta>
  );
}
