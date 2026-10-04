import { Navigate, useSearchParams } from 'react-router-dom';
import { Boton } from '../components/Boton';
import { EncabezadoOrganizador } from '../components/EncabezadoOrganizador';
import { leerSesion, type Sesion } from '../features/auth/sesion';
import { useCerrarSesion } from '../features/auth/useCerrarSesion';
import { useSesionInvalida } from '../features/auth/useSesionInvalida';
import { useCircuito } from '../features/circuito/useCircuito';
import { InicioConTorneos } from '../features/inicio/InicioConTorneos';
import { InicioSinTorneos } from '../features/inicio/InicioSinTorneos';
import { aTorneosDeInicio } from '../features/inicio/torneosDeInicio';
import { torneosEjemplo } from '../features/inicio/torneosEjemplo';
import { useTorneos } from '../features/inicio/useTorneos';
import { iniciales, navegacionOrganizador } from '../features/organizador/encabezado';

function primerNombre(nombre: string) {
  return nombre.trim().split(/\s+/)[0];
}

export function InicioPage() {
  const sesion = leerSesion();
  if (!sesion) return <Navigate to="/ingresar" replace />;
  return <Inicio sesion={sesion} />;
}

function Inicio({ sesion }: { sesion: Sesion }) {
  const [parametros] = useSearchParams();
  const { slug } = sesion.organizacion;
  const circuito = useCircuito(slug);
  const torneos = useTorneos(slug);
  const error = circuito.error ?? torneos.error;
  const sesionInvalida = useSesionInvalida(error);
  const cerrarSesion = useCerrarSesion();

  // /inicio?ejemplo=1 muestra la pantalla con torneos en juego y terminados, que todavía no
  // pueden existir de verdad. Se borra cuando estén el sorteo y el cierre.
  const verEjemplo = parametros.has('ejemplo');

  return (
    <div className="min-h-screen bg-white text-negro">
      <EncabezadoOrganizador
        organizacion={circuito.data?.nombre ?? sesion.organizacion.nombre}
        navegacion={navegacionOrganizador}
        activo="Inicio"
        iniciales={iniciales(sesion.usuario.nombre)}
        alSalir={cerrarSesion}
      />

      {!circuito.data || !torneos.data ? (
        <div className="flex flex-col items-start gap-3 px-7 pt-[26px]">
          {error && !sesionInvalida ? (
            <>
              <p className="text-[15px] text-gris-500">No pudimos cargar tu organización.</p>
              <Boton
                onClick={() => {
                  void circuito.refetch();
                  void torneos.refetch();
                }}
              >
                Probar de nuevo
              </Boton>
            </>
          ) : (
            <p className="text-[15px] text-gris-500">Cargando tu organización…</p>
          )}
        </div>
      ) : verEjemplo ? (
        <InicioConTorneos torneos={torneosEjemplo} />
      ) : torneos.data.length > 0 ? (
        <InicioConTorneos torneos={aTorneosDeInicio(torneos.data, circuito.data)} />
      ) : (
        <InicioSinTorneos
          nombre={primerNombre(sesion.usuario.nombre)}
          jugadores={circuito.data.jugadores}
          usaRanking={circuito.data.usaRanking}
        />
      )}
    </div>
  );
}
