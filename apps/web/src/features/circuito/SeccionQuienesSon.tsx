import { Campo } from '../../components/Campo';
import { Tarjeta } from '../../components/Tarjeta';

type Props = {
  nombre: string;
  slug: string;
  contacto: string;
  alCambiar: (campo: 'nombre' | 'contacto', valor: string) => void;
};

export function SeccionQuienesSon({ nombre, slug, contacto, alCambiar }: Props) {
  return (
    <Tarjeta className="flex flex-col gap-4 p-5">
      <h2 className="text-[17px] font-semibold">Quiénes son</h2>

      <div className="grid gap-3.5 md:grid-cols-[minmax(0,1fr)_240px]">
        <Campo
          id="circuito-nombre"
          rotulo="Nombre del circuito"
          required
          value={nombre}
          onChange={(e) => alCambiar('nombre', e.target.value)}
        />
        {/* La dirección la asigna la API al registrar la organización: acá solo se muestra. */}
        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-semibold text-gris-500">Dirección pública</span>
          <span className="flex h-12 items-center rounded-control border border-gris-300 px-3.5 font-mono text-sm text-gris-500 tabular-nums">
            /{slug}
          </span>
        </div>
      </div>

      <Campo
        id="circuito-contacto"
        rotulo="Contacto"
        placeholder="Para que los jugadores sepan a quién escribirle"
        value={contacto}
        onChange={(e) => alCambiar('contacto', e.target.value)}
      />
    </Tarjeta>
  );
}
