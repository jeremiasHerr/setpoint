import type { EnListaDeEspera } from '@setpoint/shared';
import { Numero } from '../../components/Numero';
import { Tarjeta } from '../../components/Tarjeta';
import { diaCorto } from '../torneos/texto';

type Props = { listaDeEspera: EnListaDeEspera[]; horasReserva: number };

// La pestaña Lista de espera: todos, en el orden en que van a recibir un lugar. No tiene acciones:
// los lugares pasan solos, por orden de llegada (decisión 076).
export function TablaListaDeEspera({ listaDeEspera, horasReserva }: Props) {
  return (
    <Tarjeta className="flex flex-col overflow-hidden">
      <div className="grid grid-cols-[40px_minmax(0,1fr)_110px] gap-x-1 border-b border-linea bg-niebla px-4 md:px-[18px] py-[11px]">
        <span className="text-[12.5px] font-medium text-noche">#</span>
        <span className="text-xs text-pizarra-500">jugador</span>
        <span className="text-[12.5px] font-medium text-noche">se anotó</span>
      </div>
      {listaDeEspera.length === 0 ? (
        <p className="px-4 md:px-[18px] py-4 text-sm text-pizarra-500">No hay nadie esperando un lugar.</p>
      ) : (
        <ul>
          {listaDeEspera.map((enEspera) => (
            <li
              key={enEspera.id}
              className="grid h-14 grid-cols-[40px_minmax(0,1fr)_110px] items-center gap-x-1 border-b border-linea-suave px-4 md:px-[18px] last:border-b-0"
            >
              <Numero className="text-[13px] text-pizarra-500">{enEspera.posicion}</Numero>
              <span className={`truncate text-[15px] ${enEspera.posicion === 1 ? 'font-semibold' : ''}`}>
                {enEspera.nombre} {enEspera.apellido}
              </span>
              <Numero className="text-[13px] text-pizarra-500">{diaCorto(enEspera.fecha)}</Numero>
            </li>
          ))}
        </ul>
      )}
      <p className="border-t border-linea bg-niebla px-4 md:px-[18px] py-[13px] text-[13px] leading-normal text-pizarra-500">
        Cuando se libera un lugar, el primero lo tiene reservado <Numero className="text-noche">{horasReserva}</Numero> horas para
        pagar, y le llega un email. Si no paga, pasa al siguiente. La lista termina cuando se confirma el sorteo.
      </p>
    </Tarjeta>
  );
}
