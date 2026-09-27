import { useState, type ReactNode } from 'react';
import { Boton } from './components/Boton';
import { Campo } from './components/Campo';
import { Chip } from './components/Chip';
import { EncabezadoOrganizador } from './components/EncabezadoOrganizador';
import { Numero } from './components/Numero';
import { Tarjeta } from './components/Tarjeta';

const navegacion = [
  { etiqueta: 'Padrón', href: '#padron' },
  { etiqueta: 'Torneos', href: '#torneos' },
  { etiqueta: 'Tablero', href: '#tablero' },
];

const categorias = ['Todas', 'Segunda', 'Tercera'];

function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-mono text-xs text-gris-500">{titulo}</h2>
      {children}
    </section>
  );
}

export function Catalogo() {
  const [categoria, setCategoria] = useState('Todas');

  return (
    <div className="min-h-screen bg-white">
      <EncabezadoOrganizador organizacion="Polenta Team Tenis" navegacion={navegacion} activo="Padrón" />

      <main className="mx-auto flex max-w-4xl flex-col gap-10 px-7 py-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-[-0.035em]">Componentes</h1>
          <p className="text-[15px] text-gris-500">La base compartida de la web. Todo sale de los tokens de design.md.</p>
        </div>

        <Seccion titulo="boton">
          <div className="flex flex-wrap items-center gap-3">
            <Boton variante="principal">Pagar la inscripción</Boton>
            <Boton variante="organizador">Agregar jugador</Boton>
            <Boton>Importar planilla</Boton>
            <Boton variante="organizador" disabled>
              Guardar resultado
            </Boton>
          </div>
        </Seccion>

        <Seccion titulo="campo">
          <div className="grid grid-cols-2 gap-3.5">
            <Campo id="catalogo-nombre" rotulo="Nombre del circuito o grupo" placeholder="Polenta Team Tenis" />
            <Campo id="catalogo-importe" rotulo="Importe" numerico defaultValue="$45.000" />
          </div>
        </Seccion>

        <Seccion titulo="chip">
          <div className="flex gap-2">
            {categorias.map((c) => (
              <Chip key={c} activo={c === categoria} onClick={() => setCategoria(c)}>
                {c}
              </Chip>
            ))}
          </div>
        </Seccion>

        <Seccion titulo="tarjeta">
          <div className="grid grid-cols-2 gap-5">
            <Tarjeta className="flex flex-col gap-1.5 p-5">
              <span className="text-[15px] font-semibold">Otoño 26 · Tercera</span>
              <span className="text-sm text-gris-500">
                <Numero>32</Numero> inscriptos · <Numero>8</Numero> zonas
              </span>
            </Tarjeta>
            <Tarjeta variante="negra" className="flex flex-col gap-2">
              <span className="text-sm text-gris-400">Tu ranking</span>
              <Numero className="text-5xl font-medium tracking-[-0.04em] text-lima">165</Numero>
              <span className="text-sm text-gris-400">puntos · puesto 1 de Tercera</span>
            </Tarjeta>
          </div>
        </Seccion>

        <Seccion titulo="numero">
          <div className="flex flex-wrap items-baseline gap-6 text-[15px]">
            <span>
              <Numero className="font-semibold">95</Numero> puntos
            </span>
            <Numero>sáb 14 · 10:00</Numero>
            <Numero>6-4 3-6 10-8</Numero>
            <Numero className="text-gris-500">quedan 6 días</Numero>
          </div>
        </Seccion>
      </main>
    </div>
  );
}
