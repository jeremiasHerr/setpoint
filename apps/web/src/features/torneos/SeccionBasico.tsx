import type { DatosConvocatoria } from '@setpoint/shared';
import { Link } from 'react-router-dom';
import { Campo } from '../../components/Campo';
import { Chip } from '../../components/Chip';
import { Selector } from '../../components/Selector';
import { Tarjeta } from '../../components/Tarjeta';

type Props = {
  nombre: string;
  etapa: string | null;
  categorias: DatosConvocatoria['categorias'];
  // Lo que ofrece el circuito para elegir.
  usaRanking: boolean;
  etapasDelCircuito: string[];
  categoriasDelCircuito: string[];
  // Cupo con el que entra una categoría recién elegida: grupos × jugadores por grupo.
  cupoPorDefecto: number;
  alCambiarNombre: (nombre: string) => void;
  alCambiarEtapa: (etapa: string | null) => void;
  alCambiarCategorias: (categorias: DatosConvocatoria['categorias']) => void;
};

export function SeccionBasico({
  nombre,
  etapa,
  categorias,
  usaRanking,
  etapasDelCircuito,
  categoriasDelCircuito,
  cupoPorDefecto,
  alCambiarNombre,
  alCambiarEtapa,
  alCambiarCategorias,
}: Props) {
  function alternar(categoria: string) {
    if (categorias.some((c) => c.categoria === categoria)) {
      alCambiarCategorias(categorias.filter((c) => c.categoria !== categoria));
      return;
    }
    // Se reconstruye desde las del circuito para conservar su orden.
    alCambiarCategorias(
      categoriasDelCircuito.flatMap((nombreCategoria) => {
        const elegida = categorias.find((c) => c.categoria === nombreCategoria);
        if (elegida) return [elegida];
        return nombreCategoria === categoria ? [{ categoria, cupo: cupoPorDefecto }] : [];
      }),
    );
  }

  return (
    <Tarjeta className="flex flex-col gap-4 p-5">
      <h2 className="text-[17px] font-semibold">Lo básico</h2>

      <div className={`grid gap-3.5 ${usaRanking ? 'sm:grid-cols-[minmax(0,1fr)_240px]' : ''}`}>
        <Campo
          id="torneo-nombre"
          rotulo="Nombre"
          placeholder="Torneo Primavera 26"
          maxLength={80}
          value={nombre}
          onChange={(e) => alCambiarNombre(e.target.value)}
        />
        {/* Sin ranking no hay casilleros: todo torneo es suelto. */}
        {usaRanking && (
          <Selector
            id="torneo-etapa"
            rotulo="Etapa del calendario"
            value={etapa ?? ''}
            onChange={(e) => alCambiarEtapa(e.target.value || null)}
          >
            <option value="">Torneo suelto</option>
            {etapasDelCircuito.map((nombreEtapa) => (
              <option key={nombreEtapa} value={nombreEtapa}>
                {nombreEtapa}
              </option>
            ))}
          </Selector>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-[13px] font-semibold text-gris-500">Categorías que se disputan</h3>
        {categoriasDelCircuito.length === 0 ? (
          <p className="text-sm text-gris-500">
            Primero agregá una categoría en{' '}
            <Link to="/circuito" className="font-medium text-negro underline">
              Tu circuito
            </Link>
            .
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categoriasDelCircuito.map((categoria) => (
              <Chip
                key={categoria}
                activo={categorias.some((c) => c.categoria === categoria)}
                onClick={() => alternar(categoria)}
              >
                {categoria}
              </Chip>
            ))}
          </div>
        )}
      </div>
    </Tarjeta>
  );
}
