import { useSearchParams } from 'react-router-dom';
import { EncabezadoOrganizador } from '../components/EncabezadoOrganizador';
import { InicioConTorneos } from '../features/inicio/InicioConTorneos';
import { InicioSinTorneos } from '../features/inicio/InicioSinTorneos';
import { organizacionEjemplo, torneosEjemplo } from '../features/inicio/torneosEjemplo';

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
  const [parametros] = useSearchParams();
  const conTorneos = parametros.has('ejemplo');
  const { nombre, usuario, jugadores, usaRanking } = organizacionEjemplo;

  return (
    <div className="min-h-screen bg-white text-negro">
      <EncabezadoOrganizador organizacion={nombre} navegacion={navegacion} activo="Inicio" iniciales={iniciales(usuario)} />
      {conTorneos ? (
        <InicioConTorneos torneos={torneosEjemplo} />
      ) : (
        <InicioSinTorneos nombre={primerNombre(usuario)} jugadores={jugadores} usaRanking={usaRanking} />
      )}
    </div>
  );
}
