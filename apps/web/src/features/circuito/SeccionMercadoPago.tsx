import { VUELTAS_DE_MERCADOPAGO, type CuentaMercadoPago, type VueltaDeMercadoPago } from '@setpoint/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Aviso } from '../../components/Aviso';
import { Boton } from '../../components/Boton';
import { Confirmacion } from '../../components/Confirmacion';
import { Tarjeta } from '../../components/Tarjeta';
import { ErrorApi } from '../../lib/api';
import { conectarMercadoPago, desconectarMercadoPago } from './api';

const fecha = new Intl.DateTimeFormat('es-AR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'America/Argentina/Buenos_Aires',
});

// Lo que dice la sección cuando MercadoPago devuelve a la organización sin haber conectado nada.
const VUELTAS_CON_ERROR: Record<Exclude<VueltaDeMercadoPago, 'conectada'>, string> = {
  cancelada: 'No autorizaste a Setpoint en Mercado Pago, así que no se conectó ninguna cuenta.',
  vencida: 'El intento de conexión venció. Probá de nuevo.',
  'otra-cuenta-con-pagos': 'Hay jugadores pagando con la cuenta que tenías conectada. Cuando terminen, probá de nuevo.',
  error: 'Mercado Pago no confirmó la conexión. Probá de nuevo en unos minutos.',
};

