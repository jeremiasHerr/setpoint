import { useState, type FormEvent } from 'react';
import { Boton } from '../../components/Boton';
import { Selector } from '../../components/Selector';
import { Tarjeta } from '../../components/Tarjeta';
import { MensajeError } from '../torneos/MensajeError';

type Props = {
  categorias: string[];
  enviando: boolean;
  error?: string;
  // Sin categoría (null), se toma la que diga cada planilla (decisión 011).
  alSubir: (archivos: File[], categoria: string | null) => void;
};

// La opción de no elegir: la categoría sale del nombre de la hoja, de un título o del archivo.
const DE_LA_PLANILLA = '';

// Uno o varios archivos por categoría, hasta 10 por vez (decisión 012).
export const ARCHIVOS_MAXIMOS = 10;

// No hace falta configurar el circuito antes: las categorías y los torneos del calendario que la
// planilla trae y el circuito no tiene se crean al confirmar (decisión 011).
export function FormularioSubida({ categorias, enviando, error, alSubir }: Props) {
  const [categoria, setCategoria] = useState(DE_LA_PLANILLA);
  const [archivos, setArchivos] = useState<File[]>([]);
  const demasiados = archivos.length > ARCHIVOS_MAXIMOS;

  function enviar(evento: FormEvent) {
    evento.preventDefault();
    if (archivos.length === 0 || demasiados) return;
    // Con varios archivos, cada uno dice su categoría: elegir una sola no tendría sentido.
    alSubir(archivos, archivos.length === 1 && categoria !== DE_LA_PLANILLA ? categoria : null);
  }

  return (
    <Tarjeta className="max-w-[560px] p-[22px]">
      <form onSubmit={enviar} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-[17px] font-semibold">Subí la planilla que ya usás</h2>
          <p className="text-[15px] leading-normal text-gris-500">
            Una fila por jugador y una columna por torneo, como el ranking de siempre. No importa el orden de las
            columnas ni si tiene títulos, totales o notas. Las categorías y los torneos del calendario que tu circuito
            no tiene los tomamos de la planilla, y se crean al confirmar.
          </p>
        </div>

        {archivos.length > 1 ? null : categorias.length > 0 ? (
          <Selector
            id="importacion-categoria"
            rotulo="Categoría de la planilla"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            <option value={DE_LA_PLANILLA}>La que diga la planilla</option>
            {categorias.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Selector>
        ) : (
          <p className="rounded-control bg-fondo px-3.5 py-3 text-sm leading-normal text-gris-700">
            La categoría la tomamos del nombre de la hoja, de un título o del nombre del archivo, como «Ranking Tercera
            2026.xlsx». Si no la dice, la elegís al revisar.
          </p>
        )}

        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-semibold text-gris-500">Archivos</span>
          {/* El input nativo queda oculto: su botón viene en el idioma del navegador. */}
          <div className="flex items-center gap-3">
            <input
              id="importacion-archivo"
              type="file"
              multiple
              accept=".xlsx,.xls,.csv"
              aria-describedby="importacion-ayuda importacion-error"
              onChange={(e) => setArchivos([...(e.target.files ?? [])])}
              className="peer sr-only"
            />
            <label
              htmlFor="importacion-archivo"
              className="inline-flex h-10 cursor-pointer items-center rounded-control border border-linea px-4 text-[15px] font-medium peer-focus-visible:outline-2 peer-focus-visible:outline-negro hover:bg-fondo"
            >
              {archivos.length > 0 ? 'Elegir otros' : 'Elegir archivos'}
            </label>
            <span className="truncate font-mono text-sm text-gris-700">
              {archivos.length === 0
                ? 'Ningún archivo elegido'
                : archivos.length === 1
                  ? archivos[0].name
                  : `${archivos.length} archivos`}
            </span>
          </div>
          {archivos.length > 1 && (
            <ul className="flex flex-col gap-1 font-mono text-[13px] text-gris-700">
              {archivos.map((a) => (
                <li key={a.name} className="truncate">
                  {a.name}
                </li>
              ))}
            </ul>
          )}
          <p id="importacion-ayuda" className="font-mono text-xs text-gris-500">
            .xlsx, .xls o .csv · hasta {ARCHIVOS_MAXIMOS} archivos de 2 MB · una o varias hojas por archivo
          </p>
        </div>

        <MensajeError id="importacion-error">
          {demasiados ? `Elegiste ${archivos.length} archivos: subí hasta ${ARCHIVOS_MAXIMOS} por vez.` : error}
        </MensajeError>

        <div className="flex flex-col gap-2">
          <Boton type="submit" variante="organizador" disabled={archivos.length === 0 || demasiados || enviando} className="self-start">
            {archivos.length > 1 ? 'Leer las planillas' : 'Leer la planilla'}
          </Boton>
          <p className="text-sm text-gris-500">Todavía no se guarda nada: primero vas a revisar lo que se leyó.</p>
        </div>
      </form>
    </Tarjeta>
  );
}
