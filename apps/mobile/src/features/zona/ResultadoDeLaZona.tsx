import type { MiZona } from '@setpoint/shared';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colores, fuentes, medidas, radios, tabular } from '../../lib/tokens';

// Con las zonas cerradas, lo primero de Mi zona: a qué cuadro pasó el jugador y cómo verlo. Los
// cuadros se abren en la app, en el suyo y en la ronda donde juega (decisión 136).
export function ResultadoDeLaZona({ zona, jugadorId }: { zona: MiZona; jugadorId: number }) {
  const fila = zona.filas.find((f) => f.jugadorId === jugadorId);
  if (!fila) return null;

  const titulo =
    fila.destino === 'campeonato'
      ? 'Clasificaste a Campeonato'
      : fila.destino === 'complementaria'
        ? `Pasaste al ${zona.nombreCuadroConsuelo.toLowerCase()}`
        : 'Terminaste la zona';

  return (
    <View style={estilos.tarjeta}>
      <Text style={estilos.rotulo}>zona {zona.grupo} · terminada</Text>
      <Text style={estilos.titulo}>{titulo}</Text>
      <Text style={estilos.detalle}>
        Saliste <Text style={estilos.puesto}>{fila.posicion}º</Text> en la zona.
        {fila.destino === null && ` Sin ${zona.nombreCuadroConsuelo.toLowerCase()}, tu torneo terminó acá.`}
      </Text>
      <Pressable
        accessibilityRole="link"
        onPress={() =>
          router.push({
            pathname: '/cuadros/[id]',
            params: { id: String(zona.torneoId), ...(fila.destino ? { cuadro: fila.destino } : {}) },
          })
        }
        style={({ pressed }) => [estilos.boton, pressed && estilos.apretado]}
      >
        <Text style={estilos.textoBoton}>{fila.destino ? 'Ver el cuadro' : 'Ver los cuadros'}</Text>
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.noche,
    borderRadius: radios.superficie,
    paddingTop: 22,
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  rotulo: {
    fontFamily: fuentes.mono[500],
    fontSize: 15,
    color: colores.pizarra400,
    ...tabular,
  },
  titulo: {
    fontFamily: fuentes.sans[600],
    fontSize: 30,
    lineHeight: 33,
    letterSpacing: -1,
    color: colores.blanco,
  },
  detalle: {
    fontFamily: fuentes.sans[400],
    fontSize: 17,
    lineHeight: 24,
    color: colores.pizarra400,
  },
  puesto: {
    fontFamily: fuentes.mono[500],
    color: colores.blanco,
    ...tabular,
  },
  // Sobre la tarjeta noche, el botón principal va dado vuelta: papel con el texto noche (decisión 115).
  boton: {
    marginTop: 6,
    height: medidas.toque,
    borderRadius: 12,
    backgroundColor: colores.papel,
    alignItems: 'center',
    justifyContent: 'center',
  },
  apretado: {
    opacity: 0.85,
  },
  textoBoton: {
    fontFamily: fuentes.sans[600],
    fontSize: 17,
    color: colores.noche900,
  },
});
