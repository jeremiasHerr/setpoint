import { EstadoTorneo } from '@prisma/client';
import { nombreCuadroConsuelo, type MiTelefono, type PreferenciaTelefono, type RespuestaMisPartidos } from '@setpoint/shared';
import { perfilDeJugador } from '../../lib/permisos';
import { prisma } from '../../lib/prisma';
import { partidosDelJugador } from './mis-partidos';

const EN_JUEGO = [EstadoTorneo.ZONAS_GENERADAS, EstadoTorneo.GRUPOS_EN_CURSO, EstadoTorneo.ELIMINATORIAS];

const JUGADOR = {
  select: { nombre: true, apellido: true, telefono: true, usuarioId: true, usuario: { select: { muestraTelefonoARivales: true } } },
};

// Si la organización tiene su teléfono y qué eligió sobre mostrarlo (decisión 128).
async function telefonoDelJugador(jugadorId: number, usuarioId: number): Promise<MiTelefono> {
  const [jugador, usuario] = await Promise.all([
    prisma.jugador.findUniqueOrThrow({ where: { id: jugadorId }, select: { telefono: true } }),
    prisma.usuario.findUniqueOrThrow({ where: { id: usuarioId }, select: { muestraTelefonoARivales: true } }),
  ]);
  return { cargado: Boolean(jugador.telefono?.trim()), mostrar: usuario.muestraTelefonoARivales };
}

// Guarda si sus rivales ven su teléfono. Es de la cuenta: vale en todos sus circuitos.
export async function guardarPreferenciaTelefono(slug: string, usuarioId: number, { mostrar }: PreferenciaTelefono) {
  await perfilDeJugador(slug, usuarioId);
  await prisma.usuario.update({ where: { id: usuarioId }, data: { muestraTelefonoARivales: mostrar } });
  return misPartidos(slug, usuarioId);
}

// Los partidos del jugador que pregunta en todos sus torneos en juego (F11): pueden ser dos,
// las eliminatorias de uno y las zonas del siguiente. El teléfono solo sale de los rivales de un
// partido por jugar (decisión 046).
export async function misPartidos(slug: string, usuarioId: number): Promise<RespuestaMisPartidos> {
  const { organizacionId, jugadorId } = await perfilDeJugador(slug, usuarioId);
  const miTelefono = await telefonoDelJugador(jugadorId, usuarioId);

  const organizacion = await prisma.organizacion.findUniqueOrThrow({ where: { id: organizacionId }, select: { nombreCuadroConsuelo: true } });
  const consuelo = nombreCuadroConsuelo(organizacion.nombreCuadroConsuelo);
  const torneos = await prisma.torneo.findMany({
    where: {
      organizacionId,
      sorteoConfirmado: true,
      estado: { in: EN_JUEGO },
      inscripciones: { some: { jugadorId, grupo: { not: null } } },
    },
    orderBy: { id: 'asc' },
    select: { id: true, nombre: true, edicion: true, reprogramacionesPermitidas: true, horasAntelacionReprogramar: true },
  });
  if (torneos.length === 0) return { partidos: null, miTelefono };

  const partidos = await prisma.partido.findMany({
    where: { torneoId: { in: torneos.map((t) => t.id) } },
    orderBy: { id: 'asc' },
    select: {
      id: true,
      torneoId: true,
      fase: true,
      grupo: true,
      cuadro: true,
      ronda: true,
      jugadorAId: true,
      jugadorBId: true,
      ganadorId: true,
      estado: true,
      fechaAcordada: true,
      fechaLimite: true,
      anotadaPorId: true,
      reprogramaciones: true,
      sedeTexto: true,
      club: { select: { nombre: true } },
      cancha: { select: { nombre: true } },
      jugadorA: JUGADOR,
      jugadorB: JUGADOR,
      sets: { select: { gamesA: true, gamesB: true }, orderBy: { numero: 'asc' } },
    },
  });

  const nombres = torneos.map((t) => t.edicion ?? t.nombre);
  const ahora = new Date();
  return {
    miTelefono,
    partidos: {
      torneos: nombres,
      partidos: torneos.flatMap((t, i) =>
        partidosDelJugador(
          jugadorId,
          partidos.filter((p) => p.torneoId === t.id),
          // Con más de un torneo, cada partido dice de cuál es.
          { torneo: torneos.length > 1 ? nombres[i] : undefined, reglas: t, consuelo, ahora },
        ),
      ),
    },
  };
}
