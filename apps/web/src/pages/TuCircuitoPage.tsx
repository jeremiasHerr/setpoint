import { useState } from 'react';
import { Boton } from '../components/Boton';
import { EncabezadoOrganizador } from '../components/EncabezadoOrganizador';
import { Tarjeta } from '../components/Tarjeta';
import { circuitoEjemplo, jugadoresEnPadronEjemplo, type ConfiguracionCircuito } from '../features/circuito/mockCircuito';
import { ResumenCircuito } from '../features/circuito/ResumenCircuito';
import { SeccionCategorias } from '../features/circuito/SeccionCategorias';
import { SeccionClubes } from '../features/circuito/SeccionClubes';
import { SeccionQuienesSon } from '../features/circuito/SeccionQuienesSon';
import { SeccionRanking } from '../features/circuito/SeccionRanking';
import { TablaPuntos } from '../features/circuito/TablaPuntos';

export function TuCircuitoPage() {
  const [circuito, setCircuito] = useState<ConfiguracionCircuito>(circuitoEjemplo);

  function cambiar<K extends keyof ConfiguracionCircuito>(campo: K, valor: ConfiguracionCircuito[K]) {
    setCircuito((anterior) => ({ ...anterior, [campo]: valor }));
  }

  // Apagar el ranking solo oculta etapas y puntos: quedan guardados y vuelven al reactivarlo.
  const { usaRanking } = circuito;

  return (
    <div className="min-h-screen bg-white text-negro">
      <EncabezadoOrganizador organizacion={circuito.nombre || 'Tu circuito'} estado="configuración · se guarda solo" />

      <div className="flex flex-col gap-[7px] px-7 pt-[26px] pb-5">
        <h1 className="text-[30px] font-semibold tracking-[-0.035em]">Tu circuito</h1>
        <p className="text-[15px] text-gris-500">
          Podés crear un torneo sin configurar nada de esto. El ranking anual es opcional y lo activás cuando quieras.
        </p>
      </div>

      <main className="grid items-start gap-[22px] px-7 pb-7 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-4">
          <SeccionQuienesSon
            nombre={circuito.nombre}
            slug={circuito.slug}
            contacto={circuito.contacto}
            alCambiar={(campo, valor) => cambiar(campo, valor)}
          />
          <SeccionCategorias categorias={circuito.categorias} alCambiar={(categorias) => cambiar('categorias', categorias)} />
          <SeccionRanking
            usaRanking={usaRanking}
            etapas={circuito.etapas}
            alCambiarUsaRanking={(valor) => cambiar('usaRanking', valor)}
            alCambiarEtapas={(etapas) => cambiar('etapas', etapas)}
          />
          {usaRanking && (
            <TablaPuntos
              puntos={circuito.puntos}
              alCambiar={(instancia, puntos) => cambiar('puntos', { ...circuito.puntos, [instancia]: puntos })}
            />
          )}
          <SeccionClubes usaClubes={circuito.usaClubes} alCambiar={(valor) => cambiar('usaClubes', valor)} />
        </div>

        <aside className="flex flex-col gap-4">
          <ResumenCircuito
            usaRanking={usaRanking}
            categorias={circuito.categorias.length}
            etapas={circuito.etapas.length}
            jugadores={jugadoresEnPadronEjemplo}
          />

          {usaRanking && (
            <Tarjeta className="flex flex-col gap-[9px] bg-fondo p-[18px]">
              <h2 className="text-sm font-semibold">¿Solo querés probar?</h2>
              <p className="text-sm leading-normal text-gris-500">
                Apagá el ranking anual y creá un torneo suelto. Al terminar vas a tener la tabla de posiciones de ese torneo, sin
                acumular puntos.
              </p>
            </Tarjeta>
          )}

          {/* Se conectan cuando existan la API y las pantallas de padrón y de nuevo torneo. */}
          <div className="flex flex-col gap-2.5">
            <Boton variante="organizador" className="w-full">
              Guardar y cargar el padrón
            </Boton>
            <Boton className="w-full">Crear un torneo ahora</Boton>
          </div>
        </aside>
      </main>
    </div>
  );
}
