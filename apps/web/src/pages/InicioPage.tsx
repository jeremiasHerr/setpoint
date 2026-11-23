import type { ResumenConvocatoria } from '@setpoint/shared';
import { Navigate } from 'react-router-dom';
import { Boton } from '../components/Boton';
import { EncabezadoOrganizador } from '../components/EncabezadoOrganizador';
import { Esqueleto } from '../components/Esqueleto';
import { leerSesion, type Sesion } from '../features/auth/sesion';
import { useCerrarSesion } from '../features/auth/useCerrarSesion';
import { useSesionInvalida } from '../features/auth/useSesionInvalida';
import { useCircuito } from '../features/circuito/useCircuito';
import { InicioConTorneos } from '../features/inicio/InicioConTorneos';
import { InicioSinTorneos } from '../features/inicio/InicioSinTorneos';
import type { EstadoDePrimerosPasos } from '../features/inicio/PrimerosPasos';
import { aTorneosDeInicio } from '../features/inicio/torneosDeInicio';
import { useTorneos } from '../features/inicio/useTorneos';
import { iniciales, navegacionOrganizador } from '../features/organizador/encabezado';

// Lo que tilda cada uno de los primeros pasos (decisión 134). Compartir el link se tilda con la
// primera inscripción pagada: es lo que prueba que el link llegó.
function primerosPasos(jugadores: number, convocatorias: ResumenConvocatoria[]): EstadoDePrimerosPasos {
  const torneos = convocatorias.flatMap((c) => c.torneos);
  return {
    hayJugadores: jugadores > 0,
    hayTorneo: convocatorias.length > 0,
    hayInscripcion: torneos.some((t) => t.inscriptos > 0),
    torneoAbiertoId: torneos.find((t) => t.estado === 'publicado')?.id ?? null,
  };
}

function primerNombre(nombre: string) {
  return nombre.trim().split(/\s+/)[0];
}

export function InicioPage() {
  const sesion = leerSesion();
  if (!sesion) return <Navigate to="/ingresar" replace />;
  return <Inicio sesion={sesion} />;
}

function Inicio({ sesion }: { sesion: Sesion }) {
  const { slug } = sesion.organizacion;
  const circuito = useCircuito(slug);
  const torneos = useTorneos(slug);
  const error = circuito.error ?? torneos.error;
  const sesionInvalida = useSesionInvalida(error);
  const cerrarSesion = useCerrarSesion();

  return (
    <div className="min-h-screen bg-papel text-noche">
      <EncabezadoOrganizador
        organizacion={circuito.data?.nombre ?? sesion.organizacion.nombre}
        navegacion={navegacionOrganizador}
        activo="Inicio"
        iniciales={iniciales(sesion.usuario.nombre)}
        alSalir={cerrarSesion}
      />

      {/* Mientras carga, el esqueleto: aparece solo si tarda, así que no parpadea (decisión 093). */}
      {!circuito.data || !torneos.data ? (
        error ? (
          !sesionInvalida && (
            <div className="flex flex-col items-start gap-3 px-4 pt-[26px] md:px-7">
              <p className="text-[15px] text-pizarra-500">No pudimos cargar tu organización.</p>
              <Boton
                onClick={() => {
                  void circuito.refetch();
                  void torneos.refetch();
                }}
              >
                Probar de nuevo
              </Boton>
            </div>
          )
        ) : (
          <div className="px-4 pt-[26px] md:px-7">
            <Esqueleto />
          </div>
        )
      ) : torneos.data.length > 0 ? (
        <InicioConTorneos
          torneos={aTorneosDeInicio(torneos.data, circuito.data)}
          slug={slug}
          primerosPasos={primerosPasos(circuito.data.jugadores, torneos.data)}
        />
      ) : (
        <InicioSinTorneos
          nombre={primerNombre(sesion.usuario.nombre)}
          jugadores={circuito.data.jugadores}
          usaRanking={circuito.data.usaRanking}
          primerosPasos={primerosPasos(circuito.data.jugadores, torneos.data)}
        />
      )}
    </div>
  );
}
