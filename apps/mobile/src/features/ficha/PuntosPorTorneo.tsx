import type { RankingDeLaFicha } from '@setpoint/shared';
import { StyleSheet, Text, View } from 'react-native';
import { colores, fuentes, tabular } from '../../lib/tokens';

const ALTO_MAXIMO = 100;
const ALTO_MINIMO = 2;

// Una barra por torneo del calendario, con los puntos vigentes de cada casillero; la mejor va en lona.
export function PuntosPorTorneo({ ranking }: { ranking: RankingDeLaFicha }) {
  const { torneosDelCalendario, casilleros } = ranking;
  if (torneosDelCalendario.length === 0) return null;

  const barras = torneosDelCalendario.map((torneo) => ({
    torneo,
    puntos: casilleros.find((c) => c.etapaId === torneo.id)?.puntos ?? 0,
  }));
  const maximo = Math.max(0, ...barras.map((b) => b.puntos));
  // Con un empate en el mejor, el primero del calendario.
  const mejor = maximo > 0 ? barras.find((b) => b.puntos === maximo) : undefined;
  const alto = (puntos: number) => (maximo > 0 ? Math.max(ALTO_MINIMO, Math.round((puntos / maximo) * ALTO_MAXIMO)) : ALTO_MINIMO);

  return (
    <View style={estilos.seccion}>
      <Text style={estilos.titulo}>Puntos por torneo del calendario</Text>
      <View style={estilos.barras}>
        {barras.map(({ torneo, puntos }) => {
          const esLaMejor = mejor?.torneo.id === torneo.id;
          return (
            <View key={torneo.id} accessible accessibilityLabel={`${torneo.nombre}: ${puntos} puntos`} style={estilos.columna}>
              <Text style={[estilos.puntos, esLaMejor && estilos.puntosMejor, puntos === 0 && estilos.puntosCero]}>{puntos}</Text>
              <View style={[estilos.barra, { height: alto(puntos) }, esLaMejor && estilos.barraMejor]} />
              <Text style={[estilos.rotulo, esLaMejor && estilos.rotuloMejor]}>{torneo.nombre.slice(0, 3).toLowerCase()}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  seccion: { gap: 12 },
  titulo: { fontFamily: fuentes.sans[600], fontSize: 17, letterSpacing: -0.3, color: colores.noche },
  barras: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 148 },
  columna: { flex: 1, alignItems: 'center', gap: 7 },
  puntos: { fontFamily: fuentes.mono[500], fontSize: 13, color: colores.noche, ...tabular },
  puntosMejor: { fontFamily: fuentes.mono[600] },
  puntosCero: { color: colores.pizarra450 },
  barra: { width: '100%', backgroundColor: colores.linea, borderTopLeftRadius: 5, borderTopRightRadius: 5 },
  barraMejor: { backgroundColor: colores.lona },
  rotulo: { fontFamily: fuentes.mono[400], fontSize: 11, color: colores.pizarra500, ...tabular },
  rotuloMejor: { color: colores.noche },
});
