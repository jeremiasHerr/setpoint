import { useState, type Ref } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputInstance, type TextInputProps } from 'react-native';
import { colores, fuentes, medidas, radios } from '../lib/tokens';

type Props = Omit<TextInputProps, 'style'> & {
  rotulo: string;
  // Para pasar el foco al campo siguiente desde el teclado.
  ref?: Ref<TextInputInstance>;
};

// Campo de 56 con el rótulo arriba (design.md §6). Enfocado, el borde pasa a 2px noche.
export function Campo({ rotulo, ref, onFocus, onBlur, ...props }: Props) {
  const [enfocado, setEnfocado] = useState(false);

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      <TextInput
        ref={ref}
        accessibilityLabel={rotulo}
        placeholderTextColor={colores.pizarra450}
        style={[estilos.campo, enfocado && estilos.campoEnfocado]}
        onFocus={(e) => {
          setEnfocado(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setEnfocado(false);
          onBlur?.(e);
        }}
        {...props}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    gap: 11,
  },
  rotulo: {
    fontFamily: fuentes.sans[600],
    fontSize: 15,
    color: colores.noche,
  },
  campo: {
    height: medidas.toque,
    borderRadius: radios.control,
    borderWidth: 1,
    backgroundColor: colores.papel,
    borderColor: colores.bordeCampo,
    // Con el borde de 2 al enfocar, el texto se movería: se compensa con el padding.
    paddingHorizontal: 16,
    fontFamily: fuentes.sans[400],
    fontSize: 17,
    color: colores.noche,
  },
  campoEnfocado: {
    borderWidth: 2,
    borderColor: colores.noche,
    paddingHorizontal: 15,
  },
});
