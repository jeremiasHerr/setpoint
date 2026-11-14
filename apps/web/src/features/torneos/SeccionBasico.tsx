import type { DatosConvocatoria } from '@setpoint/shared';
import { useState } from 'react';
import { Boton } from '../../components/Boton';
import { Campo } from '../../components/Campo';
import { Chip } from '../../components/Chip';
import { Selector } from '../../components/Selector';
import { Tarjeta } from '../../components/Tarjeta';
import { MensajeError } from '../../components/Aviso';
import type { ErroresConvocatoria } from './useConvocatoria';

type Props = {
  nombre: string;
  suelto: boolean;
  etapa: string | null;
  categorias: DatosConvocatoria['categorias'];
  // Lo que ofrece el circuito para elegir.
  usaRanking: boolean;
  etapasDelCircuito: string[];
  categoriasDelCircuito: string[];
  // Cupo con el que entra una categoría recién elegida: grupos × jugadores por grupo.
  cupoPorDefecto: number;
  // Publicado, ya hay inscripciones: no se cambia de tipo ni de categorías.
  categoriasFijas: boolean;
  errores: ErroresConvocatoria;
  alCambiarNombre: (nombre: string) => void;
  alCambiarSuelto: (suelto: boolean) => void;
  alCambiarEtapa: (etapa: string | null) => void;
  alCambiarCategorias: (categorias: DatosConvocatoria['categorias']) => void;
};

function IconoQuitar({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true" className={className}>
      <path d="M7 7l10 10M17 7L7 17" />
    </svg>
  );
}

const tipos = [
  { suelto: false, titulo: 'Del circuito', detalle: 'Con las categorías de tu circuito. Puede sumar al ranking.' },
  { suelto: true, titulo: 'Suelto', detalle: 'Por diversión: no suma al ranking y se anota cualquiera del padrón.' },
];

