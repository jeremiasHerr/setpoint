// El control entre hojas de un lote (decisión 012): un jugador está en una sola categoría, así que
// si aparece en dos hojas va a revisión en las dos. Lógica pura: recibe las propuestas ya auditadas.
import type { FilaExtraida } from '@setpoint/shared';
import type { Problema } from './auditar';

export type HojaParaControlar = { id: number; categoria: string; propuesta: FilaExtraida[] };

// Sin tildes ni mayúsculas: "Martín Sanhueza" y "MARTIN SANHUEZA" son el mismo.
const normalizar = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

// Quién es cada fila: el jugador del padrón con el que coincide, o su nombre si es nuevo.
const identidad = (fila: FilaExtraida) =>
  fila.coincideCon !== null ? `padron:${fila.coincideCon}` : `nombre:${normalizar(`${fila.nombre} ${fila.apellido}`)}`;

// Los problemas nuevos de cada hoja, por id de hoja.
export function controlarEntreHojas(hojas: HojaParaControlar[]): Map<number, Problema[]> {
  const donde = new Map<string, { hoja: HojaParaControlar; fila: number }[]>();
  for (const hoja of hojas) {
    for (const fila of hoja.propuesta) {
      const clave = identidad(fila);
      donde.set(clave, [...(donde.get(clave) ?? []), { hoja, fila: fila.fila }]);
    }
  }

  const problemas = new Map<number, Problema[]>();
  for (const apariciones of donde.values()) {
    if (new Set(apariciones.map((a) => a.hoja.id)).size < 2) continue;
    for (const { hoja, fila } of apariciones) {
      const otras = apariciones
        .filter((a) => a.hoja.id !== hoja.id)
        .map((a) => `${a.hoja.categoria} (fila ${a.fila})`)
        .join(', ');
      const delaHoja = problemas.get(hoja.id) ?? [];
      delaHoja.push({ fila, detalle: `Fila ${fila}: también está en ${otras}. Un jugador va en una sola categoría` });
      problemas.set(hoja.id, delaHoja);
    }
  }
  return problemas;
}
