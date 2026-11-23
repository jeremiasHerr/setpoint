import { JUGADORES_POR_GRUPO } from '@setpoint/shared';
import { Campo } from '../../components/Campo';
import { Interruptor } from '../../components/Interruptor';
import { Numero } from '../../components/Numero';
import { Tarjeta } from '../../components/Tarjeta';
import { MensajeError } from '../../components/Aviso';
import { aEntero } from './texto';
import type { ErroresConvocatoria } from './useConvocatoria';

// Los mismos topes que convocatoriaSchema.
const MAXIMO_GRUPOS = 32;
const MAXIMO_CLASIFICADOS = JUGADORES_POR_GRUPO - 1;

type Props = {
  cantidadGrupos: number;
  clasificanPorGrupo: number;
  tieneComplementaria: boolean;
  // Cómo llama el circuito a su cuadro consuelo.
  nombreConsuelo: string;
  errores: ErroresConvocatoria;
  alCambiarGrupos: (cantidadGrupos: number) => void;
  alCambiarClasificados: (clasificanPorGrupo: number) => void;
  alCambiarComplementaria: (tieneComplementaria: boolean) => void;
};

export function SeccionFormato({
  cantidadGrupos,
  clasificanPorGrupo,
  tieneComplementaria,
  nombreConsuelo,
  errores,
  alCambiarGrupos,
  alCambiarClasificados,
  alCambiarComplementaria,
}: Props) {
  return (
    <Tarjeta className="flex flex-col gap-4 p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[17px] font-semibold">Formato</h2>
        <span className="text-[13px] text-pizarra-500">de acá sale la cuenta de partidos</span>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Campo
            id="torneo-grupos"
            rotulo="Grupos"
            numerico
            inputMode="numeric"
            sufijo="zonas"
            value={cantidadGrupos || ''}
            onChange={(e) => alCambiarGrupos(aEntero(e.target.value, MAXIMO_GRUPOS))}
            aria-invalid={errores.cantidadGrupos ? true : undefined}
            aria-describedby={errores.cantidadGrupos ? 'torneo-grupos-error' : undefined}
          />
          <MensajeError id="torneo-grupos-error">{errores.cantidadGrupos}</MensajeError>
        </div>
        {/* Fijo: los grupos son siempre de 4, todos contra todos (02-dominio §3.1). */}
        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-semibold text-pizarra-500">Jugadores por grupo</span>
          <div className="flex h-12 items-center justify-between gap-2.5 rounded-control border border-linea bg-niebla px-3.5">
            <Numero className="text-[15px]">{JUGADORES_POR_GRUPO}</Numero>
            <span className="text-[13px] text-pizarra-500">todos contra todos</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Campo
            id="torneo-clasificados"
            rotulo="Clasifican a Campeonato"
            numerico
            inputMode="numeric"
            sufijo="por zona"
            value={clasificanPorGrupo || ''}
            onChange={(e) => alCambiarClasificados(aEntero(e.target.value, MAXIMO_CLASIFICADOS))}
            aria-invalid={errores.clasificanPorGrupo ? true : undefined}
            aria-describedby={errores.clasificanPorGrupo ? 'torneo-clasificados-error' : undefined}
          />
          <MensajeError id="torneo-clasificados-error">{errores.clasificanPorGrupo}</MensajeError>
        </div>
      </div>

      {/* Ayuda en contexto (decisión 134): lo que después frena el cierre, dicho donde se elige. */}
      <p className="text-[13px] text-pizarra-500">
        Si no se llena el cupo, algunas zonas quedan de <Numero>3</Numero>. Para sortear, cada zona necesita al menos{' '}
        <Numero>3</Numero> inscriptos pagos: con <Numero>{cantidadGrupos || 0}</Numero> zonas, hacen falta{' '}
        <Numero>{(cantidadGrupos || 0) * 3}</Numero>.
      </p>

      <div className="flex items-center justify-between gap-4 pt-1">
        <div className="flex flex-col gap-[3px]">
          <h3 id="complementaria-titulo" className="text-[15px] font-medium">
            {nombreConsuelo}
          </h3>
          <p className="text-sm text-pizarra-500">Los que no clasifican siguen jugando en un segundo cuadro. Nadie queda afuera.</p>
        </div>
        <Interruptor encendido={tieneComplementaria} alCambiar={alCambiarComplementaria} aria-labelledby="complementaria-titulo" />
      </div>
    </Tarjeta>
  );
}
