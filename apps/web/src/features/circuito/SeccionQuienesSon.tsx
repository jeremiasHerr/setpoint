import type { Contacto } from '@setpoint/shared';
import { useState } from 'react';
import { Boton } from '../../components/Boton';
import { Campo } from '../../components/Campo';
import { Chip } from '../../components/Chip';
import { IconoMas } from '../../components/IconoMas';
import { Tarjeta } from '../../components/Tarjeta';

type Props = {
  nombre: string;
  slug: string;
  contactos: Contacto[];
  alCambiarNombre: (nombre: string) => void;
  alCambiarContactos: (contactos: Contacto[]) => void;
};

const MAXIMO_CONTACTOS = 10;

const TIPOS: Record<Contacto['tipo'], { rotulo: string; ejemplo: string }> = {
  whatsapp: { rotulo: 'WhatsApp', ejemplo: '299 412 3456' },
  red_social: { rotulo: 'Red social', ejemplo: '@polentatenis o un link' },
};

function IconoQuitar({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true" className={className}>
      <path d="M7 7l10 10M17 7L7 17" />
    </svg>
  );
}

export function SeccionQuienesSon({ nombre, slug, contactos, alCambiarNombre, alCambiarContactos }: Props) {
  return (
    <Tarjeta className="flex flex-col gap-4 p-5">
      <h2 className="text-[17px] font-semibold">Quiénes son</h2>

      <div className="grid gap-3.5 md:grid-cols-[minmax(0,1fr)_240px]">
        <Campo id="circuito-nombre" rotulo="Nombre del circuito" required value={nombre} onChange={(e) => alCambiarNombre(e.target.value)} />
        {/* La dirección la asigna la API al registrar la organización: acá solo se muestra. */}
        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-semibold text-gris-500">Dirección pública</span>
          <span className="flex h-12 items-center rounded-control border border-gris-300 px-3.5 font-mono text-sm text-gris-500 tabular-nums">
            /{slug}
          </span>
        </div>
      </div>

      <Contactos contactos={contactos} alCambiar={alCambiarContactos} />
    </Tarjeta>
  );
}

// De a uno: se agrega, queda en la lista, y "+ Agregar contacto" abre el siguiente (decisión 091).
function Contactos({ contactos, alCambiar }: { contactos: Contacto[]; alCambiar: (contactos: Contacto[]) => void }) {
  const [agregando, setAgregando] = useState(false);
  const [tipo, setTipo] = useState<Contacto['tipo']>('whatsapp');
  const [valor, setValor] = useState('');
  const [problema, setProblema] = useState<string | null>(null);

  function cerrar() {
    setAgregando(false);
    setValor('');
    setProblema(null);
  }

  function agregar() {
    const limpio = valor.trim();
    if (!limpio) return;
    if (tipo === 'whatsapp' && limpio.replace(/\D/g, '').length < 8) {
      setProblema('Escribí el número con característica, por ejemplo 299 412 3456');
      return;
    }
    if (contactos.some((c) => c.tipo === tipo && c.valor.toLowerCase() === limpio.toLowerCase())) {
      setProblema('Ya está en la lista');
      return;
    }
    alCambiar([...contactos, { tipo, valor: limpio }]);
    cerrar();
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-col gap-0.5">
        <h3 className="text-[13px] font-semibold text-gris-500">Contactos</h3>
        <p className="text-[13px] text-gris-500">Los ven los jugadores en el link del torneo, para saber a quién escribirle.</p>
      </div>

      {contactos.length > 0 && (
        <ul className="flex flex-col gap-2">
          {contactos.map((c, i) => (
            <li key={`${c.tipo}-${c.valor}`} className="flex h-11 items-center gap-3 rounded-control border border-linea pr-1.5 pl-3.5">
              <span className="w-[78px] shrink-0 font-mono text-xs text-gris-500">{c.tipo === 'whatsapp' ? 'whatsapp' : 'red social'}</span>
              <span className={`min-w-0 flex-1 truncate text-[15px] ${c.tipo === 'whatsapp' ? 'font-mono tabular-nums' : ''}`}>{c.valor}</span>
              <button
                type="button"
                aria-label={`Quitar ${c.valor}`}
                onClick={() => alCambiar(contactos.filter((_, j) => j !== i))}
                className="flex size-8 shrink-0 items-center justify-center rounded-control text-gris-500 hover:bg-fondo hover:text-negro"
              >
                <IconoQuitar className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {agregando ? (
        <div className="flex flex-col gap-2.5 rounded-control bg-fondo p-3">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(TIPOS) as Contacto['tipo'][]).map((clave) => (
              <Chip
                key={clave}
                activo={tipo === clave}
                onClick={() => {
                  setTipo(clave);
                  setProblema(null);
                }}
              >
                {TIPOS[clave].rotulo}
              </Chip>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              aria-label={TIPOS[tipo].rotulo}
              autoFocus
              inputMode={tipo === 'whatsapp' ? 'tel' : 'text'}
              placeholder={TIPOS[tipo].ejemplo}
              maxLength={100}
              value={valor}
              onChange={(e) => {
                setValor(e.target.value);
                setProblema(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  agregar();
                }
                if (e.key === 'Escape') cerrar();
              }}
              className={`h-10 min-w-0 flex-1 rounded-control border border-gris-300 bg-white px-3.5 text-[15px] outline-none placeholder:text-gris-400 focus:border-2 focus:border-negro focus:px-[13px] ${
                tipo === 'whatsapp' ? 'font-mono tabular-nums' : ''
              }`}
            />
            <Boton variante="organizador" onClick={agregar} disabled={!valor.trim()}>
              Agregar
            </Boton>
            <Boton onClick={cerrar}>Cancelar</Boton>
          </div>
          {problema && <p className="text-[13px] text-rojo-texto">{problema}</p>}
        </div>
      ) : (
        contactos.length < MAXIMO_CONTACTOS && (
          <Boton className="self-start" onClick={() => setAgregando(true)}>
            <IconoMas className="size-3.5 stroke-[2.4]" />
            Agregar contacto
          </Boton>
        )
      )}
    </div>
  );
}
