import { JUGADORES_POR_GRUPO, type DatosConvocatoria } from '@setpoint/shared';
import { Campo } from '../../components/Campo';
import { Chip } from '../../components/Chip';
import { Tarjeta } from '../../components/Tarjeta';
import { MensajeError } from './MensajeError';
import { aEntero } from './texto';
import type { ErroresConvocatoria } from './useConvocatoria';

// Los mismos topes que convocatoriaSchema.
const MAXIMO_PRECIO = 10_000_000;
const MAXIMO_CUPO = 256;

const MODOS: { valor: DatosConvocatoria['modoInscripcion']; etiqueta: string }[] = [
  { valor: 'cerrada', etiqueta: 'Solo el padrón' },
  { valor: 'con_aprobacion', etiqueta: 'Piden y aprobás' },
  { valor: 'abierta', etiqueta: 'Cualquiera' },
];

type Inscripcion = Pick<DatosConvocatoria, 'precio' | 'categorias' | 'cierreInscripcion' | 'modoInscripcion'>;

type Props = Inscripcion & {
  cantidadGrupos: number;
  errores: ErroresConvocatoria;
  alCambiar: <K extends keyof Inscripcion>(campo: K, valor: DatosConvocatoria[K]) => void;
};

export function SeccionInscripcion({
  precio,
  categorias,
  cierreInscripcion,
  modoInscripcion,
  cantidadGrupos,
  errores,
  alCambiar,
}: Props) {
  function cambiarCupo(indice: number, cupo: number) {
    alCambiar(
      'categorias',
      categorias.map((c, i) => (i === indice ? { ...c, cupo } : c)),
    );
  }

  return (
    <Tarjeta className="flex flex-col gap-4 p-5">
      <h2 className="text-[17px] font-semibold">Inscripción</h2>

      <div className="grid gap-3.5 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Campo
            id="torneo-importe"
            rotulo="Importe"
            numerico
            inputMode="numeric"
            placeholder="$0"
            value={precio ? `$${precio.toLocaleString('es-AR')}` : ''}
            onChange={(e) => alCambiar('precio', aEntero(e.target.value, MAXIMO_PRECIO))}
            aria-invalid={errores.precio ? true : undefined}
            aria-describedby={errores.precio ? 'torneo-importe-error' : undefined}
          />
          <MensajeError id="torneo-importe-error">{errores.precio}</MensajeError>
        </div>

        {/* El cupo es por categoría: cada una es un torneo aparte (docs/decisiones/003). */}
        {categorias.map(({ categoria, cupo }, i) => {
          const id = `torneo-cupo-${i}`;
          const error = errores[`categorias.${i}.cupo`];
          return (
            <div key={categoria} className="flex flex-col gap-2">
              <Campo
                id={id}
                rotulo={categorias.length === 1 ? 'Cupo' : `Cupo de ${categoria}`}
                numerico
                inputMode="numeric"
                sufijo={`${cantidadGrupos} × ${JUGADORES_POR_GRUPO}`}
                value={cupo || ''}
                onChange={(e) => cambiarCupo(i, aEntero(e.target.value, MAXIMO_CUPO))}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${id}-error` : undefined}
              />
              <MensajeError id={`${id}-error`}>{error}</MensajeError>
            </div>
          );
        })}

        <div className="flex flex-col gap-2">
          <Campo
            id="torneo-cierre"
            rotulo="Cierra"
            type="date"
            numerico
            value={cierreInscripcion ?? ''}
            onChange={(e) => alCambiar('cierreInscripcion', e.target.value || null)}
            aria-invalid={errores.cierreInscripcion ? true : undefined}
            aria-describedby={errores.cierreInscripcion ? 'torneo-cierre-error' : undefined}
          />
          <MensajeError id="torneo-cierre-error">{errores.cierreInscripcion}</MensajeError>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-[13px] font-semibold text-gris-500">Quién se puede inscribir</h3>
        <div className="flex flex-wrap gap-2">
          {MODOS.map(({ valor, etiqueta }) => (
            <Chip key={valor} activo={modoInscripcion === valor} onClick={() => alCambiar('modoInscripcion', valor)}>
              {etiqueta}
            </Chip>
          ))}
        </div>
      </div>
    </Tarjeta>
  );
}
