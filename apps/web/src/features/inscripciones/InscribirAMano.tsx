import type { BajaDelTorneo, DatosInscripcionManual, InscripcionDelTorneo, JugadorPadron } from '@setpoint/shared';
import { useState } from 'react';
import { Boton } from '../../components/Boton';
import { Campo } from '../../components/Campo';
import { Chip } from '../../components/Chip';
import { Numero } from '../../components/Numero';
import { usePadron } from '../padron/usePadron';
import { textoDelError } from './errores';
import { normalizar } from './texto';
import { useInscribirAMano } from './useInscripciones';

type Medio = DatosInscripcionManual['medio'];

const MEDIOS: { clave: Medio; nombre: string }[] = [
  { clave: 'efectivo', nombre: 'Efectivo' },
  { clave: 'transferencia', nombre: 'Transferencia' },
  { clave: 'otro', nombre: 'Otro' },
];

// Cuántos resultados se muestran: se busca por apellido, no se recorre el padrón.
const RESULTADOS = 6;

type Props = {
  slug: string;
  torneoId: number;
  categoria: string;
  precio: number;
  libres: number;
  inscripciones: InscripcionDelTorneo[];
  bajas: BajaDelTorneo[];
  alCerrar: () => void;
};

// Inscribir a mano a quien pagó por fuera del sistema (estado 5 de inscripciones.html, 05-pagos §8).
// Busca en el padrón de la categoría. Si estaba reservando, se confirma su reserva; si no, ocupa un
// lugar libre, y sin lugares no se abre: la organización no se pasa del cupo (decisión 079).
export function InscribirAMano({ slug, torneoId, categoria, precio, libres, inscripciones, bajas, alCerrar }: Props) {
  const padron = usePadron(slug);
  const inscribir = useInscribirAMano(slug, torneoId);
  const [busqueda, setBusqueda] = useState('');
  const [elegido, setElegido] = useState<JugadorPadron | null>(null);
  const [medio, setMedio] = useState<Medio>('efectivo');
  const [monto, setMonto] = useState(String(precio));

  const pagados = new Set(inscripciones.filter((i) => i.estado === 'pagada').map((i) => i.jugadorId));
  const reservando = new Set(inscripciones.filter((i) => i.estado === 'reservando').map((i) => i.jugadorId));
  const dadosDeBaja = new Set(bajas.map((b) => b.jugadorId));
  // Por qué no se puede elegir a alguien que aparece en la búsqueda.
  const noSePuede = (j: JugadorPadron) => (pagados.has(j.id) ? 'ya inscripto' : dadosDeBaja.has(j.id) ? 'se dio de baja' : null);

  const termino = normalizar(busqueda);
  const candidatos =
    termino.length < 2
      ? []
      : (padron.data ?? [])
          .filter((j) => j.activo && j.categoria === categoria && normalizar(j.apellido).includes(termino))
          .slice(0, RESULTADOS);

  const montoElegido = Number(monto.replace(/\D/g, ''));

  return (
    <section className="flex flex-col gap-4 rounded-tarjeta border-[1.5px] border-negro p-[18px]">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2.5">
          <h2 className="text-base font-semibold">Inscribir a mano</h2>
          <button type="button" onClick={alCerrar} className="text-sm text-gris-500 hover:text-negro">
            Cancelar
          </button>
        </div>
        <p className="text-sm leading-[1.45] text-gris-500">Para quien te pagó en efectivo o por transferencia.</p>
      </div>

      <div className="flex flex-col gap-2">
        <Campo
          id="inscribir-a-mano-apellido"
          rotulo={`Jugador del padrón de ${categoria}`}
          type="search"
          autoComplete="off"
          placeholder="Buscá por apellido"
          value={elegido ? `${elegido.nombre} ${elegido.apellido}` : busqueda}
          onChange={(e) => {
            setElegido(null);
            setBusqueda(e.target.value);
          }}
        />
        {!elegido && candidatos.length > 0 && (
          <ul className="overflow-hidden rounded-control border border-linea">
            {candidatos.map((jugador) => {
              const motivo = noSePuede(jugador);
              return (
                <li key={jugador.id} className="border-b border-linea-suave last:border-b-0">
                  <button
                    type="button"
                    disabled={motivo !== null}
                    onClick={() => setElegido(jugador)}
                    className="flex h-11 w-full items-center justify-between gap-2.5 px-3 text-left text-sm hover:bg-lima-tenue disabled:hover:bg-transparent"
                  >
                    <span className={motivo ? 'text-gris-400' : 'font-medium'}>
                      {jugador.nombre} {jugador.apellido}
                    </span>
                    {motivo && <span className="font-mono text-xs text-gris-400">{motivo}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {!elegido && termino.length >= 2 && padron.data && candidatos.length === 0 && (
          <p className="text-[13px] text-gris-500">Nadie en el padrón de {categoria} tiene ese apellido.</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-semibold text-gris-500">Cómo te pagó</span>
        <div role="group" aria-label="Cómo te pagó" className="flex flex-wrap gap-1.5">
          {MEDIOS.map(({ clave, nombre }) => (
            <Chip key={clave} activo={medio === clave} onClick={() => setMedio(clave)}>
              {nombre}
            </Chip>
          ))}
        </div>
      </div>

      <Campo
        id="inscribir-a-mano-monto"
        rotulo="Monto"
        numerico
        inputMode="numeric"
        value={monto}
        onChange={(e) => setMonto(e.target.value)}
        sufijo="pesos"
      />

      <p className="text-[13px] leading-[1.45] text-gris-500">
        {elegido && reservando.has(elegido.id) ? (
          'Está reservando: se confirma su reserva y no ocupa otro lugar.'
        ) : (
          <>
            Queda pagado y ocupa {libres === 1 ? 'el único lugar libre' : <>uno de los <Numero className="text-negro">{libres}</Numero> lugares libres</>}.
            No le llega comprobante: el pago lo recibiste vos.
          </>
        )}
      </p>

      {inscribir.error && <p className="text-[13px] text-rojo-texto">{textoDelError(inscribir.error)}</p>}

      <Boton
        variante="organizador"
        className="font-semibold"
        disabled={!elegido || inscribir.isPending}
        onClick={() =>
          elegido && inscribir.mutate({ jugadorId: elegido.id, medio, monto: montoElegido }, { onSuccess: alCerrar })
        }
      >
        {inscribir.isPending ? 'Inscribiendo…' : elegido ? `Inscribir a ${elegido.nombre} ${elegido.apellido}` : 'Elegí al jugador'}
      </Boton>
    </section>
  );
}
