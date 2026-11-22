// Cómo se dice una superficie y el cruce en cada una (F18, decisión 126). Lo usan la web y la app,
// para que las dos digan lo mismo.
import type { CruceEnSuperficie } from './schemas/cara-a-cara';
import { superficies, type Superficie } from './schemas/circuito';

// "polvo", "cemento": la etiqueta que va dentro de una frase o en un filtro.
export function cortaDe(superficie: Superficie) {
  return superficies.find((s) => s.clave === superficie)!.corta;
}

// Una frase por superficie: "En polvo están 2 a 2. La única vez que jugaron en cemento ganó
// Sanhueza." Es la respuesta que busca quien abre la comparativa antes de jugar en una cancha que
// conoce.
export function cruceEnPalabras(cruces: CruceEnSuperficie[], apellidoA: string, apellidoB: string) {
  return cruces
    .map(({ superficie, jugados, ganadosA, ganadosB }) => {
      const en = cortaDe(superficie);
      if (jugados === 1) return `La única vez que jugaron en ${en} ganó ${ganadosA === 1 ? apellidoA : apellidoB}.`;
      if (ganadosA === ganadosB) return `En ${en} están ${ganadosA} a ${ganadosB}.`;
      const [lider, mas, menos] = ganadosA > ganadosB ? [apellidoA, ganadosA, ganadosB] : [apellidoB, ganadosB, ganadosA];
      return `En ${en} gana ${lider} ${mas} a ${menos}.`;
    })
    .join(' ');
}
