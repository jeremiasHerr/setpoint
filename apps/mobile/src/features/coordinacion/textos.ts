// Fechas y frases de Anotar la fecha (F14). Lógica pura, sin React.
import type { AccionDeFecha, BloqueoDeFecha, CoordinacionDelPartido } from '@setpoint/shared';

const DIAS_CORTOS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const DIAS_LARGOS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

// Los días llegan de la API como 'AAAA-MM-DD', de Argentina. Se leen en UTC para que el celular no
// los corra con su zona horaria.
const fecha = (dia: string) => new Date(`${dia}T00:00:00.000Z`);

// { semana: 'sáb', numero: 14 }, para las tarjetas de días.
export function partesDelDia(dia: string) {
  const f = fecha(dia);
  return { semana: DIAS_CORTOS[f.getUTCDay()], numero: f.getUTCDate() };
}

// "domingo 15".
export function diaLargo(dia: string) {
  const f = fecha(dia);
  return `${DIAS_LARGOS[f.getUTCDay()]} ${f.getUTCDate()}`;
}

// Los horarios para elegir: cada media hora de 8:00 a 22:30. Si el día es hoy, solo los que
// todavía no pasaron. `hoy` y `ahora` son los del celular.
export function horasDisponibles(dia: string, ahora = new Date()) {
  const horas: string[] = [];
  for (let minutos = 8 * 60; minutos <= 22 * 60 + 30; minutos += 30) {
    horas.push(`${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`);
  }
  const hoy = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`;
  if (dia !== hoy) return horas;
  const ahoraEnMinutos = ahora.getHours() * 60 + ahora.getMinutes();
  return horas.filter((h) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3)) > ahoraEnMinutos);
}

const TITULOS: Record<AccionDeFecha, string> = {
  anotar: 'Anotar la fecha',
  cambiar: 'Cambiar la fecha',
  reprogramar: 'Reprogramar',
};

export const tituloDeLaPantalla = (accion: AccionDeFecha | null) => (accion ? TITULOS[accion] : 'La fecha del partido');

export function textoDelBoton(accion: AccionDeFecha, rival: string) {
  return { anotar: 'Anotar', cambiar: 'Cambiar', reprogramar: 'Reprogramar' }[accion] + ` y avisarle a ${rival}`;
}

// Por qué la confirmación importa: de eso depende quién da W.O. si no se juega (nota de diseño de
// la referencia).
export function textoDeLaConfirmacion(coordinacion: CoordinacionDelPartido, rival: string) {
  const base = `${rival} recibe un aviso y confirma con un toque. Recién ahí queda agendado para los dos.`;
  if (coordinacion.accion !== 'reprogramar') return base;
  const quedan = coordinacion.reprogramacionesRestantes - 1;
  const despues =
    quedan === 0 ? 'Después de esta ya no vas a poder reprogramarlo.' : `Después de esta te ${quedan === 1 ? 'queda 1' : `quedan ${quedan}`}.`;
  return `${base} ${despues}`;
}

// Cuando no se puede anotar desde la app, qué pasa y qué hacer. Siempre queda la organización.
export function textoDelBloqueo(bloqueo: BloqueoDeFecha, horas: number) {
  switch (bloqueo) {
    case 'PLAZO_VENCIDO':
      return 'Venció el plazo para jugar este partido. Lo resuelve la organización.';
    case 'SIN_REPROGRAMACIONES':
      return 'Ya usaste la reprogramación de este partido. Si no pueden jugar ese día, hablalo con la organización.';
    case 'SIN_ANTELACION':
      return `Faltan menos de ${horas} horas para el partido y ya no se puede reprogramar. Si no podés jugar, avisale a la organización.`;
    case 'SIN_RIVAL':
      return 'Todavía no se sabe contra quién jugás: falta el ganador del partido anterior.';
    case 'PARTIDO_TERMINADO':
      return 'Este partido ya tiene resultado.';
  }
}

// Ayuda debajo de la sede, según quién la elige.
export function ayudaDeLaSede(coordinacion: CoordinacionDelPartido) {
  if (coordinacion.sede.modo === 'designada') {
    return coordinacion.sede.nombre
      ? 'En esta instancia la sede la pone la organización.'
      : 'En esta instancia la sede la pone la organización, y todavía no la eligió.';
  }
  return 'En zona eligen ustedes. En eliminatorias la sede la pone la organización.';
}

// "El plazo de la zona termina el domingo 15."
export function textoDelPlazo(coordinacion: CoordinacionDelPartido) {
  if (!coordinacion.ultimoDia) return null;
  const de = coordinacion.instancia.startsWith('zona') ? 'de la zona' : 'de esta ronda';
  return `El plazo ${de} termina el ${diaLargo(coordinacion.ultimoDia)}.`;
}
