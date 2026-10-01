import { hoyVsSetPoint } from './datosLanding';

const columnas = 'grid sm:grid-cols-[minmax(0,1fr)_44px_minmax(0,1fr)]';

export function HoyVsSetPoint() {
  return (
    <section id="como-funciona" className="flex flex-col gap-[34px] px-4 pt-[72px] pb-[60px] sm:px-10">
      <div className="flex max-w-[640px] flex-col gap-3">
        <h2 className="text-[38px] leading-[1.1] font-semibold tracking-[-0.035em]">Lo que hoy se hace a mano</h2>
        <p className="text-[17px] leading-normal text-gris-500">
          No inventamos el problema. Es el circuito completo de un torneo, tal como funciona hoy en la mayoría de los
          circuitos amateur.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-linea">
        <div className={`${columnas} hidden border-b border-linea bg-fondo-tabla sm:grid`}>
          <div className="px-[22px] py-3 text-[13px] font-semibold text-gris-500">Hoy</div>
          <div />
          <div className="px-[22px] py-3 text-[13px] font-semibold">Con SetPoint</div>
        </div>

        {hoyVsSetPoint.map((fila) => (
          <div key={fila.hoy} className={`${columnas} items-center border-b border-linea-suave last:border-b-0`}>
            <div className="px-[22px] pt-[18px] pb-1 text-base text-gris-500 sm:pb-[18px]">{fila.hoy}</div>
            <div className="hidden items-center justify-center sm:flex">
              <div className="size-1.5 rounded-full bg-lima" />
            </div>
            <div className="px-[22px] pt-1 pb-[18px] text-base font-medium sm:pt-[18px]">{fila.conSetPoint}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
