import { BarraDeLaLanding } from '../features/landing/BarraDeLaLanding';
import { CadaUnoVeLoQueNecesita } from '../features/landing/CadaUnoVeLoQueNecesita';
import { Funciones } from '../features/landing/Funciones';
import { Hero } from '../features/landing/Hero';
import { HojaClara } from '../features/landing/HojaClara';
import { Pie } from '../features/landing/Pie';
import { Preguntas } from '../features/landing/Preguntas';

// La landing: una pared noche con el hero y el demo, una sola hoja clara con el contenido y el pie.
export function LandingPage() {
  return (
    <div className="min-h-screen bg-noche-900 text-white">
      <BarraDeLaLanding />
      <main>
        <Hero />
        <HojaClara>
          <CadaUnoVeLoQueNecesita />
          <Funciones />
          <Preguntas />
        </HojaClara>
      </main>
      <Pie />
    </div>
  );
}
