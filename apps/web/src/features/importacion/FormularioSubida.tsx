import { useState, type FormEvent } from 'react';
import { Boton } from '../../components/Boton';
import { Selector } from '../../components/Selector';
import { Tarjeta } from '../../components/Tarjeta';
import { MensajeError } from '../torneos/MensajeError';

type Props = {
  categorias: string[];
  enviando: boolean;
  error?: string;
  alSubir: (archivo: File, categoria: string) => void;
};

export function FormularioSubida({ categorias, enviando, error, alSubir }: Props) {
  const [categoria, setCategoria] = useState(categorias[0] ?? '');
  const [archivo, setArchivo] = useState<File | null>(null);

  function enviar(evento: FormEvent) {
    evento.preventDefault();
    if (archivo && categoria) alSubir(archivo, categoria);
  }

  if (categorias.length === 0) {
    return (
      <Tarjeta className="flex max-w-[560px] flex-col gap-2 p-[22px]">
        <h2 className="text-[17px] font-semibold">Primero cargá las categorías</h2>
        <p className="text-[15px] text-gris-500">
          Cada jugador de la planilla entra en una categoría. Definilas en la configuración del circuito y volvé.
        </p>
      </Tarjeta>
    );
  }

  return (
    <Tarjeta className="max-w-[560px] p-[22px]">
      <form onSubmit={enviar} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-[17px] font-semibold">Subí la planilla que ya usás</h2>
          <p className="text-[15px] leading-normal text-gris-500">
            Una fila por jugador y una columna por torneo, como el ranking de siempre. No importa el orden de las
            columnas ni si tiene títulos, totales o notas.
          </p>
        </div>

        <Selector
          id="importacion-categoria"
          rotulo="Categoría de la planilla"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        >
          {categorias.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Selector>

        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-semibold text-gris-500">Archivo</span>
          {/* El input nativo queda oculto: su botón viene en el idioma del navegador. */}
          <div className="flex items-center gap-3">
            <input
              id="importacion-archivo"
              type="file"
              accept=".xlsx,.xls,.csv"
              aria-describedby="importacion-ayuda importacion-error"
              onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
              className="peer sr-only"
            />
            <label
              htmlFor="importacion-archivo"
              className="inline-flex h-10 cursor-pointer items-center rounded-control border border-linea px-4 text-[15px] font-medium peer-focus-visible:outline-2 peer-focus-visible:outline-negro hover:bg-fondo"
            >
              {archivo ? 'Elegir otro' : 'Elegir archivo'}
            </label>
            <span className="truncate font-mono text-sm text-gris-700">{archivo?.name ?? 'Ningún archivo elegido'}</span>
          </div>
          <p id="importacion-ayuda" className="font-mono text-xs text-gris-500">
            .xlsx, .xls o .csv · hasta 2 MB
          </p>
        </div>

        <MensajeError id="importacion-error">{error}</MensajeError>

        <div className="flex flex-col gap-2">
          <Boton type="submit" variante="organizador" disabled={!archivo || enviando} className="self-start">
            Leer la planilla
          </Boton>
          <p className="text-sm text-gris-500">Todavía no se guarda nada: primero vas a revisar lo que se leyó.</p>
        </div>
      </form>
    </Tarjeta>
  );
}