export function SeccionBasico({
  nombre,
  suelto,
  etapa,
  categorias,
  usaRanking,
  etapasDelCircuito,
  categoriasDelCircuito,
  cupoPorDefecto,
  categoriasFijas,
  errores,
  alCambiarNombre,
  alCambiarSuelto,
  alCambiarEtapa,
  alCambiarCategorias,
}: Props) {
  const hayCircuito = categoriasDelCircuito.length > 0;

  return (
    <Tarjeta className="flex flex-col gap-4 p-5">
      <h2 className="text-[17px] font-semibold">Lo básico</h2>

      <div className="flex flex-col gap-2">
        <Campo
          id="torneo-nombre"
          rotulo="Nombre"
          placeholder={suelto ? 'Torneo de fin de año' : 'Torneo Primavera 26'}
          maxLength={80}
          value={nombre}
          onChange={(e) => alCambiarNombre(e.target.value)}
          aria-invalid={errores.nombre ? true : undefined}
          aria-describedby={errores.nombre ? 'torneo-nombre-error' : undefined}
        />
        <MensajeError id="torneo-nombre-error">{errores.nombre}</MensajeError>
      </div>

      {/* Sin categorías en el circuito no hay a qué sumarlo: es suelto sí o sí (decisión 089). */}
      {hayCircuito ? (
        <div className="flex flex-col gap-2">
          <h3 className="text-[13px] font-semibold text-gris-500">¿De qué es este torneo?</h3>
          <div role="radiogroup" aria-label="Tipo de torneo" className="grid gap-2.5 sm:grid-cols-2">
            {tipos.map((tipo) => {
              const elegido = tipo.suelto === suelto;
              return (
                <button
                  key={tipo.titulo}
                  type="button"
                  role="radio"
                  aria-checked={elegido}
                  disabled={categoriasFijas && !elegido}
                  onClick={() => !elegido && alCambiarSuelto(tipo.suelto)}
                  className={`flex flex-col gap-1 rounded-tarjeta p-3.5 text-left disabled:opacity-40 ${
                    elegido ? 'border-2 border-negro px-[13px] py-[13px]' : 'border border-linea hover:bg-fondo'
                  }`}
                >
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <span
                      className={`size-2.5 rounded-full ${elegido ? 'bg-lima ring-1 ring-negro' : 'border border-gris-400'}`}
                    />
                    {tipo.titulo}
                  </span>
                  <span className="text-[13px] leading-[1.4] text-gris-500">{tipo.detalle}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="rounded-control bg-fondo px-3.5 py-3 text-[13px] leading-[1.45] text-gris-500">
          <span className="font-semibold text-negro">Torneo suelto.</span> No suma a ningún ranking y se anota cualquiera
          del padrón. Cuando armes tu circuito, vas a poder sumarle torneos.
        </p>
      )}

      {suelto ? (
        <CategoriasSueltas
          categorias={categorias}
          categoriasDelCircuito={categoriasDelCircuito}
          cupoPorDefecto={cupoPorDefecto}
          fijas={categoriasFijas}
          error={errores.categorias}
          alCambiar={alCambiarCategorias}
        />
      ) : (
        <>
          {/* Sin ranking no hay casilleros: no suma a ninguno. */}
          {usaRanking && (
            <Selector
              id="torneo-etapa"
              rotulo="Torneo del calendario"
              value={etapa ?? ''}
              onChange={(e) => alCambiarEtapa(e.target.value || null)}
            >
              <option value="">No suma al ranking</option>
              {etapasDelCircuito.map((nombreEtapa) => (
                <option key={nombreEtapa} value={nombreEtapa}>
                  {nombreEtapa}
                </option>
              ))}
            </Selector>
          )}
          <CategoriasDelCircuito
            categorias={categorias}
            categoriasDelCircuito={categoriasDelCircuito}
            cupoPorDefecto={cupoPorDefecto}
            error={errores.categorias}
            alCambiar={alCambiarCategorias}
          />
        </>
      )}
    </Tarjeta>
  );
}

type PropsCategorias = {
  categorias: DatosConvocatoria['categorias'];
  categoriasDelCircuito: string[];
  cupoPorDefecto: number;
  error?: string;
  alCambiar: (categorias: DatosConvocatoria['categorias']) => void;
};

function CategoriasDelCircuito({ categorias, categoriasDelCircuito, cupoPorDefecto, error, alCambiar }: PropsCategorias) {
  function alternar(categoria: string) {
    if (categorias.some((c) => c.categoria === categoria)) {
      alCambiar(categorias.filter((c) => c.categoria !== categoria));
      return;
    }
    // Se reconstruye desde las del circuito para conservar su orden.
    alCambiar(
      categoriasDelCircuito.flatMap((nombreCategoria) => {
        const elegida = categorias.find((c) => c.categoria === nombreCategoria);
        if (elegida) return [elegida];
        return nombreCategoria === categoria ? [{ categoria, cupo: cupoPorDefecto }] : [];
      }),
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-[13px] font-semibold text-gris-500">Categorías que se disputan</h3>
      <div className="flex flex-wrap gap-2">
        {categoriasDelCircuito.map((categoria) => (
          <Chip key={categoria} activo={categorias.some((c) => c.categoria === categoria)} onClick={() => alternar(categoria)}>
            {categoria}
          </Chip>
        ))}
      </div>
      <MensajeError id="torneo-categorias-error">{error}</MensajeError>
    </div>
  );
}

const LARGO_MAXIMO_CATEGORIA = 40;

// Las de un torneo suelto se escriben acá y son solo suyas: no aparecen en Tu circuito (decisión 089).
function CategoriasSueltas({
  categorias,
  categoriasDelCircuito,
  cupoPorDefecto,
  fijas,
  error,
  alCambiar,
}: PropsCategorias & { fijas: boolean }) {
  const [nueva, setNueva] = useState('');
  const [problema, setProblema] = useState<string | null>(null);

  function agregar() {
    const nombre = nueva.trim();
    if (!nombre) return;
    const igual = (otra: string) => otra.toLowerCase() === nombre.toLowerCase();
    if (categorias.some((c) => igual(c.categoria))) {
      setProblema('Ya está en el torneo');
      return;
    }
    if (categoriasDelCircuito.some(igual)) {
      setProblema('Esa ya es una categoría de tu circuito: usá otro nombre');
      return;
    }
    alCambiar([...categorias, { categoria: nombre, cupo: cupoPorDefecto }]);
    setNueva('');
    setProblema(null);
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-[13px] font-semibold text-gris-500">Categorías</h3>
      {categorias.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categorias.map(({ categoria }) => (
            <span
              key={categoria}
              className="inline-flex h-[34px] items-center gap-1.5 rounded-full border border-negro bg-negro pr-2 pl-[13px] text-sm font-medium text-white"
            >
              {categoria}
              {!fijas && (
                <button
                  type="button"
                  aria-label={`Quitar ${categoria}`}
                  onClick={() => alCambiar(categorias.filter((c) => c.categoria !== categoria))}
                  className="flex size-5 items-center justify-center rounded-full text-gris-400 hover:bg-borde-oscuro hover:text-white"
                >
                  <IconoQuitar className="size-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}
      {!fijas && (
        <div className="flex gap-2">
          <input
            id="torneo-categoria-nueva"
            aria-label="Nueva categoría"
            placeholder="Libre, +40, Mixto…"
            maxLength={LARGO_MAXIMO_CATEGORIA}
            value={nueva}
            onChange={(e) => {
              setNueva(e.target.value);
              setProblema(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                agregar();
              }
            }}
            className="h-10 min-w-0 flex-1 rounded-control border border-gris-300 px-3.5 text-[15px] outline-none placeholder:text-gris-400 focus:border-2 focus:border-negro focus:px-[13px]"
          />
          <Boton onClick={agregar} disabled={!nueva.trim()}>
            Agregar
          </Boton>
        </div>
      )}
      <p className="text-xs text-gris-500">Si no dividís por nivel, alcanza con una.</p>
      <MensajeError id="torneo-categorias-error">{problema ?? error}</MensajeError>
    </div>
  );
}
