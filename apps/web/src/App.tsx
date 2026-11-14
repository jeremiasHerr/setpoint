import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation, useNavigationType } from 'react-router-dom';

// Cada página se descarga cuando se la pide: quien abre el ranking desde el celular no baja también
// el panel del organizador ni el arrastrar y soltar del sorteo.
const CargarResultadoPage = lazy(() => import('./pages/CargarResultadoPage').then((m) => ({ default: m.CargarResultadoPage })));
const CierrePage = lazy(() => import('./pages/CierrePage').then((m) => ({ default: m.CierrePage })));
const EnVivoPage = lazy(() => import('./pages/EnVivoPage').then((m) => ({ default: m.EnVivoPage })));
const FichaPublicaPage = lazy(() => import('./pages/FichaPublicaPage').then((m) => ({ default: m.FichaPublicaPage })));
const ImportarPadronPage = lazy(() => import('./pages/ImportarPadronPage').then((m) => ({ default: m.ImportarPadronPage })));
const IngresoPage = lazy(() => import('./pages/IngresoPage').then((m) => ({ default: m.IngresoPage })));
const InscripcionesPage = lazy(() => import('./pages/InscripcionesPage').then((m) => ({ default: m.InscripcionesPage })));
const InicioPage = lazy(() => import('./pages/InicioPage').then((m) => ({ default: m.InicioPage })));
const LandingPage = lazy(() => import('./pages/LandingPage').then((m) => ({ default: m.LandingPage })));
const NoEncontradaPage = lazy(() => import('./pages/NoEncontradaPage').then((m) => ({ default: m.NoEncontradaPage })));
const NuevoTorneoPage = lazy(() => import('./pages/NuevoTorneoPage').then((m) => ({ default: m.NuevoTorneoPage })));
const PadronPage = lazy(() => import('./pages/PadronPage').then((m) => ({ default: m.PadronPage })));
const RecuperarContrasenaPage = lazy(() => import('./pages/RecuperarContrasenaPage').then((m) => ({ default: m.RecuperarContrasenaPage })));
const RankingPublicoPage = lazy(() => import('./pages/RankingPublicoPage').then((m) => ({ default: m.RankingPublicoPage })));
const RegistroPage = lazy(() => import('./pages/RegistroPage').then((m) => ({ default: m.RegistroPage })));
const RestablecerContrasenaPage = lazy(() =>
  import('./pages/RestablecerContrasenaPage').then((m) => ({ default: m.RestablecerContrasenaPage })),
);
const InscripcionPage = lazy(() => import('./pages/InscripcionPage').then((m) => ({ default: m.InscripcionPage })));
const LinkPersonalPage = lazy(() => import('./pages/LinkPersonalPage').then((m) => ({ default: m.LinkPersonalPage })));
const PagoPage = lazy(() => import('./pages/PagoPage').then((m) => ({ default: m.PagoPage })));
const RevisarVinculacionPage = lazy(() => import('./pages/RevisarVinculacionPage').then((m) => ({ default: m.RevisarVinculacionPage })));
const TorneoPublicoPage = lazy(() => import('./pages/TorneoPublicoPage').then((m) => ({ default: m.TorneoPublicoPage })));
const SorteoPage = lazy(() => import('./pages/SorteoPage').then((m) => ({ default: m.SorteoPage })));
const TableroPage = lazy(() => import('./pages/TableroPage').then((m) => ({ default: m.TableroPage })));
const TuCircuitoPage = lazy(() => import('./pages/TuCircuitoPage').then((m) => ({ default: m.TuCircuitoPage })));

// El catálogo de componentes es para desarrollar: no entra en el build de producción.
const Catalogo = import.meta.env.DEV ? lazy(() => import('./Catalogo').then((m) => ({ default: m.Catalogo }))) : null;

// Al cambiar de pantalla, la nueva abre arriba: en una página de una sola carga el navegador no lo
// hace solo, y se llegaba al tablero a mitad de página. Volver con el navegador (POP) le deja al
// navegador el lugar donde estaba.
function SubirAlCambiarDePantalla() {
  const { pathname } = useLocation();
  const tipo = useNavigationType();

  useEffect(() => {
    if (tipo !== 'POP') window.scrollTo(0, 0);
  }, [pathname, tipo]);

  return null;
}

export default function App() {
  return (
    // Sin fallback: la página tarda un instante y cada una muestra su propio esqueleto (decisión 093).
    <Suspense fallback={null}>
      <SubirAlCambiarDePantalla />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {Catalogo && <Route path="/catalogo" element={<Catalogo />} />}
        <Route path="/ingresar" element={<IngresoPage />} />
        <Route path="/registro" element={<RegistroPage />} />
        <Route path="/recuperar-contrasena" element={<RecuperarContrasenaPage />} />
        <Route path="/restablecer-contrasena" element={<RestablecerContrasenaPage />} />
        <Route path="/inicio" element={<InicioPage />} />
        <Route path="/circuito" element={<TuCircuitoPage />} />
        <Route path="/padron" element={<PadronPage />} />
        <Route path="/padron/importar" element={<ImportarPadronPage />} />
        <Route path="/padron/revisar/:jugadorId" element={<RevisarVinculacionPage />} />
        {/* /torneos/nuevo entra por acá con id "nuevo": es la misma pantalla antes del primer guardado. */}
        <Route path="/torneos/:id" element={<NuevoTorneoPage />} />
        {/* Desde acá, el :id es el de un torneo (una categoría), no el de la convocatoria como
            en Nuevo torneo: cada categoría se cierra y se sortea aparte (decisión 003). */}
        <Route path="/torneos/:id/inscripciones" element={<InscripcionesPage />} />
        <Route path="/torneos/:id/sorteo" element={<SorteoPage />} />
        {/* Sin partido, abre el primero que no tiene resultado (decisión 031). */}
        <Route path="/torneos/:id/resultados/:partidoId?" element={<CargarResultadoPage />} />
        {/* La página del torneo mientras se juega: se llega desde el Sorteo confirmado (decisión 063). */}
        <Route path="/torneos/:id/tablero" element={<TableroPage />} />
        {/* Se llega desde el tablero y desde Cargar resultado, con las finales cargadas (decisión 058). */}
        <Route path="/torneos/:id/cierre" element={<CierrePage />} />
        {/* Pública, sin login: es el enlace que la organización comparte (F09). */}
        <Route path="/c/:slug/ranking" element={<RankingPublicoPage />} />
        {/* Pública, sin login: la ficha del jugador, desde el ranking y las zonas (F17). */}
        <Route path="/c/:slug/jugadores/:id" element={<FichaPublicaPage />} />
        {/* Pública, sin login: los cuadros de un torneo (una categoría), para compartir (F08, F10). */}
        <Route path="/c/:slug/torneos/:id" element={<TorneoPublicoPage />} />
        <Route path="/c/:slug/torneos/:id/inscripcion" element={<InscripcionPage />} />
        <Route path="/c/:slug/inscripciones/:id" element={<PagoPage />} />
        <Route path="/i/:codigo" element={<LinkPersonalPage />} />
        <Route path="/c/:slug/torneos/:id/en-vivo" element={<EnVivoPage />} />
        <Route path="/c/:slug/torneos/:id/cuadros" element={<EnVivoPage pestanaInicial="cuadros" />} />
        <Route path="*" element={<NoEncontradaPage />} />
      </Routes>
    </Suspense>
  );
}
