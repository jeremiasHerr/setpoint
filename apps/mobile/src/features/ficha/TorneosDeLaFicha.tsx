import type { TorneoDeLaFicha } from '@setpoint/shared';
import { StyleSheet, Text, View } from 'react-native';
import { colores, fuentes, tabular } from '../../lib/tokens';
import { cantidadDePuntos, hastaDonde, NOMBRE_DEL_CUADRO } from './textos';

// Debajo de la instancia: en el cuadro consuelo, el nombre del cuadro, y los puntos si los dio.
function debajo(torneo: TorneoDeLaFicha) {
  const partes: string[] = [];
  if (torneo.instancia.tipo === 'cuadro' && torneo.instancia.cuadro === 'complementaria') partes.push(NOMBRE_DEL_CUADRO.complementaria);
  if (torneo.puntos !== null) partes.push(cantidadDePuntos(torneo.puntos));
  return partes.join(' · ');
}

// Cada torneo que jugó, del más reciente al más viejo: hasta dónde llegó y cuántos puntos le dio (decisión 071).
export function TorneosDeLaFicha({ torneos }: { torneos: TorneoDeLaFicha[] }) {
  return (
    <View style={estilos.seccion}>
      <View style={estilos.encabezado}>
        <Text style={estilos.titulo}>Torneos</Text>
        {torneos.length > 0 && <Text style={estilos.cantidad}>{torneos.length}</Text>}
      </View>
      {torneos.length === 0 ? (
        <Text style={estilos.vacio}>Todavía no jugó ningún torneo en el circuito.</Text>
      ) : (
        torneos.map((torneo) => (
          <View key={torneo.torneoId} style={estilos.fila}>
            <View style={estilos.izquierda}>
              <Text style={estilos.nombre} numberOfLines={1}>
                {torneo.nombre}
              </Text>
              <Text style={estilos.chico}>{torneo.categoria}</Text>
            </View>
            <View style={estilos.derecha}>
              <Text style={estilos.instancia}>{hastaDonde(torneo.instancia)}</Text>
              {debajo(torneo) !== '' && <Text style={[estilos.chico, estilos.numeros]}>{debajo(torneo)}</Text>}
            </View>
          </View>
        ))
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  seccion: { gap: 4 },
  encabezado: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingBottom: 6 },
  titulo: { fontFamily: fuentes.sans[600], fontSize: 17, letterSpacing: -0.3, color: colores.noche },
  cantidad: { fontFamily: fuentes.mono[400], fontSize: 12, color: colores.pizarra400, ...tabular },
  vacio: { fontFamily: fuentes.sans[400], fontSize: 15, lineHeight: 22, color: colores.pizarra500 },
  fila: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colores.lineaSuave,
  },
  izquierda: { flex: 1, gap: 2 },
  derecha: { alignItems: 'flex-end', gap: 2 },
  nombre: { fontFamily: fuentes.sans[500], fontSize: 16, color: colores.noche },
  instancia: { fontFamily: fuentes.sans[400], fontSize: 15, color: colores.noche },
  chico: { fontFamily: fuentes.sans[400], fontSize: 12, color: colores.pizarra500 },
  numeros: { ...tabular },
});
