import { FormularioRegistro } from '../components/acceso/FormularioRegistro';
import { PantallaAcceso } from '../components/acceso/PantallaAcceso';
import { Tarjeta } from '../components/Tarjeta';

const pasos = [
  { titulo: 'Elegís cómo arrancar', detalle: 'Un torneo suelto o un circuito con ranking' },
  { titulo: 'Cargás tus jugadores', detalle: 'De a uno o subiendo tu planilla' },
  { titulo: 'Publicás el primer torneo', detalle: 'Y compartís el link en tu grupo' },
];

const ayudas = [
  {
    titulo: '¿Sos jugador?',
    detalle: 'No necesitás registrarte. Pedile el link del torneo a tu organización: te inscribís y pagás desde el teléfono.',
  },
  {
    titulo: '¿Ya tenés el ranking en un Excel?',
    detalle: 'Subilo y se cargan todos los jugadores con sus puntos históricos, sin tipear nada.',
  },
];

export function RegistroPage() {
  return (
    <PantallaAcceso pregunta="¿Ya tenés cuenta?" enlace={{ texto: 'Ingresar', a: '/ingresar' }}>
      <div className="mx-auto grid max-w-[814px] items-start gap-5 md:grid-cols-[minmax(0,1fr)_300px]">
        <FormularioRegistro />

        <aside className="flex flex-col gap-4">
          <Tarjeta variante="negra" className="flex flex-col gap-[15px] p-5">
            <h2 className="text-[15px] font-semibold text-white">Lo que sigue</h2>
            <ol className="flex flex-col gap-3.5">
              {pasos.map((paso, i) => {
                const esUltimo = i === pasos.length - 1;
                return (
                  <li key={paso.titulo} className="flex items-start gap-3">
                    <span
                      className={`flex size-[22px] shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold tabular-nums ${
                        esUltimo ? 'bg-lima text-negro' : 'bg-borde-oscuro text-white'
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-white">{paso.titulo}</span>
                      <span className="text-[13px] leading-[1.4] text-gris-400">{paso.detalle}</span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Tarjeta>

          {ayudas.map((ayuda) => (
            <Tarjeta key={ayuda.titulo} className="flex flex-col gap-[9px] p-[18px]">
              <h2 className="text-sm font-semibold">{ayuda.titulo}</h2>
              <p className="text-sm leading-normal text-gris-500">{ayuda.detalle}</p>
            </Tarjeta>
          ))}
        </aside>
      </div>
    </PantallaAcceso>
  );
}
