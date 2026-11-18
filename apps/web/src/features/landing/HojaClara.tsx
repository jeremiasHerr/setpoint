import type { ReactNode } from 'react';

// La hoja `niebla` donde vive todo el contenido, sobre la pared noche: Cada uno ve lo que necesita,
// las funciones y las preguntas. Es la única superficie clara de la landing.
export function HojaClara({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto mt-[72px] w-[min(calc(100%-32px),1600px)] rounded-superficie bg-niebla px-[clamp(20px,5vw,104px)] py-[clamp(56px,7vw,104px)] text-noche">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-[clamp(72px,9vw,120px)]">{children}</div>
    </div>
  );
}

export function TituloDeHoja({ children }: { children: ReactNode }) {
  return (
    <h2 className="max-w-[620px] font-display text-[clamp(30px,2.8vw,40px)] leading-[1.1] font-semibold tracking-[-0.03em]">
      {children}
    </h2>
  );
}
