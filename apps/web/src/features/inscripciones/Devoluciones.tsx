import type { BajaDelTorneo } from '@setpoint/shared';
import { MensajeError } from '../../components/Aviso';
import { Numero } from '../../components/Numero';
import { Tarjeta } from '../../components/Tarjeta';
import { diaCorto } from '../torneos/texto';
import { BotonAccion } from './BotonAccion';
import { textoDelError } from './errores';
import { plata } from './texto';
import { useMarcarDevolucion } from './useInscripciones';

type Props = { slug: string; torneoId: number; bajas: BajaDelTorneo[] };

// Las devoluciones que la organización todavía no hizo (estado 4 de inscripciones.html). Las hace
// ella, por fuera del sistema; acá solo las marca (decisión 075). Sin pendientes, no se muestra.
export function Devoluciones({ slug, torneoId, bajas }: Props) {
  const marcar = useMarcarDevolucion(slug, torneoId);
  const pendientes = bajas.filter((b) => b.devolucion === 'pendiente');
  if (pendientes.length === 0) return null;

  return (
    <Tarjeta className="flex flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-2.5 border-b border-linea px-4 py-3.5">
        <h2 className="text-[15px] font-semibold">Devoluciones</h2>
        <Numero className="text-[13px] text-gris-500">
          {pendientes.length} {pendientes.length === 1 ? 'pendiente' : 'pendientes'}
        </Numero>
      </div>
      <ul>
        {pendientes.map((baja) => (
          <li key={baja.id} className="flex items-center gap-3 border-b border-linea-suave px-4 py-3">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-sm font-medium">
                {baja.nombre} {baja.apellido}
              </span>
              <Numero className="text-xs text-gris-500">
                {plata(baja.monto)} · {diaCorto(baja.fecha)}
              </Numero>
            </div>
            <BotonAccion onClick={() => marcar.mutate(baja.id)} disabled={marcar.isPending}>
              {marcar.isPending && marcar.variables === baja.id ? 'Guardando…' : 'Ya se lo devolví'}
            </BotonAccion>
          </li>
        ))}
      </ul>
      {marcar.error && <MensajeError className="px-4 pt-3">{textoDelError(marcar.error)}</MensajeError>}
      <p className="bg-fondo-tabla px-4 py-3 text-[13px] leading-[1.45] text-gris-500">
        Las hacés vos, por fuera del sistema. Marcalas cuando las hagas, así no quedan pendientes.
      </p>
    </Tarjeta>
  );
}
