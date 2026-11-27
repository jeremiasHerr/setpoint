import type { ClaveCuadro, Cuadros } from '@setpoint/shared';
import { useState } from 'react';
import { Chip } from '../../components/Chip';
import { ErrorApi } from '../../lib/api';
import { nombreDelCuadro, bajada } from './cuadro';
import { CuadroCompleto } from './CuadroCompleto';
import { CuadroPorRonda } from './CuadroPorRonda';
import { useCuadrosPublicos } from './useCuadrosPublicos';
import { Esqueleto } from '../../components/Esqueleto';

function mensajeDeError(error: Error) {
  if (error instanceof ErrorApi && error.codigo === 'CUADROS_NO_GENERADOS') {
    return 'Los cuadros se arman cuando terminan las zonas. Volvé a mirar más adelante.';
  }
  if (error instanceof ErrorApi && error.codigo === 'SIN_CONEXION') return 'No pudimos conectarnos. Revisá tu conexión y probá de nuevo.';
  return 'No pudimos cargar los cuadros. Probá de nuevo en unos minutos.';
}

// La pestaña Cuadros del torneo en vivo (F08, F10). En escritorio se ven completos y lado a
// lado; en el celular, un cuadro y una ronda a la vez (decisión 038).
export function LosCuadros({ slug, torneoId }: { slug: string; torneoId: string }) {
  const cuadros = useCuadrosPublicos(slug, torneoId);
  if (cuadros.isPending) return <Esqueleto forma="bloque" />;
  if (cuadros.error) return <p className="text-[15px] text-pizarra-700">{mensajeDeError(cuadros.error)}</p>;
  return <Contenido datos={cuadros.data} />;
}

// Hasta 3 rondas (8 jugadores), los cuadros se reparten el ancho y muestran el marcador a la vista
// (decisión 161). Con más, las tarjetas no tienen lugar para los sets: quedan de 190, como siempre.
const RONDAS_PARA_REPARTIR = 3;

function Contenido({ datos }: { datos: Cuadros }) {
  const [elegido, setElegido] = useState<ClaveCuadro>(datos.cuadros[0]?.cuadro ?? 'campeonato');
  const cuadroElegido = datos.cuadros.find((c) => c.cuadro === elegido);
  const repartido = datos.cuadros.every((c) => c.rondas <= RONDAS_PARA_REPARTIR);

  return (
    <section className="flex flex-col gap-4">
      <p className="text-[15px] text-pizarra-500">{bajada(datos.cuadros, datos.clasificadosPorGrupo, datos.nombreCuadroConsuelo)}</p>

      {/* Celular y tablet: un cuadro a la vez y una ronda a la vez, sin scroll horizontal. */}
      <div className="flex flex-col gap-4 xl:hidden">
        {datos.cuadros.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            {datos.cuadros.map((c) => (
              <Chip key={c.cuadro} activo={c.cuadro === elegido} onClick={() => setElegido(c.cuadro)}>
                {nombreDelCuadro(c.cuadro, datos.nombreCuadroConsuelo)}
              </Chip>
            ))}
          </div>
        )}
        {cuadroElegido && <CuadroPorRonda key={cuadroElegido.cuadro} cuadro={cuadroElegido} consuelo={datos.nombreCuadroConsuelo} />}
      </div>

      {/* Escritorio: los cuadros completos. Si no entran lado a lado, uno debajo del otro. Con pocas
          rondas, se reparten el ancho en partes iguales. */}
      <div
        className={`hidden gap-x-[60px] gap-y-10 pb-4 ${
          repartido ? `xl:grid ${datos.cuadros.length > 1 ? 'xl:grid-cols-2' : 'xl:grid-cols-1'}` : 'flex-wrap overflow-x-auto xl:flex'
        }`}
      >
        {datos.cuadros.map((c) => (
          <CuadroCompleto key={c.cuadro} cuadro={c} consuelo={datos.nombreCuadroConsuelo} repartido={repartido} />
        ))}
      </div>

      {/* Con el cuadro repartido, en la compu el marcador ya está a la vista. */}
      <p className={`text-[13px] text-pizarra-500 ${repartido ? 'xl:hidden' : ''}`}>Tocá cualquier partido para ver el marcador set por set.</p>
    </section>
  );
}
