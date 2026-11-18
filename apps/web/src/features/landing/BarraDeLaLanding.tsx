import { Link } from 'react-router-dom';
import { Logo } from '../../components/Logo';

const ENLACE =
  'flex min-h-11 items-center rounded-control hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

// La barra fija sobre la pared noche. Los enlaces de sección se esconden en el celular; Ingresar queda.
export function BarraDeLaLanding() {
  return (
    <header className="sticky top-0 z-20 bg-noche-900 px-8 max-[859px]:px-4">
      <div className="mx-auto grid min-h-[72px] max-w-[1200px] grid-cols-[1fr_auto_1fr] items-center gap-x-7 gap-y-2.5 max-[859px]:min-h-14 max-[859px]:grid-cols-[1fr_auto]">
        <Link
          to="/"
          aria-label="SetPoint, inicio"
          className="flex min-h-11 items-center justify-self-start rounded-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <Logo sobreNoche grande />
        </Link>
        <nav aria-label="Secciones" className="flex gap-7 text-[15px] leading-5 font-medium text-pizarra-400 max-[859px]:hidden">
          <a href="#producto" className={ENLACE}>
            Producto
          </a>
          <a href="#funciones" className={ENLACE}>
            Funciones
          </a>
          <a href="#preguntas" className={ENLACE}>
            Preguntas
          </a>
        </nav>
        <Link
          to="/ingresar"
          className="inline-flex h-9 items-center justify-center justify-self-end rounded-control border border-borde-noche px-3.5 text-[14px] leading-none font-medium whitespace-nowrap text-white transition-colors hover:bg-noche-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white max-[859px]:h-11 motion-reduce:transition-none"
        >
          Ingresar
        </Link>
      </div>
    </header>
  );
}
