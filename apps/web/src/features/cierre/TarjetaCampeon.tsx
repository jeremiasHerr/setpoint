import type { CampeonDelCuadro } from '@setpoint/shared';
import { Numero } from '../../components/Numero';
import { Tarjeta } from '../../components/Tarjeta';
import { nombreDelCuadro } from '../cuadros/cuadro';
import { iniciales } from '../organizador/encabezado';

// Cómo ganó la final: el marcador, o cómo terminó si no se jugó entero.
function ComoGano({ campeon: { rival, estado, sets } }: { campeon: CampeonDelCuadro }) {
  if (estado === 'walkover') return <>le ganó a {rival.apellido} por W.O.</>;
  if (estado === 'abandono') return <>le ganó a {rival.apellido} por abandono</>;
  return (
    <>
      le ganó a {rival.apellido} <Numero>{sets.map((s) => `${s.propios}-${s.rival}`).join(' ')}</Numero>
    </>
  );
}

export function TarjetaCampeon({ campeon, consuelo }: { campeon: CampeonDelCuadro; consuelo: string }) {
  const principal = campeon.cuadro === 'campeonato';
  return (
    <Tarjeta className="flex flex-col gap-[13px] p-[18px]">
      <span className="font-mono text-[11px] text-pizarra-500">{nombreDelCuadro(campeon.cuadro, consuelo).toLowerCase()}</span>
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className={`flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
            principal ? 'bg-lona-fondo text-lona-texto' : 'bg-linea-suave text-pizarra-500'
          }`}
        >
          {iniciales(`${campeon.nombre} ${campeon.apellido}`)}
        </span>
        <div className="flex min-w-0 flex-col gap-px">
          <p className="truncate text-[17px] font-semibold">
            {campeon.nombre} {campeon.apellido}
          </p>
          <p className="text-[13px] text-pizarra-500">
            campeón · <ComoGano campeon={campeon} />
          </p>
        </div>
      </div>
    </Tarjeta>
  );
}
