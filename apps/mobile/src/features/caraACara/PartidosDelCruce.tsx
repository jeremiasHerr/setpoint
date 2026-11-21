import type { PartidoDelCaraACara } from '@setpoint/shared';
import { StyleSheet, Text, View } from 'react-native';
import { colores, fuentes, tabular } from '../../lib/tokens';

const TEXTO_DEL_ESTADO = { jugada: '', walkover: ' por W.O.', abandono: ' por abandono' } as const;
const RONDAS_DESDE_LA_FINAL = ['final', 'semis', 'cuartos', 'octavos'];

// "zona C", "semis", "semis · cuadro consuelo". Como en la ficha de la web.
function donde(p: PartidoDelCaraACara) {
  if (p.grupo) return `zona ${p.grupo}`;
  const ronda = RONDAS_DESDE_LA_FINAL[p.rondas! - p.ronda!] ?? `ronda ${p.ronda}`;
  return p.cuadro === 'complementaria' ? `${ronda} · cuadro consuelo` : ronda;
}

// Cada enfrentamiento, del más reciente al más viejo. El punto verde marca los que ganó el jugador.
export function PartidosDelCruce({ partidos, apellidoRival }: { partidos: PartidoDelCaraACara[]; apellidoRival: string }) {
  return (
    <View style={estilos.lista}>
      {partidos.map((p, i) => {
        const gane = p.ganador === 'a';
        return (
          <View key={p.id} style={[estilos.fila, i < partidos.length - 1 && estilos.conLinea]}>
            <View style={[estilos.punto, gane && estilos.puntoGanado]} />
            <View style={estilos.texto}>
              <Text style={[estilos.titulo, gane && estilos.ganado]}>
                {gane ? 'Ganaste' : `Ganó ${apellidoRival}`}
                {TEXTO_DEL_ESTADO[p.estado]}
              </Text>
              <Text style={estilos.detalle}>
                {p.torneo} · {donde(p)}
              </Text>
            </View>
            <Text style={[estilos.marcador, gane && estilos.ganado]}>{p.marcador}</Text>
          </View>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  lista: {
    borderWidth: 1,
    backgroundColor: colores.papel,
    borderColor: colores.linea,
    borderRadius: 16,
    overflow: 'hidden',
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 64,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  conLinea: { borderBottomWidth: 1, borderBottomColor: colores.linea },
  punto: { width: 7, height: 7, borderRadius: 999, backgroundColor: colores.linea },
  puntoGanado: { backgroundColor: colores.lonaTexto },
  texto: { flex: 1, gap: 2 },
  titulo: { fontFamily: fuentes.sans[400], fontSize: 17, color: colores.pizarra700 },
  ganado: { fontFamily: fuentes.sans[600], color: colores.noche },
  detalle: { fontFamily: fuentes.sans[400], fontSize: 14, color: colores.pizarra500 },
  marcador: { fontFamily: fuentes.mono[500], fontSize: 14, color: colores.pizarra500, ...tabular },
});
