import type { ReactNode } from 'react';
import { IconoMas } from '../../components/IconoMas';
import { TituloDeHoja } from './HojaClara';

const preguntas: { pregunta: string; respuesta: ReactNode }[] = [
  {
    pregunta: '¿Mis jugadores tienen que instalar algo?',
    respuesta:
      'Para mirar el ranking, las zonas o los cuadros, no: es un link. Para anotar fechas y recibir avisos va a estar la app para Android, que hoy está en prueba y entra con el email, sin contraseña.',
  },
  {
    pregunta: 'Ya tengo un ranking en Excel. ¿Lo pierdo?',
    respuesta:
      'No. Subís una planilla por categoría y entran los jugadores con sus puntos. Las categorías y los torneos del calendario que todavía no tenés se crean solos. Lo que no cierra, lo revisás antes de guardar.',
  },
  {
    pregunta: '¿Sirve si mi circuito no lleva ranking?',
    respuesta:
      'Sí. Empezás con un torneo suelto, sin configurar nada, y cada torneo da sus posiciones finales. Si después querés ranking anual, lo activás.',
  },
  {
    pregunta: '¿Y si alguien me paga en efectivo?',
    respuesta: 'Lo inscribís a mano, mientras haya lugar.',
  },
  {
    pregunta: '¿Cuánto cuesta?',
    // El cargo por jugador inscripto (decisión 103). El monto todavía no está definido.
    respuesta:
      'El primer torneo es gratis. Desde el segundo, pagás un monto fijo por cada jugador inscripto, al cerrar la inscripción. Da lo mismo si te pagó por Mercado Pago o en mano.',
  },
  {
    pregunta: '¿Puede anotarse cualquiera?',
    respuesta: 'Lo decidís vos: solo los de tu padrón, cualquiera con tu aprobación, o inscripción abierta.',
  },
];

export function Preguntas() {
  return (
    <section id="preguntas" className="scroll-mt-24">
      <div className="flex flex-wrap gap-x-14 gap-y-8">
        <div className="min-w-0 flex-[1_1_300px]">
          <TituloDeHoja>Preguntas frecuentes</TituloDeHoja>
        </div>
        {/* Cerradas al principio: se abren con un clic o con el teclado, sin estado en React. */}
        <div className="flex min-w-0 flex-[2_1_560px] flex-col border-b border-linea">
          {preguntas.map(({ pregunta, respuesta }) => (
            <details key={pregunta} className="group border-t border-linea">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-2 text-[18px] leading-[1.3] font-semibold tracking-[-0.02em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-noche [&::-webkit-details-marker]:hidden">
                {pregunta}
                <span className="flex size-8 flex-none items-center justify-center rounded-full border border-linea transition-transform group-open:rotate-45 motion-reduce:transition-none">
                  <IconoMas className="size-3.5 stroke-[1.8]" />
                </span>
              </summary>
              <p className="pr-12 pb-[22px] text-[16px] text-pizarra-700 max-[860px]:pr-4">{respuesta}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
