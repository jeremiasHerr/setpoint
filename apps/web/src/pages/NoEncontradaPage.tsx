import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { leerSesion } from '../features/auth/sesion';

// Cualquier dirección que no es de una página: sin esto quedaba en blanco, sin logo ni salida.
export function NoEncontradaPage() {
  // Quien tiene la sesión iniciada vuelve a su inicio; el resto, a la landing.
  const inicio = leerSesion() ? '/inicio' : '/';

  return (
    <main className="mx-auto flex min-h-screen max-w-[480px] flex-col gap-[18px] px-4 pt-5 pb-7">
      <Logo />
      <div className="flex flex-col gap-2 pt-6">
        <h1 className="text-[30px] font-semibold tracking-[-0.035em]">No encontramos esa página</h1>
        <p className="text-[15px] text-gris-500">Revisá el enlace, o volvé al inicio.</p>
      </div>
      <Link
        to={inicio}
        className="inline-flex h-10 items-center justify-center self-start rounded-control border border-linea px-4 text-[15px] font-medium text-negro hover:bg-fondo"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
