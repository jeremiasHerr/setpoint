import { Numero } from '../../components/Numero';
import { BotonCopiarLink } from './BotonCopiarLink';
import type { PocosInscriptos as Aviso } from './tiposDeInicio';

function cuandoCierra(dias: number) {
  if (dias === 0) return 'Cierra hoy';
  if (dias === 1) return 'Cierra mañana';
  return (
    <>
      Cierra en <Numero>{dias}</Numero> días
    </>
  );
}

// Las inscripciones que cierran pronto sin los pagos para sortear las zonas (decisión 125). No venció
// nada: va sin rojo, con el punto noche de las vinculaciones para revisar. «Copiar link» es lo que
// se puede hacer desde acá: mandarlo de nuevo al grupo.
export function PocosInscriptos({ avisos }: { avisos: Aviso[] }) {
  return (
    <section className="flex flex-col gap-3 rounded-tarjeta border border-linea bg-papel p-[18px]">
      <h2 className="text-[15px] font-semibold">Faltan inscriptos para sortear</h2>
      <ul className="flex flex-col gap-3">
        {avisos.map((aviso) => (
          <li key={aviso.torneoId} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <div className="flex min-w-0 items-start gap-2.5">
              <span className="mt-[7px] size-[7px] shrink-0 rounded-full bg-noche" />
              <p className="text-sm leading-[1.45]">
                <span className="font-medium">{aviso.nombre}</span>: {aviso.pagaron === 1 ? 'pagó' : 'pagaron'}{' '}
                <Numero>{aviso.pagaron}</Numero> y hacen falta <Numero>{aviso.minimo}</Numero> para las zonas.{' '}
                {cuandoCierra(aviso.diasParaElCierre)}.
              </p>
            </div>
            <BotonCopiarLink ruta={`/torneos/${aviso.torneoId}`} />
          </li>
        ))}
      </ul>
    </section>
  );
}
