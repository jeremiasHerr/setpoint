import { useRef, useState, type KeyboardEvent } from 'react';

type Props = {
  items: string[];
  alCambiar: (items: string[]) => void;
  rotuloNuevo: string;
  // Las etapas se muestran numeradas porque el orden define el calendario.
  numerada?: boolean;
};

function IconoCerrar() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function IconoMas() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function ListaEditable({ items, alCambiar, rotuloNuevo, numerada = false }: Props) {
  const [agregando, setAgregando] = useState(false);
  const [nuevo, setNuevo] = useState('');
  // Evita que el blur que dispara el cierre del campo vuelva a confirmar, o agregue algo cancelado con Escape.
  const cerrado = useRef(false);

  function abrir() {
    cerrado.current = false;
    setAgregando(true);
  }

  function cerrar() {
    cerrado.current = true;
    setNuevo('');
    setAgregando(false);
  }

  function confirmar() {
    if (cerrado.current) return;
    const nombre = nuevo.trim();
    // El nombre es único por organización: no se agregan repetidos.
    const repetido = items.some((item) => item.toLowerCase() === nombre.toLowerCase());
    if (nombre && !repetido) alCambiar([...items, nombre]);
    cerrar();
  }

  function manejarTecla(evento: KeyboardEvent<HTMLInputElement>) {
    if (evento.key === 'Enter') {
      evento.preventDefault();
      confirmar();
    } else if (evento.key === 'Escape') {
      cerrar();
    }
  }

  return (
    <ul className="flex flex-wrap items-center gap-[9px]">
      {items.map((item, i) => (
        <li
          key={item}
          className={`flex h-9 items-center gap-[9px] rounded-full border px-3.5 text-sm font-medium ${
            numerada ? 'border-linea bg-fondo text-negro' : 'border-negro bg-negro text-white'
          }`}
        >
          {numerada && <span className="font-mono text-xs text-gris-500 tabular-nums">{i + 1}</span>}
          <span>{item}</span>
          <button
            type="button"
            onClick={() => alCambiar(items.filter((otro) => otro !== item))}
            aria-label={`Quitar ${item}`}
            className={`text-gris-400 ${numerada ? 'hover:text-negro' : 'hover:text-white'}`}
          >
            <IconoCerrar />
          </button>
        </li>
      ))}

      <li>
        {agregando ? (
          <input
            autoFocus
            aria-label={rotuloNuevo}
            value={nuevo}
            onChange={(e) => setNuevo(e.target.value)}
            onKeyDown={manejarTecla}
            onBlur={confirmar}
            className="h-9 w-40 rounded-full border-2 border-negro px-[13px] text-sm font-medium outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={abrir}
            className="flex h-9 items-center gap-[9px] rounded-full border border-dashed border-gris-300 px-3.5 text-sm font-medium text-gris-500 hover:bg-fondo"
          >
            <IconoMas />
            <span>Agregar</span>
          </button>
        )}
      </li>
    </ul>
  );
}
