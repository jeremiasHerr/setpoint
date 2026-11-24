import { cortaDe, type PartidoDelCaraACara } from '@setpoint/shared';
import { StyleSheet, Text, View } from 'react-native';
import { colores, fuentes, tabular } from '../../lib/tokens';
import { rotuloDeRonda } from '../ficha/textos';

const TEXTO_DEL_ESTADO = { jugada: '', walkover: ' por W.O.', abandono: ' por abandono' } as const;

// "zona C", "semis", o en el cuadro consuelo "semis · Complementaria", con el nombre que le da la
// organización (07 §1.2). Como en la ficha de la web.
function donde(p: PartidoDelCaraACara, consuelo: string) {
  if (p.grupo) return `zona ${p.grupo}`;
  const ronda = rotuloDeRonda(p.ronda!, p.rondas!);
  return p.cuadro === 'complementaria' ? `${ronda} · ${consuelo}` : ronda;
}

// apellidoJugador: null cuando el primero es quien tiene la sesión ("Ganaste").
type Props = { partidos: PartidoDelCaraACara[]; apellidoJugador: string | null; apellidoRival: string; consuelo: string };

// Cada enfrentamiento, del más reciente al más viejo. El punto verde marca los que ganó el primero.
export function PartidosDelCruce({ partidos, apellidoJugador, apellidoRival, consuelo }: Props) {
  return (
    <View style={estilos.lista}>
      {partidos.map((p, i) => {
        const gane = p.ganador === 'a';
        return (
          <View key={p.id} style={[estilos.fila, i < partidos.length - 1 && estilos.conLinea]}>
            <View style={[estilos.punto, gane && estilos.puntoGanado]} />
            <View style={estilos.texto}>
              <Text style={[estilos.titulo, gane && estilos.ganado]}>
                {gane ? (apellidoJugador === null ? 'Ganaste' : `Ganó ${apellidoJugador}`) : `Ganó ${apellidoRival}`}
                {TEXTO_DEL_ESTADO[p.estado]}
              </Text>
              <Text style={estilos.detalle}>
                {p.torneo} · {donde(p, consuelo)}
                {p.superficie && ` · ${cortaDe(p.superficie)}`}
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
