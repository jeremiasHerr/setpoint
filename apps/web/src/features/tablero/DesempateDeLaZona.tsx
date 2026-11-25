import { explicarDesempate, type FilaDePosiciones } from '@setpoint/shared';

// Debajo de la tabla de una zona, qué separó a los que quedaron iguales (design.md, tablas de zona).
// Una línea por cada par de filas seguidas que no se separó por partidos ganados. Mientras nadie
// jugó, todos están en cero y la tabla sigue la siembra: no hay nada que explicar.
export function DesempateDeLaZona({ filas, usaRanking }: { filas: FilaDePosiciones[]; usaRanking: boolean }) {
  const lineas = filas.flatMap((fila, i) => {
    const siguiente = filas[i + 1];
    if (!siguiente || fila.desempateConElSiguiente === 'partidos_ganados') return [];
    if (fila.partidosJugados === 0 && siguiente.partidosJugados === 0) return [];
    const texto = explicarDesempate(fila, siguiente, usaRanking);
    return texto ? [{ id: fila.jugadorId, texto }] : [];
  });

  return (
    <>
      {lineas.map(({ id, texto }) => (
        <p key={id} className="text-[13px] text-pizarra-500">
          {texto}
        </p>
      ))}
    </>
  );
}
