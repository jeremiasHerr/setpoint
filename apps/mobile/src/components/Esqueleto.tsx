import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, View } from 'react-native';
import { colores, radios } from '../lib/tokens';

// Lo que se ve mientras una pantalla espera a la API, como en la web (decisión 093). Aparece recién
// a los 200 ms: si la respuesta llega antes, no se ve nada y la pantalla no parpadea.
const ESPERA_MS = 200;

type Props = {
  // tarjeta: un bloque grande arriba y filas, como Cuándo juego. lista: solo filas, como el ranking.
  forma?: 'tarjeta' | 'lista';
};

export function Esqueleto({ forma = 'lista' }: Props) {
  const [visible, setVisible] = useState(false);
  const opacidad = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const espera = setTimeout(() => setVisible(true), ESPERA_MS);
    return () => clearTimeout(espera);
  }, []);

  // Late suave mientras se ve, salvo que el celular tenga activado "reducir movimiento".
  useEffect(() => {
    if (!visible) return;
    let activo = true;
    let latido: Animated.CompositeAnimation | undefined;
    void AccessibilityInfo.isReduceMotionEnabled().then((reducir) => {
      if (reducir || !activo) return;
      latido = Animated.loop(
        Animated.sequence([
          Animated.timing(opacidad, { toValue: 0.5, duration: 800, useNativeDriver: true }),
          Animated.timing(opacidad, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]),
      );
      latido.start();
    });
    return () => {
      activo = false;
      latido?.stop();
    };
  }, [visible, opacidad]);

  return (
    <Animated.View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Cargando"
      style={[estilos.contenedor, { opacity: visible ? opacidad : 0 }]}
    >
      {forma === 'tarjeta' && (
        <>
          <View style={[estilos.barra, estilos.tarjeta]} />
          <View style={[estilos.barra, estilos.titulo]} />
        </>
      )}
      {[0, 1, 2, 3].map((fila) => (
        <View key={fila} style={estilos.fila}>
          <View style={[estilos.barra, estilos.punto]} />
          <View style={[estilos.barra, estilos.texto]} />
          <View style={[estilos.barra, estilos.numero]} />
        </View>
      ))}
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    gap: 12,
  },
  barra: {
    backgroundColor: colores.linea,
    borderRadius: 6,
  },
  tarjeta: {
    height: 168,
    borderRadius: radios.superficie,
  },
  titulo: {
    width: '45%',
    height: 18,
    marginTop: 8,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: colores.lineaSuave,
    borderRadius: radios.tarjeta,
  },
  punto: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  texto: {
    flex: 1,
    height: 14,
  },
  numero: {
    width: 36,
    height: 14,
  },
});
