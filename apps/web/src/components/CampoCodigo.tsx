import { useRef, useState } from 'react';

const LARGO = 6;

type Props = {
  valor: string;
  onChange: (valor: string) => void;
  onCompleto?: (valor: string) => void;
  apagado?: boolean;
  // Dentro de una tarjeta noche, como el registro de la organización (decisión 148).
  sobreNoche?: boolean;
};

const CASILLA = {
  claro: { apagada: 'border border-linea bg-niebla text-pizarra-400', activa: 'border-2 border-noche', comun: 'border border-borde-campo' },
  noche: {
    apagada: 'border border-borde-noche bg-noche-2 text-pizarra-400',
    activa: 'border-2 border-white bg-noche-900',
    comun: 'border border-borde-campo bg-noche-900',
  },
};

// Seis casillas en dos grupos de tres, como se escribe el código en el email (design.md §8). Por
// debajo hay un solo input: así andan pegar, borrar y el autocompletado del código del celular.
export function CampoCodigo({ valor, onChange, onCompleto, apagado = false, sobreNoche = false }: Props) {
  const campo = useRef<HTMLInputElement>(null);
  const [enfocado, setEnfocado] = useState(false);
  const casilla = CASILLA[sobreNoche ? 'noche' : 'claro'];

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
            apagado ? casilla.apagada : enfocado && i === Math.min(valor.length, LARGO - 1) ? casilla.activa : casilla.comun
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
