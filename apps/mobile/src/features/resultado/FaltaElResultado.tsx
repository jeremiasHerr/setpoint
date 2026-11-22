import type { PartidoDelJugador } from '@setpoint/shared';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Boton } from '../../components/Boton';
import { diaYHora } from '../../lib/fechas';
import { colores, fuentes, tabular } from '../../lib/tokens';

// Qué pasa con el resultado, en una línea.
function estado(partido: PartidoDelJugador) {
  const propuesta = partido.resultadoPropuesto;
  const rival = partido.rival!.nombre;
  if (propuesta?.estado === 'pendiente') return `Le mandaste ${propuesta.marcador}. Falta que ${rival} lo confirme.`;
  if (propuesta?.estado === 'rechazado') {
    return propuesta.cargadoPor === 'yo'
      ? `${rival} dijo que ${propuesta.marcador} no fue así. Hablalo y cargalo de nuevo.`
      : `Dijiste que ${propuesta.marcador} no fue así. Cualquiera de los dos lo puede cargar de nuevo.`;
  }
  return partido.fechaAcordada ? `Jugaban el ${diaYHora(partido.fechaAcordada)}. ¿Cómo terminó?` : '¿Cómo terminó?';
}

function textoDelBoton(partido: PartidoDelJugador) {
  const propuesta = partido.resultadoPropuesto;
  if (propuesta?.estado === 'pendiente') return 'Cambiar el resultado';
  if (propuesta?.estado === 'rechazado') return 'Cargarlo de nuevo';
  return 'Cargar el resultado';
}

// Un partido que ya se jugó, o que tiene un resultado en camino, y todavía no cuenta (decisión 127).
export function FaltaElResultado({ partido }: { partido: PartidoDelJugador }) {
  const { rival } = partido;
  if (!rival) return null;

  return (
    <View style={estilos.tarjeta}>
      <View style={estilos.arriba}>
        <Text style={estilos.rival} numberOfLines={1}>
          {rival.nombre} {rival.apellido}
        </Text>
        <Text style={estilos.instancia}>{partido.instancia}</Text>
      </View>
      <Text style={estilos.texto}>{estado(partido)}</Text>
      {partido.puedeCargarResultado && (
        <Boton
          texto={textoDelBoton(partido)}
          variante={partido.resultadoPropuesto?.estado === 'pendiente' ? 'secundario' : 'organizador'}
          onPress={() => router.push({ pathname: '/partido/[id]/resultado', params: { id: String(partido.id) } })}
        />
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    borderWidth: 1,
    backgroundColor: colores.papel,
    borderColor: colores.linea,
    borderRadius: 16,
    padding: 18,
    gap: 14,
  },
  arriba: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 },
  rival: { flexShrink: 1, fontFamily: fuentes.sans[600], fontSize: 20, letterSpacing: -0.5, color: colores.noche },
  instancia: { fontFamily: fuentes.mono[500], fontSize: 13, color: colores.pizarra500, ...tabular },
  texto: { fontFamily: fuentes.sans[400], fontSize: 16, lineHeight: 22, color: colores.pizarra700 },
});
