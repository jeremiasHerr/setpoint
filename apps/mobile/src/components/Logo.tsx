import { StyleSheet, View } from 'react-native';
import { colores } from '../lib/tokens';

// La marca del circuito, como en las páginas públicas de la web: el cuadrado noche con el punto
// pelota (design.md §3).
export function Logo() {
  return (
    <View style={estilos.cuadro}>
      <View style={estilos.punto} />
    </View>
  );
}

const estilos = StyleSheet.create({
  cuadro: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: colores.noche,
    alignItems: 'center',
    justifyContent: 'center',
  },
  punto: {
    width: 9,
    height: 9,
    borderRadius: 999,
    backgroundColor: colores.pelota,
  },
});
