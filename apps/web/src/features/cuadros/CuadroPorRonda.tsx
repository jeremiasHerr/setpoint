import type { CuadroEliminatorio } from '@setpoint/shared';
import { useState } from 'react';
import { Chip } from '../../components/Chip';
import { destacadoDe, lugaresDeLaRonda, rondaEnCurso, rotuloDeRonda, rotuloDelPaseDirecto } from './cuadro';
import { EncabezadoDelCuadro } from './CuadroCompleto';
import { TarjetaPaseDirecto, TarjetaPartido, type Eleccion } from './TarjetaPartido';

// El cuadro en el celular: una ronda a la vez, sin scroll horizontal (decisión 038). Abre en la
// ronda que se está jugando. En la primera, quien tuvo bye aparece en su lugar con la misma
// tarjeta que en el cuadro completo (decisión 083).
// Con eleccion, abre en la ronda del partido elegido y tocar un partido lo elige.
export function CuadroPorRonda({ cuadro, eleccion }: { cuadro: CuadroEliminatorio; eleccion?: Eleccion }) {
  const [ronda, setRonda] = useState(
    () => cuadro.partidos.find((p) => p.id === eleccion?.elegido)?.ronda ?? rondaEnCurso(cuadro),
  );
  const rondas = Array.from({ length: cuadro.rondas }, (_, i) => i + 1);
  const lugares = lugaresDeLaRonda(cuadro, ronda);

  return (
    <section className="flex flex-col gap-4">
      <EncabezadoDelCuadro cuadro={cuadro} />
      <div className="flex flex-wrap gap-1.5">
        {rondas.map((r) => (
          <Chip key={r} activo={r === ronda} onClick={() => setRonda(r)}>
            {rotuloDeRonda(r, cuadro.rondas)}
          </Chip>
        ))}
      </div>
      <div className="flex flex-col gap-2.5">
        {lugares.map((lugar, i) =>
          lugar?.tipo === 'partido' ? (
            <TarjetaPartido
              key={lugar.partido.id}
              partido={lugar.partido}
              destacado={destacadoDe(lugar.partido, cuadro)}
              eleccion={eleccion}
              className="w-full"
            />
          ) : lugar?.tipo === 'pase' ? (
            <TarjetaPaseDirecto key={`pase-${i}`} jugador={lugar.jugador} rotulo={rotuloDelPaseDirecto(cuadro.rondas)} className="w-full" />
          ) : null,
        )}
      </div>
    </section>
  );
}
