import type { AvanceDelTorneo, Circuito, EstadoTorneo, ResumenConvocatoria, ResumenTorneo } from '@setpoint/shared';
import { nombreDeRonda } from '../resultados/resultado';
import { diaConSemana, diaCorto } from '../torneos/texto';
import type { EtapaDelCircuito, MomentoDeEtapa, TorneosDeInicio } from './tiposDeInicio';

// La etiqueta de arriba de cada tarjeta: a qué pertenece el torneo (decisión 094).
function calendarioDe({ etapa, suelto }: ResumenConvocatoria) {
  if (suelto) return 'torneo suelto';
  return etapa ? etapa.toLocaleLowerCase('es') : 'del circuito';
}

const EN_JUEGO: EstadoTorneo[] = ['zonas_generadas', 'grupos_en_curso', 'eliminatorias'];
const EN_INSCRIPCION: EstadoTorneo[] = ['publicado', 'inscripciones_cerradas'];

// Lo más adelantado entre sus categorías: si una ya se juega, la convocatoria está en juego.
function momentoDe({ estado, torneos }: ResumenConvocatoria): MomentoDeEtapa {
  if (estado === 'borrador') return 'borrador';
  if (torneos.some((t) => EN_JUEGO.includes(t.estado))) return 'en-juego';
  if (torneos.some((t) => EN_INSCRIPCION.includes(t.estado))) return 'inscripcion';
  return 'terminado';
}

// Cada torneo del calendario con su última edición. Las convocatorias vienen de la más nueva a la más vieja.
function etapasDelCircuito(convocatorias: ResumenConvocatoria[], circuito: Circuito): EtapaDelCircuito[] {
  if (!circuito.usaRanking) return [];
  return circuito.etapas.map((nombre) => {
    const ultima = convocatorias.find((c) => !c.suelto && c.etapa === nombre);
    return ultima
      ? { nombre, edicion: ultima.nombre, momento: momentoDe(ultima) }
      : { nombre, edicion: nombre, momento: 'sin-edicion' };
  });
}

// "Primavera 26 · Tercera y Segunda": el borrador es uno solo aunque tenga varias categorías.
function nombreDelBorrador({ nombre, torneos }: ResumenConvocatoria) {
  return `${nombre} · ${torneos.map((t) => t.categoria).join(' y ')}`;
}

function detalleDeFechas({ cierreInscripcion, fechaInicio }: ResumenConvocatoria) {
  const partes = [
    cierreInscripcion && `Cierra el ${diaCorto(cierreInscripcion)}`,
    fechaInicio && `empieza el ${diaCorto(fechaInicio)}`,
  ].filter(Boolean);
  return partes.join(' · ') || 'Sin fechas todavía';
}

// Desde que se publica, una tarjeta por categoría: cada una cierra su inscripción por separado
// y puede estar en un momento distinto que las demás (decisión 026).
function categoriasEn(convocatorias: ResumenConvocatoria[], estados: EstadoTorneo[]) {
  return convocatorias.flatMap((convocatoria) =>
    convocatoria.torneos
      .filter((t) => estados.includes(t.estado))
      .map((torneo) => ({
        convocatoria,
        torneo,
        nombre: `${convocatoria.nombre} · ${torneo.categoria}`,
        calendario: calendarioDe(convocatoria),
      })),
  );
}

// "16 jugadores · zonas hasta el viernes 20": qué se está jugando y hasta cuándo, o qué falta hacer.
function detalleEnJuego({ fechaInicio }: ResumenConvocatoria, { estado, inscriptos }: ResumenTorneo, avance: AvanceDelTorneo) {
  const jugadores = `${inscriptos} jugadores`;
  // Con el sorteo confirmado, sigue en zonas_generadas hasta la fecha de inicio (decisión 029).
  if (estado === 'zonas_generadas' && fechaInicio) return `${jugadores} · empieza el ${diaCorto(fechaInicio)}`;
  if (avance.partidos > 0 && avance.jugados === avance.partidos) {
    return avance.fase === 'zonas' ? `${jugadores} · zonas completas: falta cerrarlas` : `${jugadores} · cuadros completos: falta cerrar el torneo`;
  }
  if (!avance.plazo) return jugadores;

  const tramo = avance.ronda ? nombreDeRonda(avance.ronda.ronda, avance.ronda.rondas) : 'zonas';
  const dia = diaConSemana(avance.plazo.fechaLimite);
  return `${jugadores} · ${tramo} ${avance.plazo.dias < 0 ? `con el plazo vencido el ${dia}` : `hasta el ${dia}`}`;
}

