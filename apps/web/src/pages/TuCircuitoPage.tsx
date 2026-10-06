import type { Circuito } from '@setpoint/shared';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Boton } from '../components/Boton';
import { EncabezadoOrganizador } from '../components/EncabezadoOrganizador';
import { Tarjeta } from '../components/Tarjeta';
import { leerSesion, type Sesion } from '../features/auth/sesion';
import { useCerrarSesion } from '../features/auth/useCerrarSesion';
import { useSesionInvalida } from '../features/auth/useSesionInvalida';
import { useAutoguardadoCircuito, useCircuito, type EstadoGuardado } from '../features/circuito/useCircuito';
import { ResumenCircuito } from '../features/circuito/ResumenCircuito';
import { SeccionCategorias } from '../features/circuito/SeccionCategorias';
import { SeccionClubes } from '../features/circuito/SeccionClubes';
import { SeccionQuienesSon } from '../features/circuito/SeccionQuienesSon';
import { SeccionRanking } from '../features/circuito/SeccionRanking';
import { TablaPuntos } from '../features/circuito/TablaPuntos';
import { iniciales, navegacionOrganizador } from '../features/organizador/encabezado';

const textoEstado: Record<EstadoGuardado, string> = {
  'sin-cambios': 'se guarda solo',
  pendiente: 'guardando…',
  guardando: 'guardando…',
  guardado: 'guardado',
  incompleto: 'falta un nombre · sin guardar',
  error: 'no se pudo guardar',
};

export function TuCircuitoPage() {
  const sesion = leerSesion();
  if (!sesion) return <Navigate to="/ingresar" replace />;
  return <CargarCircuito sesion={sesion} />;
}

function Encabezado({ sesion, organizacion }: { sesion: Sesion; organizacion: string }) {
  const cerrarSesion = useCerrarSesion();
  return (
    <EncabezadoOrganizador
      organizacion={organizacion}
      navegacion={navegacionOrganizador}
      activo="Circuito"
      iniciales={iniciales(sesion.usuario.nombre)}
      alSalir={cerrarSesion}
    />
  );
}

function CargarCircuito({ sesion }: { sesion: Sesion }) {
  const { data, error, refetch, isFetchedAfterMount } = useCircuito(sesion.organizacion.slug);
  const sesionInvalida = useSesionInvalida(error);
  // El editor copia los datos una sola vez al montarse: si arrancara con lo que quedó en caché
  // (por ejemplo, volviendo desde el padrón) se quedaría con lo viejo y el autoguardado lo mandaría.
  // Una vez abierto no se cierra: un refetch que falle en segundo plano no debe perder lo que se edita.
  const [abierto, setAbierto] = useState(false);
  if (!abierto && data && isFetchedAfterMount && !error) setAbierto(true);

  if (abierto && data) return <EditorCircuito sesion={sesion} inicial={data} />;

  return (
    <div className="min-h-screen bg-white text-negro">
      <Encabezado sesion={sesion} organizacion={sesion.organizacion.nombre} />
      <div className="flex flex-col items-start gap-3 px-7 pt-[26px]">
        {error && !sesionInvalida ? (
          <>
            <p className="text-[15px] text-gris-500">No pudimos cargar tu circuito.</p>
            <Boton onClick={() => void refetch()}>Probar de nuevo</Boton>
          </>
        ) : (
          <p className="text-[15px] text-gris-500">Cargando tu circuito…</p>
        )}
      </div>
    </div>
  );
}

function EditorCircuito({ sesion, inicial }: { sesion: Sesion; inicial: Circuito }) {
  const slug = sesion.organizacion.slug;
  const [circuito, setCircuito] = useState<Circuito>(inicial);
  // No hay columna para esto: arranca encendido si ya hay clubes, y apagarlo solo los oculta.
  const [usaClubes, setUsaClubes] = useState(inicial.clubes.length > 0);
  const estadoGuardado = useAutoguardadoCircuito(slug, circuito);
  const navegar = useNavigate();
  // Salir con un cambio sin guardar lo perdería: el autoguardado espera un momento antes de mandarlo.
  const guardando = estadoGuardado === 'pendiente' || estadoGuardado === 'guardando';

  function cambiar<K extends keyof Circuito>(campo: K, valor: Circuito[K]) {
    setCircuito((anterior) => ({ ...anterior, [campo]: valor }));
  }

  // Apagar el ranking solo oculta etapas y puntos: quedan guardados y vuelven al reactivarlo.
  const { usaRanking } = circuito;

  return (
    <div className="min-h-screen bg-white text-negro">
      <Encabezado sesion={sesion} organizacion={circuito.nombre || sesion.organizacion.nombre} />

      <div className="flex flex-wrap items-end justify-between gap-6 px-7 pt-[26px] pb-5">
        <div className="flex flex-col gap-[7px]">
          <h1 className="text-[30px] font-semibold tracking-[-0.035em]">Tu circuito</h1>
          <p className="text-[15px] text-gris-500">
            Podés crear un torneo sin configurar nada de esto. El ranking anual es opcional y lo activás cuando quieras.
          </p>
        </div>
        <span aria-live="polite" className="shrink-0 font-mono text-[13px] text-gris-500 tabular-nums">
          {textoEstado[estadoGuardado]}
        </span>
      </div>

      <main className="grid items-start gap-[22px] px-7 pb-7 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-4">
          <SeccionQuienesSon
            nombre={circuito.nombre}
            slug={circuito.slug}
            contacto={circuito.contacto}
            alCambiar={(campo, valor) => cambiar(campo, valor)}
          />
          <SeccionCategorias categorias={circuito.categorias} alCambiar={(categorias) => cambiar('categorias', categorias)} />
          <SeccionRanking
            usaRanking={usaRanking}
            etapas={circuito.etapas}
            alCambiarUsaRanking={(valor) => cambiar('usaRanking', valor)}
            alCambiarEtapas={(etapas) => cambiar('etapas', etapas)}
          />
          {usaRanking && (
            <TablaPuntos
              puntos={circuito.puntos}
              alCambiar={(instancia, puntos) => cambiar('puntos', { ...circuito.puntos, [instancia]: puntos })}
            />
          )}
          <SeccionClubes
            usaClubes={usaClubes}
            clubes={circuito.clubes}
            alCambiarUsaClubes={setUsaClubes}
            alCambiar={(clubes) => cambiar('clubes', clubes)}
          />
        </div>

        <aside className="flex flex-col gap-4">
          <ResumenCircuito
            usaRanking={usaRanking}
            categorias={circuito.categorias.length}
            etapas={circuito.etapas.length}
            jugadores={circuito.jugadores}
          />

          {usaRanking && (
            <Tarjeta className="flex flex-col gap-[9px] bg-fondo p-[18px]">
              <h2 className="text-sm font-semibold">¿Solo querés probar?</h2>
              <p className="text-sm leading-normal text-gris-500">
                Apagá el ranking anual y creá un torneo suelto. Al terminar vas a tener la tabla de posiciones de ese torneo, sin
                acumular puntos.
              </p>
            </Tarjeta>
          )}

          <div className="flex flex-col gap-2.5">
            <Boton variante="organizador" className="w-full" disabled={guardando} onClick={() => navegar('/padron')}>
              Guardar y cargar el padrón
            </Boton>
            <Boton className="w-full" disabled={guardando} onClick={() => navegar('/torneos/nuevo')}>
              Crear un torneo ahora
            </Boton>
          </div>
        </aside>
      </main>
    </div>
  );
}
