import { Route, Routes } from 'react-router-dom';
import { Catalogo } from './Catalogo';
import { IngresoPage } from './pages/IngresoPage';
import { LandingPage } from './pages/LandingPage';
import { RecuperarContrasenaPage } from './pages/RecuperarContrasenaPage';
import { RegistroPage } from './pages/RegistroPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/catalogo" element={<Catalogo />} />
      <Route path="/ingresar" element={<IngresoPage />} />
      <Route path="/registro" element={<RegistroPage />} />
      <Route path="/recuperar-contrasena" element={<RecuperarContrasenaPage />} />
    </Routes>
  );
}
