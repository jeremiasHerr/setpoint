import { Logo } from '../components/Logo';
import { EncabezadoLanding } from '../components/landing/EncabezadoLanding';
import { EnlaceAccion } from '../components/landing/EnlaceAccion';
import { Funcionalidades } from '../components/landing/Funcionalidades';
import { Hero } from '../components/landing/Hero';
import { HoyVsSetPoint } from '../components/landing/HoyVsSetPoint';
import { ParaJugadores } from '../components/landing/ParaJugadores';

export function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-negro">
      <EncabezadoLanding />
      <main>
        <Hero />
        <HoyVsSetPoint />
        <Funcionalidades />
        <ParaJugadores />

        <section className="flex flex-col items-center gap-[22px] px-4 pb-[76px] text-center sm:px-10">
          <h2 className="max-w-[620px] text-[34px] leading-[1.12] font-semibold tracking-[-0.035em]">
            Empezá con un torneo suelto, sin configurar nada
          </h2>
          <p className="max-w-[560px] text-[17px] leading-normal text-gris-500">
            Si tu circuito lleva ranking anual, lo activás después. Publicar no cuesta nada.
          </p>
          <EnlaceAccion a="/registro" variante="negro">
            Crear mi circuito
          </EnlaceAccion>
        </section>
      </main>

      <footer className="flex items-center justify-between gap-5 border-t border-linea px-4 py-[26px] sm:px-10">
        <Logo invertido />
        <span className="font-mono text-[13px] text-gris-500">Neuquén, Argentina</span>
      </footer>
    </div>
  );
}
