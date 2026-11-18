import { StyleSheet, View } from 'react-native';
import { colores } from '../lib/tokens';

// El dibujo del logo de la web (components/Logo.tsx), en su grilla de 63 × 53: U pasa de esa grilla al alto.
const ALTO = 22;
const U = ALTO / 53;

// El logo de la app: las marcas de una zona, tres partidos jugados y el último, levantado, es el set
// point (decisiones 104 y 105). Va sobre claro, así que las barras van en noche y la levantada en lona.
// Con View y no con SVG para no sumar una dependencia por un logo.
export function Logo() {
  return (
    <View style={estilos.marco}>
      {[0, 17, 34].map((x) => (
        <View key={x} style={[estilos.marca, { left: x * U }]} />
      ))}
      <View style={[estilos.marca, estilos.enJuego]} />
    </View>
  );
}

const estilos = StyleSheet.create({
  marco: {
    width: 63 * U,
    height: ALTO,
  },
  marca: {
    position: 'absolute',
    top: 12 * U,
    width: 11 * U,
    height: 41 * U,
    borderRadius: 2 * U,
    backgroundColor: colores.noche,
  },
  enJuego: {
    left: 52 * U,
    top: 0,
    backgroundColor: colores.lona,
  },
});