// MercadoPago devuelve a Tu circuito con ?mercadopago=. Se lee una vez y se saca de la URL, para que
// recargar la página no lo vuelva a mostrar.
function useVueltaDeMercadoPago() {
  const [parametros, setParametros] = useSearchParams();
  const [vuelta] = useState(() => VUELTAS_DE_MERCADOPAGO.find((v) => v === parametros.get('mercadopago')) ?? null);

  useEffect(() => {
    if (!parametros.has('mercadopago')) return;
    const sinVuelta = new URLSearchParams(parametros);
    sinVuelta.delete('mercadopago');
    setParametros(sinVuelta, { replace: true });
    // La sección está más abajo que el principio de la página: que quede a la vista.
    document.getElementById('mercadopago')?.scrollIntoView({ block: 'center' });
    // Solo al montarse: es la vuelta de MercadoPago, no un cambio de la página.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return vuelta;
}

type Props = {
  slug: string;
  inicial: CuentaMercadoPago;
};

// La cuenta de MercadoPago con la que cobra la organización (decisión 137). No es parte del
// autoguardado: conectar y desconectar son acciones, con sus propias rutas.
export function SeccionMercadoPago({ slug, inicial }: Props) {
  const queryClient = useQueryClient();
  const [cuenta, setCuenta] = useState(inicial);
  const [confirmando, setConfirmando] = useState(false);
  const vuelta = useVueltaDeMercadoPago();

  const conectar = useMutation({
    mutationFn: () => conectarMercadoPago(slug),
    // La página se va a MercadoPago: el botón sigue diciendo que la abre hasta que se va.
    onSuccess: ({ url }) => window.location.assign(url),
  });
  const desconectar = useMutation({
    mutationFn: () => desconectarMercadoPago(slug),
    onSuccess: (nueva) => {
      setCuenta(nueva);
      setConfirmando(false);
      void queryClient.invalidateQueries({ queryKey: ['circuito', slug] });
    },
  });

  return (
    <Tarjeta id="mercadopago" className="flex flex-col gap-4 p-5">
      <div className="flex flex-col gap-[5px]">
        <h2 className="flex flex-wrap items-center gap-x-2 text-[17px] font-semibold">
          Cobrar con <LogoMercadoPago />
        </h2>
        <p className="max-w-[560px] text-sm leading-normal text-pizarra-500">{descripcion(cuenta)}</p>
      </div>

      {!cuenta.pagoSimulado && cuenta.conectada && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-linea px-3.5 py-3">
          <div className="flex min-w-0 items-start gap-3">
            <Tilde />
            <div className="flex min-w-0 flex-col gap-0.5">
              {/* Un email largo se parte en cualquier lado: entero en una línea ensanchaba la página en el celular. */}
              <p className="text-[15px] font-medium [overflow-wrap:anywhere]">{cuenta.conectada.nombre ?? 'Tu cuenta de Mercado Pago'}</p>
              <p className="text-sm text-pizarra-500">Conectada el {fecha.format(new Date(cuenta.conectada.desde))}</p>
            </div>
          </div>
          <Boton onClick={() => setConfirmando(true)}>Desconectar</Boton>
        </div>
      )}

      {!cuenta.pagoSimulado && !cuenta.conectada && cuenta.disponible && (
        <>
          {/* MercadoPago muestra permisos más amplios de los que Setpoint usa: no tiene otros más chicos.
              Se dice antes de mandarla ahí, que es cuando decide si confía. */}
          <p className="max-w-[640px] rounded-control border border-linea px-3.5 py-3 text-sm leading-normal text-pizarra-700">
            <strong className="font-semibold text-noche">Qué hace Setpoint con tu cuenta.</strong> Crea el cobro de cada inscripción y
            consulta si se pagó, nada más. Mercado Pago te va a mostrar permisos más amplios porque no tiene otros más chicos: Setpoint no
            hace devoluciones, no mueve tu plata y no consulta tus otros movimientos. Le podés sacar el permiso desde tu cuenta de
            Mercado Pago cuando quieras.
          </p>
          <Boton variante="organizador" className="self-start" disabled={conectar.isPending} onClick={() => conectar.mutate()}>
            {conectar.isPending ? 'Abriendo Mercado Pago…' : 'Conectar Mercado Pago'}
          </Boton>
        </>
      )}

      {conectar.isError && <Aviso>No pudimos abrir Mercado Pago. Probá de nuevo en unos minutos.</Aviso>}
      {vuelta === 'conectada' && cuenta.conectada && (
        <p role="status" className="text-sm font-medium text-noche">
          Listo: tu Mercado Pago quedó conectado.
        </p>
      )}
      {vuelta && vuelta !== 'conectada' && <Aviso>{VUELTAS_CON_ERROR[vuelta]}</Aviso>}

      <Confirmacion
        abierta={confirmando}
        titulo="¿Desconectar tu Mercado Pago?"
        consecuencias={[
          'Los torneos con la inscripción abierta no van a poder cobrar hasta que conectes una cuenta.',
          'Lo que ya cobraste queda en tu cuenta de Mercado Pago.',
        ]}
        accion="Desconectar"
        accionEnCurso="Desconectando…"
        enCurso={desconectar.isPending}
        error={desconectar.error && mensajeAlDesconectar(desconectar.error)}
        alCancelar={() => {
          setConfirmando(false);
          desconectar.reset();
        }}
        alConfirmar={() => desconectar.mutate()}
      />
    </Tarjeta>
  );
}

// El logo oficial, del kit de marca de Mercado Pago (versión RGB, para web), en public/. El kit no
// permite editar el SVG, que trae aire transparente alrededor del dibujo: en lugar de recortarlo, la
// caja muestra solo el dibujo y el resto queda afuera. En el título reemplaza a la palabra, así que el
// texto alternativo la dice.
function LogoMercadoPago() {
  return (
    // A 56 px de alto, el dibujo mide 103,7 × 26,2 y empieza a 17,2 de la izquierda y 14,9 de arriba
    // (medido con getBBox sobre el archivo).
    <span className="block h-[27px] w-[104px] shrink-0 overflow-hidden">
      <img src="/mercadopago.svg" alt="Mercado Pago" className="-ml-[17.2px] -mt-[14.9px] h-14 w-auto max-w-none" />
    </span>
  );
}

// La cuenta quedó conectada: el mismo tilde lona de los primeros pasos del inicio. La lona es lo que
// se cobra (design.md). Lo dice también "Conectada el…", así que el lector de pantalla no lo repite.
function Tilde() {
  return (
    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-lona-texto text-white" aria-hidden="true">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </span>
  );
}

function descripcion(cuenta: CuentaMercadoPago) {
  if (cuenta.pagoSimulado) {
    return 'En esta instalación el pago es simulado: al inscribirse, el jugador elige si se aprueba o se rechaza, y no se cobra nada.';
  }
  if (cuenta.conectada) return `La plata de cada inscripción te llega directo a esta cuenta, sin pasar por Setpoint. ${COMISION}`;
  if (!cuenta.disponible) return 'Esta instalación no tiene Mercado Pago configurado, así que por ahora solo podés publicar torneos gratis.';
  return `Conectá tu cuenta y la plata de cada inscripción te llega directo, sin pasar por Setpoint. ${COMISION} Sin una cuenta conectada, solo podés publicar torneos gratis.`;
}

// No es una transferencia: Mercado Pago descuenta su comisión y libera la plata en el plazo que elige
// la cuenta. Se dice antes, para que la organización no se entere al ver el primer cobro.
const COMISION = 'Mercado Pago cobra su comisión por cada pago, y la plata se acredita en el plazo que elijas en tu cuenta.';

function mensajeAlDesconectar(error: Error) {
  if (error instanceof ErrorApi && error.codigo === 'PAGOS_EN_CURSO') {
    return 'Hay jugadores pagando en este momento. Cuando terminen, probá de nuevo.';
  }
  return 'No pudimos desconectarla. Probá de nuevo.';
}
