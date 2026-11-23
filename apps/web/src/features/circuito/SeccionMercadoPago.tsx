import { VUELTAS_DE_MERCADOPAGO, type CuentaMercadoPago, type VueltaDeMercadoPago } from '@setpoint/shared';
import { useMutation } from '@tanstack/react-query';
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
  cancelada: 'No autorizaste a Setpoint en MercadoPago, así que no se conectó ninguna cuenta.',
  vencida: 'El intento de conexión venció. Probá de nuevo.',
  'otra-cuenta-con-pagos': 'Hay jugadores pagando con la cuenta que tenías conectada. Cuando terminen, probá de nuevo.',
  error: 'MercadoPago no confirmó la conexión. Probá de nuevo en unos minutos.',
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
    },
  });

  return (
    <Tarjeta id="mercadopago" className="flex flex-col gap-4 p-5">
      <div className="flex flex-col gap-[5px]">
        <h2 className="text-[17px] font-semibold">Cobrar con MercadoPago</h2>
        <p className="max-w-[560px] text-sm leading-normal text-pizarra-500">{descripcion(cuenta)}</p>
      </div>

      {!cuenta.pagoSimulado && cuenta.conectada && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-linea px-3.5 py-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            {/* Un email largo se parte en cualquier lado: entero en una línea ensanchaba la página en el celular. */}
            <p className="text-[15px] font-medium [overflow-wrap:anywhere]">{cuenta.conectada.nombre ?? 'Tu cuenta de MercadoPago'}</p>
            <p className="text-sm text-pizarra-500">Conectada el {fecha.format(new Date(cuenta.conectada.desde))}</p>
          </div>
          <Boton onClick={() => setConfirmando(true)}>Desconectar</Boton>
        </div>
      )}

      {!cuenta.pagoSimulado && !cuenta.conectada && cuenta.disponible && (
        <Boton variante="organizador" className="self-start" disabled={conectar.isPending} onClick={() => conectar.mutate()}>
          {conectar.isPending ? 'Abriendo MercadoPago…' : 'Conectar MercadoPago'}
        </Boton>
      )}

      {conectar.isError && <Aviso>No pudimos abrir MercadoPago. Probá de nuevo en unos minutos.</Aviso>}
      {vuelta === 'conectada' && cuenta.conectada && (
        <p role="status" className="text-sm font-medium text-noche">
          Listo: tu MercadoPago quedó conectado.
        </p>
      )}
      {vuelta && vuelta !== 'conectada' && <Aviso>{VUELTAS_CON_ERROR[vuelta]}</Aviso>}

      <Confirmacion
        abierta={confirmando}
        titulo="¿Desconectar tu MercadoPago?"
        consecuencias={[
          'Los torneos con la inscripción abierta no van a poder cobrar hasta que conectes una cuenta.',
          'Lo que ya cobraste queda en tu cuenta de MercadoPago.',
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

function descripcion(cuenta: CuentaMercadoPago) {
  if (cuenta.pagoSimulado) {
    return 'En esta instalación el pago es simulado: al inscribirse, el jugador elige si se aprueba o se rechaza, y no se cobra nada.';
  }
  if (cuenta.conectada) return 'La plata de cada inscripción te llega directo a esta cuenta, sin pasar por Setpoint.';
  if (!cuenta.disponible) return 'Esta instalación no tiene MercadoPago configurado, así que por ahora solo podés publicar torneos gratis.';
  return 'Conectá tu cuenta y la plata de cada inscripción te llega directo, sin pasar por Setpoint. Sin una cuenta conectada, solo podés publicar torneos gratis.';
}

function mensajeAlDesconectar(error: Error) {
  if (error instanceof ErrorApi && error.codigo === 'PAGOS_EN_CURSO') {
    return 'Hay jugadores pagando en este momento. Cuando terminen, probá de nuevo.';
  }
  return 'No pudimos desconectarla. Probá de nuevo.';
}
