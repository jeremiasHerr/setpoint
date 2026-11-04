import type { ClaveCuadro, CuadroEliminatorio } from '@setpoint/shared';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Boton } from '../../components/Boton';
import { Numero } from '../../components/Numero';
import { NOMBRE_DEL_CUADRO } from '../cuadros/cuadro';
import { CuadroCompleto } from '../cuadros/CuadroCompleto';
import { CuadroPorRonda } from '../cuadros/CuadroPorRonda';
import { nombresDelPartido, seccionesDeLaLista, type FilaDeLaLista, type Situacion } from './resultado';
import { useCuadros, usePartidos } from './useResultado';

type Props = {
  slug: string;
  torneoId: number;
  // El partido abierto, si hay uno.
  actual?: number;
};

// Una pestaña por zona y una por cuadro.
type Pestana = { clave: string; titulo: string; faltan: number; zona?: FilaDeLaLista[]; cuadro?: CuadroEliminatorio };

// El rojo es solo para lo vencido (design.md §3).
const colorDelEstado: Record<Situacion, string> = {
  sin_jugadores: 'text-gris-400',
  falta: 'text-gris-700',
  vencido: 'text-rojo-texto',
  con_resultado: 'text-gris-400',
};

// Elegir el partido a cargar (decisión 070): las zonas con sus partidos y los cuadros dibujados
// como rama, cada uno en su pestaña. Tocar un partido lo abre debajo. Reemplaza a la lista por
// secciones de la decisión 031.
export function ElegirPartido({ slug, torneoId, actual }: Props) {
  const partidos = usePartidos(slug, torneoId);
  const hayCuadros = partidos.data?.partidos.some((p) => p.fase === 'eliminatoria') ?? false;
  const cuadros = useCuadros(slug, torneoId, hayCuadros);
  const navegar = useNavigate();
  const [elegida, setElegida] = useState<string | null>(null);

  if (!partidos.data || (hayCuadros && !cuadros.data)) {
    const error = partidos.error ?? cuadros.error;
    return (
      <div className="flex flex-col items-start gap-3 px-6 py-5">
        {error ? (
          <>
            <p className="text-[15px] text-gris-500">No pudimos cargar los partidos.</p>
            <Boton onClick={() => void (partidos.error ? partidos.refetch() : cuadros.refetch())}>Probar de nuevo</Boton>
          </>
        ) : (
          <p className="text-[15px] text-gris-500">Cargando…</p>
        )}
      </div>
    );
  }

  const lista = partidos.data.partidos;
  const zonas: Pestana[] = seccionesDeLaLista(lista.filter((p) => p.fase === 'grupos'))
    .map(({ titulo, faltan, filas }) => ({ clave: titulo, titulo, faltan, zona: filas }))
    .sort((a, b) => a.titulo.localeCompare(b.titulo));
  const faltanEn = (cuadro: ClaveCuadro) =>
    lista.filter((p) => p.cuadro === cuadro && p.jugadorA && p.jugadorB && !['jugada', 'walkover', 'abandono', 'cancelada'].includes(p.estado))
      .length;
  const deLosCuadros: Pestana[] = (cuadros.data?.cuadros ?? []).map((cuadro) => ({
    clave: cuadro.cuadro,
    titulo: NOMBRE_DEL_CUADRO[cuadro.cuadro],
    faltan: faltanEn(cuadro.cuadro),
    cuadro,
  }));
  const pestanas = [...zonas, ...deLosCuadros];
  if (pestanas.length === 0) {
    return <p className="px-6 py-5 text-[15px] text-gris-500">Todavía no hay partidos: se generan al confirmar el sorteo.</p>;
  }

  // Abre donde está el partido abierto; sin partido, en la primera con algo por cargar.
  const delActual = pestanas.find((p) => p.zona?.some((f) => f.partido.id === actual) || p.cuadro?.partidos.some((x) => x.id === actual));
  const pestana =
    pestanas.find((p) => p.clave === elegida) ?? delActual ?? deLosCuadros.find((p) => p.faltan > 0) ?? pestanas.find((p) => p.faltan > 0) ?? pestanas[0];
  const abrir = (partidoId: number) => navegar(`/torneos/${torneoId}/resultados/${partidoId}`);
  const eleccion = { elegido: actual, alElegir: ({ id }: { id: number }) => abrir(id) };

  return (
    <div className="flex flex-col gap-4 px-6 py-5">
      <div role="group" aria-label="Zona o cuadro" className="flex flex-wrap gap-[5px]">
        {pestanas.map(({ clave, titulo, faltan }) => {
          const activa = clave === pestana.clave;
          return (
            <button
              key={clave}
              type="button"
              aria-pressed={activa}
              onClick={() => setElegida(clave)}
              className={`inline-flex h-[34px] items-center gap-[7px] rounded-[9px] px-[13px] text-sm ${
                activa ? 'bg-negro font-semibold text-white' : 'border border-linea font-medium text-gris-700 hover:bg-fondo'
              }`}
            >
              {titulo}
              {faltan > 0 && <Numero className={`text-xs ${activa ? 'text-lima' : 'text-gris-500'}`}>{faltan}</Numero>}
            </button>
          );
        })}
      </div>

      {pestana.zona && <PartidosDeLaZona filas={pestana.zona} actual={actual} alElegir={abrir} />}

      {pestana.cuadro && (
        <>
          {/* En una pantalla angosta el cuadro va de a una ronda (decisión 038). */}
          <div className="xl:hidden">
            <CuadroPorRonda key={pestana.cuadro.cuadro} cuadro={pestana.cuadro} eleccion={eleccion} />
          </div>
          <div className="hidden overflow-x-auto pb-2 xl:block">
            <CuadroCompleto cuadro={pestana.cuadro} eleccion={eleccion} />
          </div>
          <p className="text-[13px] text-gris-500">Tocá un partido para cargar o corregir su resultado.</p>
        </>
      )}
    </div>
  );
}

// Los partidos de una zona como tarjetas: los que faltan primero, el abierto marcado.
function PartidosDeLaZona({ filas, actual, alElegir }: { filas: FilaDeLaLista[]; actual?: number; alElegir: (id: number) => void }) {
  return (
    <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
      {filas.map(({ partido, situacion, estado }) => {
        const [a, b] = nombresDelPartido(partido);
        const elegido = partido.id === actual;
        return (
          <li key={partido.id}>
            <button
              type="button"
              aria-current={elegido ? 'true' : undefined}
              onClick={() => alElegir(partido.id)}
              className={`flex w-full flex-col gap-1 bg-white px-3.5 py-2.5 text-left ${
                elegido ? 'rounded-[10px] border-2 border-negro ring-2 ring-lima' : 'rounded-lg border border-linea hover:border-gris-500'
              }`}
            >
              <span className={`truncate text-sm ${elegido ? 'font-semibold' : ''}`}>
                {a} · {b}
              </span>
              <span className={`text-[13px] ${colorDelEstado[situacion]}`}>{estado}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
