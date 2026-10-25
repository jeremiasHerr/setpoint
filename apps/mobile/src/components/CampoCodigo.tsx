import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputInstance } from 'react-native';
import { colores, fuentes, radios, tabular } from '../lib/tokens';

const LARGO = 6;

type Props = {
  valor: string;
  onChange: (valor: string) => void;
  onCompleto?: (valor: string) => void;
  // Se apagan las casillas, por ejemplo con el código vencido.
  apagado?: boolean;
};

// Seis casillas en dos grupos de tres, como se escribe el código en el email (design.md §8).
// Por debajo hay un solo TextInput invisible: así andan el teclado numérico, borrar y el
// autocompletado del código que ofrece Android.
export function CampoCodigo({ valor, onChange, onCompleto, apagado }: Props) {
  const campo = useRef<TextInputInstance>(null);
  const [enfocado, setEnfocado] = useState(false);

  const cambiar = (texto: string) => {
    const digitos = texto.replace(/\D/g, '').slice(0, LARGO);
    onChange(digitos);
    if (digitos.length === LARGO) onCompleto?.(digitos);
  };

  return (
    <Pressable onPress={() => campo.current?.focus()} accessibilityLabel="Código de 6 dígitos" style={estilos.fila}>
      {Array.from({ length: LARGO }, (_, i) => (
        <View key={i} style={[estilos.casilla, i === 3 && estilos.separada, enfocado && i === valor.length && estilos.activa, apagado && estilos.apagada]}>
          <Text style={[estilos.digito, apagado && estilos.digitoApagado]}>{valor[i] ?? ''}</Text>
        </View>
      ))}
      <TextInput
        ref={campo}
        value={valor}
        onChangeText={cambiar}
        onFocus={() => setEnfocado(true)}
        onBlur={() => setEnfocado(false)}
        keyboardType="number-pad"
        autoComplete="sms-otp"
        textContentType="oneTimeCode"
        maxLength={LARGO}
        autoFocus
        caretHidden
        style={estilos.oculto}
      />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    gap: 8,
  },
  casilla: {
    width: 46,
    height: 58,
    borderRadius: radios.control,
    borderWidth: 1,
    borderColor: colores.gris300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separada: {
    marginLeft: 6,
  },
  activa: {
    borderWidth: 2,
    borderColor: colores.negro,
  },
  apagada: {
    backgroundColor: colores.fondo,
    borderColor: colores.linea,
  },
  digito: {
    fontFamily: fuentes.mono[500],
    fontSize: 26,
    color: colores.negro,
    ...tabular,
  },
  digitoApagado: {
    color: colores.gris400,
  },
  oculto: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
});
