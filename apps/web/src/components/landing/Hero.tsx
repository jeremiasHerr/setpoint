import { Numero } from '../Numero';
import { AvanceZonas } from './AvanceZonas';
import { cifrasPolenta } from './datosLanding';
import { EnlaceAccion } from './EnlaceAccion';

export function Hero() {
  return (
    <section className="flex flex-col gap-11 bg-negro px-4 pt-14 pb-14 sm:px-10 sm:pt-[76px] sm:pb-[68px]">
      <div className="grid items-center gap-[60px] lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="flex flex-col gap-[26px]">
          <div className="flex items-center gap-[9px]">
            <div className="size-[7px] rounded-full bg-lima" />
            <span className="font-mono text-[13px] text-lima">para circuitos de tenis amateur</span>
          </div>
          <h1 className="text-[40px] leading-[1.03] font-semibold tracking-[-0.042em] text-pretty text-white sm:text-[60px]">
            El cuadro, los horarios y el ranking dejan de perderse en el grupo.
          </h1>
          <p className="max-w-[620px] text-[19px] leading-normal text-gris-400">
            Un link siempre actualizado en lugar de veinte mensajes y una planilla que actualiza una sola persona. Los
            jugadores entran desde el celular y ven cuándo juegan, contra quién y dónde.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <EnlaceAccion a="/registro" variante="lima">
              Crear mi circuito
            </EnlaceAccion>
            {/* Todavía no existe la pantalla pública de un torneo */}
            <EnlaceAccion a="#" variante="contornoOscuro">
              Ver un torneo de ejemplo
            </EnlaceAccion>
          </div>
          <p className="text-[15px] text-gris-500">
            Publicar un torneo no cuesta nada. El sistema cobra las inscripciones de los jugadores.
          </p>
        </div>

        <AvanceZonas />
      </div>

      <div className="flex flex-wrap items-center gap-x-[26px] gap-y-2 border-t border-borde-oscuro pt-3.5">
        <span className="text-sm text-gris-500">Hecho con</span>
        <span className="text-[15px] font-semibold text-white">Polenta Team Tenis</span>
        <div className="h-3.5 w-px bg-borde-oscuro" />
        {cifrasPolenta.map((cifra) => (
          <Numero key={cifra} className="text-sm text-gris-400">
            {cifra}
          </Numero>
        ))}
      </div>
    </section>
  );
}
