import { Link } from 'react-router-dom';
import { Logo } from '../Logo';

const enlaceNavegacion = 'hidden h-9 items-center px-[13px] text-sm text-gris-700 hover:text-negro sm:flex';

export function EncabezadoLanding() {
  return (
    <header className="flex h-[68px] items-center justify-between gap-6 border-b border-linea px-4 sm:px-10">
      <Logo invertido />
      <nav className="flex items-center gap-2">
        <a href="#como-funciona" className={enlaceNavegacion}>
          Cómo funciona
        </a>
        <a href="#para-jugadores" className={enlaceNavegacion}>
          Para jugadores
        </a>
        <Link to="/ingresar" className="flex h-9 items-center px-[13px] text-sm text-gris-700 hover:text-negro">
          Ingresar
        </Link>
        <Link
          to="/registro"
          className="flex h-10 items-center rounded-control bg-negro px-[17px] text-sm font-semibold text-white hover:text-white"
        >
          Crear mi circuito
        </Link>
      </nav>
    </header>
  );
}
