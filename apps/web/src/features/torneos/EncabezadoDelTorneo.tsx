import { pestanasDelTorneo, type EstadoTorneo, type PestanaDelTorneo } from '@setpoint/shared';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Boton } from '../../components/Boton';
import { EncabezadoOrganizador } from '../../components/EncabezadoOrganizador';
import { Migas } from '../../components/Migas';
import type { Sesion } from '../auth/sesion';
import { useCerrarSesion } from '../auth/useCerrarSesion';
import { iniciales, navegacionOrganizador } from '../organizador/encabezado';
import { useNavegacionDelTorneo } from './useNavegacionDelTorneo';

// La ruta de cada pestaña cuelga de /torneos/:id. El motivo se muestra al tocar una apagada.
const PESTANAS: Record<PestanaDelTorneo, { etiqueta: string; ruta: string; motivo: string }> = {
  inscripciones: { etiqueta: 'Inscripciones', ruta: 'inscripciones', motivo: '' },
  zonas: { etiqueta: 'Zonas', ruta: 'sorteo', motivo: 'Las zonas se sortean cuando cierra la inscripción.' },
  tablero: { etiqueta: 'Tablero', ruta: 'tablero', motivo: 'El tablero aparece cuando se confirma el sorteo de zonas.' },
  resultados: {
    etiqueta: 'Resultados',
    ruta: 'resultados',
    motivo: 'Los resultados se cargan cuando se confirma el sorteo de zonas.',
  },
  cierre: { etiqueta: 'Cierre', ruta: 'cierre', motivo: 'El torneo se cierra cuando se definen los campeones.' },
};

// Como los nombra design.md: en los cuadros, el estado de la base es "eliminatorias".
const ESTADO: Record<EstadoTorneo, string> = {
  borrador: 'borrador',
  publicado: 'publicado',
  inscripciones_cerradas: 'inscripciones cerradas',
  zonas_generadas: 'zonas generadas',
  grupos_en_curso: 'grupos en curso',
  eliminatorias: 'cuadros',
  finalizado: 'finalizado',
  cancelado: 'cancelado',
};

// En el celular cada pestaña ocupa su celda de la grilla, sin margen; desde sm, el de siempre.
const pestana = 'flex h-11 items-center border-b-2 text-[15px] -mb-px sm:px-3';

type Props = {
  sesion: Sesion;
  torneoId: number;
  // La pantalla en la que se está.
  actual: PestanaDelTorneo;
};

// El encabezado de las pantallas de un torneo: el de la organización y, debajo, la franja con las
// migas hasta el torneo (decisión 100) y sus pestañas, igual en las cinco (decisión 095). Las
// pestañas que todavía no aplican se ven apagadas y, al tocarlas, dicen por qué.
export function EncabezadoDelTorneo({ sesion, torneoId, actual }: Props) {
  const cerrarSesion = useCerrarSesion();
  const navegacion = useNavegacionDelTorneo(sesion.organizacion.slug, torneoId);
  const navegar = useNavigate();
  const [apagadaTocada, setApagadaTocada] = useState<PestanaDelTorneo | null>(null);
  const datos = navegacion.data;

  return (
    <>
      {/* Las pantallas del torneo se abren desde el inicio. */}
      <EncabezadoOrganizador
        organizacion={sesion.organizacion.nombre}
        navegacion={navegacionOrganizador}
        activo="Inicio"
        iniciales={iniciales(sesion.usuario.nombre)}
        alSalir={cerrarSesion}
      />

      {/* Sin la respuesta, la franja ocupa su lugar vacía: al llegar no empuja la pantalla. Si falla, la
          pantalla ya dice lo suyo. */}
      {!navegacion.isError && (
        <div className="border-b border-linea px-4 pt-[18px] md:px-7">
          <div className="flex min-h-10 flex-wrap items-center justify-between gap-x-6 gap-y-3">
            {datos && (
              <>
                <div className="flex min-w-0 flex-wrap items-center gap-3">
                  {/* El tercer nivel es la pestaña activa, justo debajo. */}
                  <Migas anteriores={[{ etiqueta: 'Inicio', ruta: '/inicio' }]}>
                    <span className="font-medium text-noche">{datos.nombre}</span>
                  </Migas>
                  <span className="flex h-7 items-center rounded-full border border-linea px-[11px] text-[12.5px] font-medium text-noche">
                    {ESTADO[datos.estado]}
                  </span>
                </div>
                {/* La edición vuelve, por sus migas, a esta categoría y no a la primera de la convocatoria. */}
                {datos.sePuedeEditar && (
                  <Boton onClick={() => navegar(`/torneos/${datos.convocatoriaId}`, { state: { desde: torneoId } })}>Editar el torneo</Boton>
                )}
              </>
            )}
          </div>

          {/* Las cinco en una fila miden 444 px y en un celular de 360 hay 328: debajo de sm van en una
              grilla de tres columnas, y la fila de arriba lleva su línea de base (decisión 110). */}
          <nav aria-label="Pantallas del torneo" className="mt-2.5 grid min-h-11 grid-cols-3 sm:flex sm:flex-wrap sm:gap-x-1">
            {datos &&
              pestanasDelTorneo.map((clave, i) => {
                const { etiqueta, ruta } = PESTANAS[clave];
                const base = i < 3 ? 'max-sm:border-linea-suave' : '';
                if (clave === actual) {
                  return (
                    <Link key={clave} to={`/torneos/${torneoId}/${ruta}`} aria-current="page" className={`${pestana} border-noche font-semibold`}>
                      {etiqueta}
                    </Link>
                  );
                }
                if (datos.disponibles[clave]) {
                  return (
                    <Link
                      key={clave}
                      to={`/torneos/${torneoId}/${ruta}`}
                      className={`${pestana} border-transparent ${base} font-medium text-pizarra-700 hover:text-noche`}
                    >
                      {etiqueta}
                    </Link>
                  );
                }
                return (
                  <button
                    key={clave}
                    type="button"
                    aria-disabled="true"
                    aria-describedby={apagadaTocada === clave ? 'motivo-pestana' : undefined}
                    onClick={() => setApagadaTocada(apagadaTocada === clave ? null : clave)}
                    className={`${pestana} cursor-default border-transparent ${base} font-medium text-pizarra-400`}
                  >
                    {etiqueta}
                  </button>
                );
              })}
          </nav>
        </div>
      )}

      <p id="motivo-pestana" aria-live="polite" className={apagadaTocada ? 'px-4 pt-3 text-sm text-pizarra-500 md:px-7' : 'sr-only'}>
        {apagadaTocada && PESTANAS[apagadaTocada].motivo}
      </p>
    </>
  );
}
