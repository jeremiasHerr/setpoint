import { useState, type FormEvent } from 'react';
import { Boton } from '../../components/Boton';
import { Chip } from '../../components/Chip';
import { Selector } from '../../components/Selector';
import { Tarjeta } from '../../components/Tarjeta';
import { MensajeError } from '../../components/Aviso';

// Lo que se sube: archivos, o el ranking pegado como texto (decisión 137).
export type Subida = { archivos: File[]; texto: string | null };

type Props = {
  categorias: string[];
  enviando: boolean;
  error?: string;
  // Sin categoría (null), se toma la que diga cada planilla (decisión 011).
  alSubir: (subida: Subida, categoria: string | null) => void;
};

// La opción de no elegir: la categoría sale del nombre de la hoja, de un título o del archivo.
const DE_LA_PLANILLA = '';

// Uno o varios archivos por categoría, hasta 10 por vez (decisión 012).
export const ARCHIVOS_MAXIMOS = 10;
// El mismo tope que la API.
const TEXTO_MAXIMO = 50_000;

type Modo = 'archivos' | 'texto';

// No hace falta configurar el circuito antes: las categorías y los torneos del calendario que la
// planilla trae y el circuito no tiene se crean al confirmar (decisión 011).
export function FormularioSubida({ categorias, enviando, error, alSubir }: Props) {
  const [modo, setModo] = useState<Modo>('archivos');
  const [categoria, setCategoria] = useState(DE_LA_PLANILLA);
  const [archivos, setArchivos] = useState<File[]>([]);
  const [texto, setTexto] = useState('');
  const demasiados = archivos.length > ARCHIVOS_MAXIMOS;
  const largo = texto.trim().length;
  const textoLargo = largo > TEXTO_MAXIMO;
  const listo = modo === 'archivos' ? archivos.length > 0 && !demasiados : largo > 0 && !textoLargo;
  // Con varios archivos, cada uno dice su categoría: elegir una sola no tendría sentido.
  const unaFuente = modo === 'texto' || archivos.length <= 1;

  function enviar(evento: FormEvent) {
    evento.preventDefault();
    if (!listo) return;
    const elegida = unaFuente && categoria !== DE_LA_PLANILLA ? categoria : null;
    alSubir(modo === 'archivos' ? { archivos, texto: null } : { archivos: [], texto }, elegida);
  }

  return (
    <Tarjeta className="max-w-[560px] p-[22px]">
      <form onSubmit={enviar} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-[17px] font-semibold">Subí el ranking que ya usás</h2>
          <p className="text-[15px] leading-normal text-pizarra-500">
            Una fila por jugador y una columna por torneo, como el ranking de siempre. No importa el orden de las
            columnas ni si tiene títulos, totales o notas. Las categorías y los torneos del calendario que tu circuito
            no tiene los tomamos del ranking, y se crean al confirmar.
          </p>
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Cómo lo subís">
          <Chip activo={modo === 'archivos'} onClick={() => setModo('archivos')}>
            Subir archivos
          </Chip>
          <Chip activo={modo === 'texto'} onClick={() => setModo('texto')}>
            Pegar el texto
          </Chip>
        </div>

        {modo === 'archivos' ? (
          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold text-pizarra-500">Archivos</span>
            {/* El input nativo queda oculto: su botón viene en el idioma del navegador. */}
            <div className="flex items-center gap-3">
              <input
                id="importacion-archivo"
                type="file"
                multiple
                accept=".xlsx,.xls,.csv,.pdf"
                aria-describedby="importacion-ayuda importacion-error"
                onChange={(e) => setArchivos([...(e.target.files ?? [])])}
                className="peer sr-only"
              />
              <label
                htmlFor="importacion-archivo"
                className="inline-flex h-10 shrink-0 cursor-pointer items-center whitespace-nowrap rounded-control border border-linea px-4 text-[15px] font-medium peer-focus-visible:outline-2 peer-focus-visible:outline-noche hover:bg-niebla"
              >
                {archivos.length > 0 ? 'Elegir otros' : 'Elegir archivos'}
              </label>
              <span className="truncate text-sm text-pizarra-700">
                {archivos.length === 0
                  ? 'Ningún archivo elegido'
                  : archivos.length === 1
                    ? archivos[0].name
                    : `${archivos.length} archivos`}
              </span>
            </div>
            {archivos.length > 1 && (
              <ul className="flex flex-col gap-1 text-[13px] text-pizarra-700">
                {archivos.map((a) => (
                  <li key={a.name} className="truncate">
                    {a.name}
                  </li>
                ))}
              </ul>
            )}
            <p id="importacion-ayuda" className="text-[13px] text-pizarra-500">
              .xlsx, .xls, .csv o un PDF exportado de la planilla · hasta {ARCHIVOS_MAXIMOS} archivos de 2 MB
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <label htmlFor="importacion-texto" className="text-[13px] font-semibold text-pizarra-500">
              Ranking
            </label>
            <textarea
              id="importacion-texto"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={10}
              placeholder={'Ranking Tercera 2026\nPrim 25 · Ver 26 · Pretemp 26 · Total\n1. Martín Sanhueza 10 15 50 75\n2. Diego Antileo 15 10 10 35'}
              aria-describedby="importacion-ayuda-texto importacion-error"
              aria-invalid={textoLargo || undefined}
              className="min-h-[200px] resize-y rounded-control border border-borde-campo px-3.5 py-3 font-mono text-sm leading-relaxed text-noche outline-none placeholder:text-pizarra-400 focus:border-2 focus:border-noche focus:px-[13px] focus:py-[11px] aria-invalid:border-2 aria-invalid:border-noche"
            />
            <p id="importacion-ayuda-texto" className="text-[13px] text-pizarra-500">
              {textoLargo
                ? 'Es demasiado texto: pegá una categoría por vez.'
                : 'Copiado de la planilla o de un mensaje del grupo, con un jugador por línea. Si a una línea le falta un número, te la mostramos para que digas en qué torneo va cada uno.'}
            </p>
          </div>
        )}

        {!unaFuente ? null : categorias.length > 0 ? (
          <Selector
            id="importacion-categoria"
            rotulo="Categoría del ranking"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            <option value={DE_LA_PLANILLA}>La que diga el ranking</option>
            {categorias.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Selector>
        ) : (
          <p className="rounded-control bg-niebla px-3.5 py-3 text-sm leading-normal text-pizarra-700">
            La categoría la tomamos del nombre de la hoja, de un título o del nombre del archivo, como «Ranking Tercera
            2026.xlsx». Si no la dice, la elegís al revisar.
          </p>
        )}

        <MensajeError id="importacion-error">
          {modo === 'archivos' && demasiados ? `Elegiste ${archivos.length} archivos: subí hasta ${ARCHIVOS_MAXIMOS} por vez.` : error}
        </MensajeError>

        <div className="flex flex-col gap-2">
          <Boton type="submit" variante="organizador" disabled={!listo || enviando} className="self-start">
            {modo === 'texto' ? 'Leer el texto' : archivos.length > 1 ? 'Leer las planillas' : 'Leer la planilla'}
          </Boton>
          <p className="text-sm text-pizarra-500">Todavía no se guarda nada: primero vas a revisar lo que se leyó.</p>
        </div>
      </form>
    </Tarjeta>
  );
}
