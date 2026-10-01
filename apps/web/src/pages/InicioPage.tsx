import { Navigate, useSearchParams } from 'react-router-dom';
import { Boton } from '../components/Boton';
import { EncabezadoOrganizador } from '../components/EncabezadoOrganizador';
import { leerSesion, type Sesion } from '../features/auth/sesion';
import { useSesionInvalida } from '../features/auth/useSesionInvalida';
import { useCircuito } from '../features/circuito/useCircuito';
import { InicioConTorneos } from '../features/inicio/InicioConTorneos';
import { InicioSinTorneos } from '../features/inicio/InicioSinTorneos';
import { torneosEjemplo } from '../features/inicio/torneosEjemplo';

// Padrón y Ranking se suman cuando existan sus pantallas.
const navegacion = [
  { etiqueta: 'Inicio', href: '/inicio' },
  { etiqueta: 'Circuito', href: '/circuito' },
];

function primerNombre(nombre: string) {
  return nombre.trim().split(/\s+/)[0];
}

function iniciales(nombre: string) {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((palabra) => palabra[0]?.toUpperCase() ?? '')
    .join('');
}

export function InicioPage() {
  const sesion = leerSesion();
  if (!sesion) return <Navigate to="/ingresar" replace />;
  return <Inicio sesion={sesion} />;
}

function Inicio({ sesion }: { sesion: Sesion }) {
  const [parametros] = useSearchParams();
  const { data: circuito, error, refetch } = useCircuito(sesion.organizacion.slug);
  const sesionInvalida = useSesionInvalida(error);

  // Todavía no hay endpoint de torneos, así que una organización real siempre está en "primera vez".
  // /inicio?ejemplo=1 muestra el estado con torneos usando datos de ejemplo; se borra al conectar los torneos.
  const verEjemplo = parametros.has('ejemplo');

  return (
    <div className="min-h-screen bg-white text-negro">
      <EncabezadoOrganizador
        organizacion={circuito?.nombre ?? sesion.organizacion.nombre}
        navegacion={navegacion}
        activo="Inicio"
        iniciales={iniciales(sesion.usuario.nombre)}
      />

      {!circuito ? (
        <div className="flex flex-col items-start gap-3 px-7 pt-[26px]">
          {error && !sesionInvalida ? (
            <>
              <p className="text-[15px] text-gris-500">No pudimos cargar tu organización.</p>
              <Boton onClick={() => void refetch()}>Probar de nuevo</Boton>
            </>
          ) : (
            <p className="text-[15px] text-gris-500">Cargando tu organización…</p>
          )}
        </div>
      ) : verEjemplo ? (
        <InicioConTorneos torneos={torneosEjemplo} />
      ) : (
        <InicioSinTorneos
          nombre={primerNombre(sesion.usuario.nombre)}
          jugadores={circuito.jugadores}
          usaRanking={circuito.usaRanking}
        />
      )}
    </div>
  );
}
