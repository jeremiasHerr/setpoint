import type { EnListaDeEspera } from '@setpoint/shared';
import { Numero } from '../../components/Numero';
import { Tarjeta } from '../../components/Tarjeta';
import { diaCorto } from '../torneos/texto';

// Cuántos se ven en la tarjeta: los que siguen. El resto está en la pestaña.
const VISIBLES = 3;

type Props = { listaDeEspera: EnListaDeEspera[]; horasReserva: number };

// Los primeros de la lista de espera, al costado de la tabla: es lo que decide a quién le toca el
// próximo lugar que se libere (decisión 076).
export function ResumenListaDeEspera({ listaDeEspera, horasReserva }: Props) {
  const resto = listaDeEspera.length - VISIBLES;

  return (
    <Tarjeta className="flex flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-2.5 border-b border-linea px-4 py-3.5">
        <h2 className="text-[15px] font-semibold">Lista de espera</h2>
        <span className="font-mono text-[13px] text-gris-500">por orden de llegada</span>
      </div>
      {listaDeEspera.length === 0 ? (
        <p className="px-4 py-3.5 text-sm text-gris-500">Nadie espera un lugar.</p>
      ) : (
        <ul>
          {listaDeEspera.slice(0, VISIBLES).map((enEspera) => (
            <li key={enEspera.id} className="flex h-[46px] items-center gap-3 border-b border-linea-suave px-4">
              <Numero className="text-[13px] text-gris-500">{enEspera.posicion}</Numero>
              <span className={`min-w-0 flex-1 truncate text-sm ${enEspera.posicion === 1 ? 'font-semibold' : ''}`}>
                {enEspera.nombre} {enEspera.apellido}
              </span>
              {enEspera.posicion === 1 && <span className="size-[7px] shrink-0 rounded-full bg-lima" />}
              <Numero className="text-xs text-gris-500">{diaCorto(enEspera.fecha)}</Numero>
            </li>
          ))}
        </ul>
      )}
      <p className="bg-fondo-tabla px-4 py-3 text-[13px] leading-[1.45] text-gris-500">
        {resto > 0 && (
          <>
            Y <Numero>{resto}</Numero> más.{' '}
          </>
        )}
        Cuando se libera un lugar, el primero lo tiene reservado <Numero className="text-negro">{horasReserva}</Numero> horas para
        pagar, y le llega un email.
      </p>
    </Tarjeta>
  );
}
