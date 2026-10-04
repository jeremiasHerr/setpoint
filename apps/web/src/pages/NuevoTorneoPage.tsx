import { convocatoriaInicial, JUGADORES_POR_GRUPO, type Circuito, type DatosConvocatoria } from '@setpoint/shared';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Boton } from '../components/Boton';
import { EncabezadoOrganizador } from '../components/EncabezadoOrganizador';
import { leerSesion } from '../features/auth/sesion';
import { useSesionInvalida } from '../features/auth/useSesionInvalida';
import { useCircuito } from '../features/circuito/useCircuito';
import { SeccionBasico } from '../features/torneos/SeccionBasico';
import { SeccionFormato } from '../features/torneos/SeccionFormato';
import { SeccionSistemaJuego } from '../features/torneos/SeccionSistemaJuego';

export function NuevoTorneoPage() {
  const sesion = leerSesion();
  if (!sesion) return <Navigate to="/ingresar" replace />;
  return <CargarCircuito slug={sesion.organizacion.slug} nombre={sesion.organizacion.nombre} />;
}

function CargarCircuito({ slug, nombre }: { slug: string; nombre: string }) {
  const { data, error, refetch } = useCircuito(slug);
  const sesionInvalida = useSesionInvalida(error);

  if (data) return <EditorTorneo circuito={data} />;

  return (
    <div className="min-h-screen bg-white text-negro">
      <EncabezadoOrganizador organizacion={nombre} />
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

function EditorTorneo({ circuito }: { circuito: Circuito }) {
  // Todavía no se guarda: el estado vive acá hasta que se conecte el autoguardado.
  const [datos, setDatos] = useState<DatosConvocatoria>(() => convocatoriaInicial(circuito.categorias));

  function cambiar<K extends keyof DatosConvocatoria>(campo: K, valor: DatosConvocatoria[K]) {
    setDatos((anterior) => ({ ...anterior, [campo]: valor }));
  }

  // El cupo sigue a los grupos solo en las categorías que no lo cambiaron a mano.
  function cambiarGrupos(cantidadGrupos: number) {
    setDatos((anterior) => {
      const cupoAnterior = anterior.cantidadGrupos * JUGADORES_POR_GRUPO;
      const cupo = cantidadGrupos * JUGADORES_POR_GRUPO;
      return {
        ...anterior,
        cantidadGrupos,
        categorias: anterior.categorias.map((c) => (c.cupo === cupoAnterior ? { ...c, cupo } : c)),
      };
    });
  }

  return (
    <div className="min-h-screen bg-white text-negro">
      <EncabezadoOrganizador organizacion={circuito.nombre} estado="borrador" />

      <div className="flex flex-col gap-[7px] px-7 pt-[26px] pb-5">
        <h1 className="text-[30px] font-semibold tracking-[-0.035em]">Nuevo torneo</h1>
        <p className="text-[15px] text-gris-500">
          Los valores vienen de la configuración de tu circuito. Cambiá solo lo que sea distinto esta vez.
        </p>
      </div>

      {/* La columna derecha (resumen y botones) queda vacía hasta que exista el cálculo del formato. */}
      <main className="grid items-start gap-[22px] px-7 pb-7 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-4">
          <SeccionBasico
            nombre={datos.nombre}
            etapa={datos.etapa}
            categorias={datos.categorias}
            usaRanking={circuito.usaRanking}
            etapasDelCircuito={circuito.etapas}
            categoriasDelCircuito={circuito.categorias}
            cupoPorDefecto={datos.cantidadGrupos * JUGADORES_POR_GRUPO}
            alCambiarNombre={(nombre) => cambiar('nombre', nombre)}
            alCambiarEtapa={(etapa) => cambiar('etapa', etapa)}
            alCambiarCategorias={(categorias) => cambiar('categorias', categorias)}
          />
          <SeccionFormato
            cantidadGrupos={datos.cantidadGrupos}
            clasificanPorGrupo={datos.clasificanPorGrupo}
            tieneComplementaria={datos.tieneComplementaria}
            alCambiarGrupos={cambiarGrupos}
            alCambiarClasificados={(clasificanPorGrupo) => cambiar('clasificanPorGrupo', clasificanPorGrupo)}
            alCambiarComplementaria={(tieneComplementaria) => cambiar('tieneComplementaria', tieneComplementaria)}
          />
          <SeccionSistemaJuego
            setsPorPartido={datos.setsPorPartido}
            puntoDeOro={datos.puntoDeOro}
            terceroSet={datos.terceroSet}
            puntosSuperTieBreak={datos.puntosSuperTieBreak}
            alCambiar={(campo, valor) => cambiar(campo, valor)}
          />
        </div>
      </main>
    </div>
  );
}
