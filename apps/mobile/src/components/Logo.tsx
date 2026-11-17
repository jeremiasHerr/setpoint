import { StyleSheet, View } from 'react-native';
import { colores } from '../lib/tokens';

const LADO = 26;
// El logo está dibujado en una grilla de 120 (docs/logos/marcas.svg): U pasa de esa grilla al lado.
const U = LADO / 120;

// La marca de la app: el cuadrado negro con las cuatro marcas, tres hechas y la que está en juego,
// en lima y levantada (decisión 104). Va con View y no con SVG para no sumar una dependencia.
export function Logo() {
  return (
    <View style={estilos.cuadro}>
      {[22, 42, 62].map((x) => (
        <View key={x} style={[estilos.marca, { left: x * U }]} />
      ))}
      <View style={[estilos.marca, estilos.enJuego]} />
    </View>
  );
}

const estilos = StyleSheet.create({
  cuadro: {
    width: LADO,
    height: LADO,
    borderRadius: 28 * U,
    backgroundColor: colores.negro,
  },
  marca: {
    position: 'absolute',
    top: 39 * U,
    width: 16 * U,
    height: 50 * U,
    borderRadius: 4 * U,
    backgroundColor: colores.blanco,
  },
  enJuego: {
    left: 82 * U,
    top: 27 * U,
    backgroundColor: colores.lima,
  },
});
