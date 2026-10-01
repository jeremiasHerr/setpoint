import type { Circuito } from '@setpoint/shared';
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Boton } from '../components/Boton';
import { EncabezadoOrganizador } from '../components/EncabezadoOrganizador';
import { Tarjeta } from '../components/Tarjeta';
import { borrarSesion, leerSesion } from '../features/auth/sesion';
import { useAutoguardadoCircuito, useCircuito, type EstadoGuardado } from '../features/circuito/useCircuito';
import { ResumenCircuito } from '../features/circuito/ResumenCircuito';
import { SeccionCategorias } from '../features/circuito/SeccionCategorias';
import { SeccionClubes } from '../features/circuito/SeccionClubes';
import { SeccionQuienesSon } from '../features/circuito/SeccionQuienesSon';
import { SeccionRanking } from '../features/circuito/SeccionRanking';
import { TablaPuntos } from '../features/circuito/TablaPuntos';

const textoEstado: Record<EstadoGuardado, string> = {
  'sin-cambios': 'configuración · se guarda solo',
  pendiente: 'guardando…',
  guardando: 'guardando…',
  guardado: 'guardado',
  incompleto: 'falta el nombre · sin guardar',
  error: 'no se pudo guardar',
};

// Errores que significan que esta sesión ya no sirve para esta organización.
const ERRORES_DE_SESION = ['NO_AUTENTICADO', 'SIN_PERMISO', 'ORGANIZACION_NO_ENCONTRADA'];

export function TuCircuitoPage() {
  const sesion = leerSesion();
  if (!sesion) return <Navigate to="/ingresar" replace />;
  return <CargarCircuito slug={sesion.organizacion.slug} />;
}

function CargarCircuito({ slug }: { slug: string }) {
  const navegar = useNavigate();
  const { data, error, refetch } = useCircuito(slug);
  const sesionInvalida = error && ERRORES_DE_SESION.includes(error.message);

  useEffect(() => {
    if (sesionInvalida) {
      borrarSesion();
      navegar('/ingresar', { replace: true });
    }
  }, [sesionInvalida, navegar]);

  if (data) return <EditorCircuito slug={slug} inicial={data} />;

  return (
    <div className="min-h-screen bg-white text-negro">
      <EncabezadoOrganizador organizacion="Tu circuito" />
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

function EditorCircuito({ slug, inicial }: { slug: string; inicial: Circuito }) {
  const [circuito, setCircuito] = useState<Circuito>(inicial);
  // No hay columna para esto todavía: es solo estado de pantalla.
  const [usaClubes, setUsaClubes] = useState(false);
  const estadoGuardado = useAutoguardadoCircuito(slug, circuito);

  function cambiar<K extends keyof Circuito>(campo: K, valor: Circuito[K]) {
    setCircuito((anterior) => ({ ...anterior, [campo]: valor }));
  }

  // Apagar el ranking solo oculta etapas y puntos: quedan guardados y vuelven al reactivarlo.
  const { usaRanking } = circuito;

  return (
    <div className="min-h-screen bg-white text-negro">
      <EncabezadoOrganizador organizacion={circuito.nombre || 'Tu circuito'} estado={textoEstado[estadoGuardado]} />

      <div className="flex flex-col gap-[7px] px-7 pt-[26px] pb-5">
        <h1 className="text-[30px] font-semibold tracking-[-0.035em]">Tu circuito</h1>
        <p className="text-[15px] text-gris-500">
          Podés crear un torneo sin configurar nada de esto. El ranking anual es opcional y lo activás cuando quieras.
        </p>
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
          <SeccionClubes usaClubes={usaClubes} alCambiar={setUsaClubes} />
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

          {/* Se conectan cuando existan las pantallas de padrón y de nuevo torneo. */}
          <div className="flex flex-col gap-2.5">
            <Boton variante="organizador" className="w-full">
              Guardar y cargar el padrón
            </Boton>
            <Boton className="w-full">Crear un torneo ahora</Boton>
          </div>
        </aside>
      </main>
    </div>
  );
}
