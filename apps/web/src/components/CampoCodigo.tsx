import { useRef, useState } from 'react';

const LARGO = 6;

type Props = {
  valor: string;
  onChange: (valor: string) => void;
  onCompleto?: (valor: string) => void;
  apagado?: boolean;
};

// Seis casillas en dos grupos de tres, como se escribe el código en el email (design.md §8). Por
// debajo hay un solo input: así andan pegar, borrar y el autocompletado del código del celular.
export function CampoCodigo({ valor, onChange, onCompleto, apagado = false }: Props) {
  const campo = useRef<HTMLInputElement>(null);
  const [enfocado, setEnfocado] = useState(false);

  function cambiar(texto: string) {
    const digitos = texto.replace(/\D/g, '').slice(0, LARGO);
    onChange(digitos);
    if (digitos.length === LARGO) onCompleto?.(digitos);
  }

  return (
    <div className="relative flex gap-2" onClick={() => campo.current?.focus()}>
      {Array.from({ length: LARGO }, (_, i) => (
        <div
          key={i}
          aria-hidden
          className={`flex h-[58px] w-[46px] items-center justify-center rounded-control font-mono text-[26px] font-medium tabular-nums ${
            i === 3 ? 'ml-1.5' : ''
          } ${
            apagado
              ? 'border border-linea bg-fondo text-gris-400'
              : enfocado && i === Math.min(valor.length, LARGO - 1)
                ? 'border-2 border-negro'
                : 'border border-gris-300'
          }`}
        >
          {valor[i] ?? ''}
        </div>
      ))}
      <input
        ref={campo}
        value={valor}
        onChange={(e) => cambiar(e.target.value)}
        onFocus={() => setEnfocado(true)}
        onBlur={() => setEnfocado(false)}
        inputMode="numeric"
        autoComplete="one-time-code"
        aria-label="Código de 6 dígitos"
        maxLength={LARGO}
        disabled={apagado}
        autoFocus
        className="absolute inset-0 opacity-0"
      />
    </div>
  );
}
