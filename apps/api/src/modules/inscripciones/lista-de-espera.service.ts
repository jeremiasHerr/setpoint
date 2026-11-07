import { EstadoInscripcion, type Prisma } from '@prisma/client';
import { enviarCorreo } from '../../lib/correo';
import { prisma } from '../../lib/prisma';
import { ocupanCupo } from '../inscripcion/inscripcion.service';
import { lugarLiberado } from './correos';
import { aQuienesLesToca, lugaresLibres, seAsignanLugares, venceLaReserva } from './lista-de-espera';

const WEB_URL = process.env.WEB_URL ?? 'http://localhost:5173';

export type LugarLiberado = { inscripcionId: number; reservaVence: Date };

// Cuando se libera un lugar (una baja, una reserva que vence, un pago rechazado o un cupo más
// grande), pasa al primero de la lista de espera: queda reservado a su nombre por las horas del
// torneo, desde el aviso (decisión 076). Si esa reserva también vence, la tarea de vencimiento
// vuelve a llamar acá y el lugar pasa al siguiente. Corre en la transacción de quien liberó el
// lugar; los avisos salen después, con avisarLugaresLiberados.
export async function promoverListaDeEspera(
  tx: Prisma.TransactionClient,
  torneoId: number,
  ahora = new Date(),
): Promise<LugarLiberado[]> {
  const torneo = await tx.torneo.findUniqueOrThrow({
    where: { id: torneoId },
    select: { cupo: true, estado: true, sorteoConfirmado: true, tieneListaEspera: true, horasReservaListaEspera: true },
  });
  if (!seAsignanLugares(torneo)) return [];

  const ocupados = await tx.inscripcion.count({ where: { torneoId, ...ocupanCupo(ahora) } });
  const libres = lugaresLibres(torneo.cupo, ocupados);
  if (libres === 0) return [];

  const espera = await tx.inscripcion.findMany({
    where: { torneoId, estado: EstadoInscripcion.EN_LISTA_ESPERA },
    select: { id: true, ordenListaEspera: true, creadoEn: true },
  });
  const reservaVence = venceLaReserva(ahora, torneo.horasReservaListaEspera);
  const liberados: LugarLiberado[] = [];
  for (const { id } of aQuienesLesToca(espera, libres)) {
    // Con el estado en la condición: si otra promoción ya le dio el lugar, no se pisa.
    const { count } = await tx.inscripcion.updateMany({
      where: { id, estado: EstadoInscripcion.EN_LISTA_ESPERA },
      data: { estado: EstadoInscripcion.PENDIENTE_PAGO, reservaVence },
    });
    if (count > 0) liberados.push({ inscripcionId: id, reservaVence });
  }
  return liberados;
}

// El email al que le tocó el lugar, con el link para pagar (docs/pantallas/email/lugar-liberado.html).
// Va a quien se anotó en la lista, o a la cuenta del perfil. Sin email no se avisa: la organización
// lo ve en Reservando y puede escribirle.
export async function avisarLugaresLiberados(liberados: LugarLiberado[]) {
  for (const { inscripcionId, reservaVence } of liberados) {
    const inscripcion = await prisma.inscripcion.findUnique({
      where: { id: inscripcionId },
      include: {
        usuario: { select: { email: true } },
        jugador: { select: { nombre: true, usuario: { select: { email: true } } } },
        torneo: { include: { categoria: { select: { nombre: true } }, organizacion: { select: { nombre: true, slug: true } } } },
      },
    });
    const email = inscripcion?.usuario?.email ?? inscripcion?.jugador.usuario?.email;
    if (!inscripcion || !email) continue;

    const { torneo } = inscripcion;
    const correo = lugarLiberado({
      nombre: inscripcion.jugador.nombre,
      torneo: `${torneo.edicion ?? torneo.nombre} · ${torneo.categoria.nombre}`,
      organizacion: torneo.organizacion.nombre,
      precio: torneo.precio.toNumber(),
      vence: reservaVence,
      link: `${WEB_URL}/c/${torneo.organizacion.slug}/inscripciones/${inscripcion.id}`,
    });
    void enviarCorreo({ para: email, ...correo }).catch((error) => console.error('No se pudo avisar el lugar liberado', error));
  }
}
