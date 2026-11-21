import type { PartidoDeLaFicha } from '@setpoint/shared';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Boton } from '../../components/Boton';
import { colores, fuentes, tabular } from '../../lib/tokens';
import { NOMBRE_DEL_CUADRO, rotuloDeRonda } from './textos';

// Los últimos, y el resto se despliega en el lugar.
const VISIBLES = 5;

// "zona C", "final", o en el cuadro consuelo "semis · Cuadro consuelo".
function donde(partido: PartidoDeLaFicha) {
  if (partido.grupo) return `zona ${partido.grupo}`;
  const ronda = rotuloDeRonda(partido.ronda!, partido.rondas!);
  return partido.cuadro === 'complementaria' ? `${ronda} · ${NOMBRE_DEL_CUADRO.complementaria}` : ronda;
}

// Sus partidos con resultado, del más reciente al más viejo. El punto verde es un partido ganado; el
// W.O. figura aunque no cuente en jugados (decisión 073).
export function PartidosDeLaFicha({ partidos }: { partidos: PartidoDeLaFicha[] }) {
  const [todos, setTodos] = useState(false);
  const hayMas = partidos.length > VISIBLES;
  const visibles = todos ? partidos : partidos.slice(0, VISIBLES);

  return (
    <View style={estilos.seccion}>
      <Text style={estilos.titulo}>{hayMas && !todos ? 'Últimos partidos' : 'Partidos'}</Text>
      {partidos.length === 0 ? (
        <Text style={estilos.vacio}>Todavía no tiene partidos con resultado.</Text>
      ) : (
        visibles.map((partido) => (
          <View
            key={partido.id}
            accessible
            accessibilityLabel={`${partido.gano ? 'Le ganó a' : 'Perdió con'} ${partido.rival.apellido}, ${partido.marcador}`}
            style={estilos.fila}
          >
            <View style={[estilos.punto, partido.gano && estilos.puntoGanado]} />
            <View style={estilos.centro}>
              <Text style={[estilos.rival, partido.gano ? estilos.rivalGanado : estilos.rivalPerdido]} numberOfLines={1}>
                {partido.rival.apellido}
              </Text>
              <Text style={estilos.donde} numberOfLines={1}>
                {partido.torneo} · {donde(partido)}
              </Text>
            </View>
            <Text style={[estilos.marcador, !partido.gano && estilos.marcadorPerdido]}>{partido.marcador}</Text>
          </View>
        ))
      )}
      {hayMas && !todos && <Boton texto={`Ver los ${partidos.length} partidos`} onPress={() => setTodos(true)} />}
    </View>
  );
}

const estilos = StyleSheet.create({
  seccion: { gap: 4 },
  titulo: { fontFamily: fuentes.sans[600], fontSize: 17, letterSpacing: -0.3, color: colores.noche, paddingBottom: 6 },
  vacio: { fontFamily: fuentes.sans[400], fontSize: 15, lineHeight: 22, color: colores.pizarra500 },
  fila: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: colores.lineaSuave,
  },
  punto: { width: 7, height: 7, borderRadius: 4, backgroundColor: colores.linea },
  puntoGanado: { backgroundColor: colores.lonaTexto },
  centro: { flex: 1, gap: 2 },
  rival: { fontSize: 16 },
  rivalGanado: { fontFamily: fuentes.sans[500], color: colores.noche },
  rivalPerdido: { fontFamily: fuentes.sans[400], color: colores.pizarra700 },
  donde: { fontFamily: fuentes.sans[400], fontSize: 12, color: colores.pizarra500 },
  marcador: { fontFamily: fuentes.mono[400], fontSize: 14, color: colores.noche, ...tabular },
  marcadorPerdido: { color: colores.pizarra500 },
});
