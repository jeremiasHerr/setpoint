import { Logo } from '../../components/Logo';
import { BotonCrearCircuito } from './BotonCrearCircuito';

// El pie vuelve a la pared noche, con la misma acción que el hero.
export function Pie() {
  return (
    <footer className="mx-auto flex w-[min(calc(100%-64px),1200px)] flex-wrap items-center gap-x-7 gap-y-2.5 pt-14 pb-[72px] max-[860px]:w-[calc(100%-32px)] max-[860px]:pt-10 max-[860px]:pb-14">
      <Logo sobreNoche grande />
      <p className="mr-auto max-w-[60ch] text-[14px] leading-5 text-pizarra-400 max-[860px]:order-3 max-[860px]:mr-0 max-[860px]:w-full">
        Hecho en Neuquén para los circuitos de tenis amateur.
      </p>
      <BotonCrearCircuito />
    </footer>
  );
}
