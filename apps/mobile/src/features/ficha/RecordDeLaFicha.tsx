import type { RecordDelJugador } from '@setpoint/shared';
import { StyleSheet, Text, View } from 'react-native';
import { colores, fuentes, radios, tabular } from '../../lib/tokens';

// Jugados, ganados y perdidos. El W.O. no cuenta, porque no se jugó (decisión 073): se aclara para
// que no parezca que faltan partidos en la lista.
export function RecordDeLaFicha({ record }: { record: RecordDelJugador }) {
  const numeros = [
    { valor: record.jugados, rotulo: 'jugados' },
    { valor: record.ganados, rotulo: 'ganados' },
    { valor: record.perdidos, rotulo: 'perdidos' },
  ];

  return (
    <View style={estilos.bloque}>
      <View style={estilos.fila}>
        {numeros.map(({ valor, rotulo }) => (
          <View key={rotulo} accessible accessibilityLabel={`${valor} ${rotulo}`} style={estilos.tarjeta}>
            <Text style={estilos.valor}>{valor}</Text>
            <Text style={estilos.rotulo}>{rotulo}</Text>
          </View>
        ))}
      </View>
      {record.walkovers > 0 && (
        <Text style={estilos.nota}>
          {record.walkovers === 1 ? 'Sin contar un W.O., que no se jugó.' : `Sin contar ${record.walkovers} W.O., que no se jugaron.`}
        </Text>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  bloque: { gap: 8 },
  fila: { flexDirection: 'row', gap: 8 },
  tarjeta: {
    flex: 1,
    gap: 3,
    padding: 12,
    backgroundColor: colores.papel,
    borderWidth: 1,
    borderColor: colores.linea,
    borderRadius: radios.tarjeta,
  },
  valor: { fontFamily: fuentes.mono[500], fontSize: 24, color: colores.noche, ...tabular },
  rotulo: { fontFamily: fuentes.sans[400], fontSize: 13, color: colores.pizarra500 },
  nota: { fontFamily: fuentes.sans[400], fontSize: 13, lineHeight: 18, color: colores.pizarra500 },
});
