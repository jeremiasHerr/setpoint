import { Link } from 'react-router-dom';
import { Numero } from '../../components/Numero';
import { diaConSemanaCorto } from '../torneos/texto';
import type { Aviso } from './tiposDeInicio';

// Lo único urgente de la pantalla: por eso va en rojo, que en el sistema solo significa vencimiento.
// Los vencidos se resuelven en el tablero, con el W.O. (decisión 062). Una inscripción que sigue
// abierta pasada su fecha de cierre no es un partido vencido: lleva el punto noche, y el bloque
// es rojo solo si hay partidos vencidos.
export function AvisosAtencion({ avisos }: { avisos: Aviso[] }) {
  const hayVencidos = avisos.some((aviso) => aviso.tipo === 'partidos-vencidos');
  return (
    <section
      className={`flex flex-col gap-3 rounded-tarjeta border p-[18px] ${hayVencidos ? 'border-rojo-linea bg-rojo-fondo' : 'border-linea bg-papel'}`}
    >
      <h2 className="text-[15px] font-semibold">Necesita tu atención</h2>
      <ul className="flex flex-col gap-2.5">
        {avisos.map((aviso, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span className={`mt-[7px] size-[7px] shrink-0 rounded-full ${aviso.tipo === 'partidos-vencidos' ? 'bg-rojo' : 'bg-noche'}`} />
            {aviso.tipo === 'partidos-vencidos' ? (
              <p className="text-sm leading-[1.45]">
                <Numero>{aviso.partidos}</Numero> {aviso.partidos === 1 ? 'partido' : 'partidos'} de {aviso.categoria}{' '}
                {aviso.partidos === 1 ? 'venció' : 'vencieron'} sin resultado.{' '}
                <Link to={`/torneos/${aviso.torneoId}/tablero`} className="font-medium underline hover:text-pizarra-500">
                  Resolver
                </Link>
              </p>
            ) : (
              <p className="text-sm leading-[1.45]">
                {aviso.categoria}: la inscripción tenía que cerrar el {diaConSemanaCorto(aviso.cierre)} y sigue abierta.{' '}
                <Link to={`/torneos/${aviso.torneoId}/inscripciones`} className="font-medium underline hover:text-pizarra-500">
                  Cerrar la inscripción
                </Link>
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
