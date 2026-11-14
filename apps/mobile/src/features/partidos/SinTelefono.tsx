import { StyleSheet, Text, View } from 'react-native';
import { colores, fuentes, radios } from '../../lib/tokens';

// En el lugar de "Escribirle" cuando el rival no tiene teléfono en el padrón: el botón no desaparece
// sin explicación. Con un padrón importado desde la planilla, casi nadie lo tiene (decisión 046).
export function SinTelefono({ nombre, sobreNegro = false }: { nombre: string; sobreNegro?: boolean }) {
  const texto = `No tenemos el teléfono de ${nombre}. Pedíselo a la organización.`;
  if (sobreNegro) return <Text style={[estilos.texto, estilos.textoSobreNegro]}>{texto}</Text>;
  return (
    <View style={estilos.caja}>
      <Text style={estilos.texto}>{texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  caja: {
    backgroundColor: colores.fondo,
    borderRadius: radios.control,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  texto: {
    fontFamily: fuentes.sans[400],
    fontSize: 15,
    lineHeight: 21,
    color: colores.gris700,
  },
  textoSobreNegro: {
    color: colores.gris400,
    textAlign: 'center',
  },
});