// '2026-09-05' -> '05/09/2026', como en la referencia.
const fechaCompleta = (dia: string) => dia.split('-').reverse().join('/');

// Del último que se cerró al primero. Los que se cerraron sin guardar la fecha van al final.
const porCierre = (a: ResumenTorneo, b: ResumenTorneo) =>
  (b.terminado?.cerradoEl ?? '').localeCompare(a.terminado?.cerradoEl ?? '');

// Arma la pantalla de inicio con lo que sabe la API. De los avisos de «Necesita tu atención»
// solo se calculan los partidos vencidos.
export function aTorneosDeInicio(convocatorias: ResumenConvocatoria[], circuito: Circuito): TorneosDeInicio {
  const borradores = convocatorias.filter((c) => c.estado === 'borrador');
  const abiertas = categoriasEn(convocatorias, ['publicado']);
  // Confirmar el sorteo pasa el torneo a zonas_generadas: con la inscripción cerrada, todavía no se sorteó.
  const paraSortear = categoriasEn(convocatorias, ['inscripciones_cerradas']);
  // Desde el sorteo confirmado hasta el cierre (decisión 080).
  const enJuego = categoriasEn(convocatorias, EN_JUEGO);
  const terminados = categoriasEn(convocatorias, ['finalizado']).sort((a, b) => porCierre(a.torneo, b.torneo));

  return {
    borradores: borradores.map((c) => ({
      id: c.id,
      calendario: calendarioDe(c),
      nombre: nombreDelBorrador(c),
      detalle: detalleDeFechas(c),
    })),
    conInscripcionAbierta: abiertas.map(({ convocatoria, torneo, nombre, calendario }) => ({
      id: torneo.id,
      convocatoriaId: convocatoria.id,
      sePuedeEditar: convocatoria.sePuedeEditar,
      calendario,
      nombre,
      detalle: detalleDeFechas(convocatoria),
      pagaron: torneo.inscriptos,
      cupo: torneo.cupo,
    })),
    paraSortear: paraSortear.map(({ convocatoria, torneo, nombre, calendario }) => ({
      id: torneo.id,
      calendario,
      nombre,
      detalle: convocatoria.fechaInicio
        ? `Inscripción cerrada · empieza el ${diaCorto(convocatoria.fechaInicio)}`
        : 'Inscripción cerrada',
      pagaron: torneo.inscriptos,
      cupo: torneo.cupo,
    })),
    enJuego: enJuego.flatMap(({ convocatoria, torneo, nombre, calendario }) =>
      torneo.avance
        ? [
            {
              id: torneo.id,
              calendario,
              nombre,
              fase: torneo.avance.fase === 'zonas' ? 'Zonas' : 'Cuadros',
              detalle: detalleEnJuego(convocatoria, torneo, torneo.avance),
              partidosJugados: torneo.avance.jugados,
              partidosTotales: torneo.avance.partidos,
              partidosVencidos: torneo.avance.vencidos,
            },
          ]
        : [],
    ),
    terminados: terminados.map(({ torneo, nombre, calendario }) => ({
      id: torneo.id,
      calendario,
      nombre,
      termino: torneo.terminado?.cerradoEl ? fechaCompleta(torneo.terminado.cerradoEl) : null,
      campeon: torneo.terminado?.campeon ? `${torneo.terminado.campeon.nombre} ${torneo.terminado.campeon.apellido}` : null,
      jugadores: torneo.inscriptos,
    })),
    avisos: enJuego.flatMap(({ torneo, nombre }) =>
      torneo.avance && torneo.avance.vencidos > 0
        ? [{ tipo: 'partidos-vencidos' as const, torneoId: torneo.id, categoria: nombre, partidos: torneo.avance.vencidos }]
        : [],
    ),
    organizacion: circuito.nombre,
    etapas: etapasDelCircuito(convocatorias, circuito),
    jugadores: circuito.jugadores,
    categorias: circuito.categorias.length,
    recaudadoEnInscripcionesAbiertas: abiertas.reduce((suma, { convocatoria, torneo }) => suma + torneo.inscriptos * convocatoria.precio, 0),
    usaRanking: circuito.usaRanking,
  };
}
