import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colores, fuentes, medidas, radios, tabular } from '../../lib/tokens';

export type Opcion = { valor: string; texto: string };

type Props = {
  rotulo: string;
  opciones: Opcion[];
  valor: string | null;
  // Lo que se muestra sin elegir nada.
  vacio: string;
  onElegir: (valor: string) => void;
  // Los horarios van en mono, como todo número.
  numerico?: boolean;
};

// El campo de 56 con chevron de la referencia: al tocarlo, la lista sube desde abajo. Para elegir
// la hora y el club, sin sumar una librería de selectores.
export function Desplegable({ rotulo, opciones, valor, vacio, onElegir, numerico = false }: Props) {
  const [abierto, setAbierto] = useState(false);
  const elegida = opciones.find((o) => o.valor === valor);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${rotulo}: ${elegida?.texto ?? vacio}`}
        onPress={() => setAbierto(true)}
        style={({ pressed }) => [estilos.campo, pressed && estilos.apretado]}
      >
        <Text style={[estilos.valor, numerico && estilos.numerico, !elegida && estilos.vacio]} numberOfLines={1}>
          {elegida?.texto ?? vacio}
        </Text>
        <View style={estilos.chevron} />
      </Pressable>

      <Modal visible={abierto} transparent animationType="slide" onRequestClose={() => setAbierto(false)}>
        <Pressable accessibilityLabel="Cerrar" style={estilos.fondo} onPress={() => setAbierto(false)} />
        <SafeAreaView edges={['bottom']} style={estilos.hoja}>
          <Text style={estilos.titulo}>{rotulo}</Text>
          <FlatList
            data={opciones}
            keyExtractor={(o) => o.valor}
            initialScrollIndex={Math.max(0, opciones.findIndex((o) => o.valor === valor))}
            getItemLayout={(_, i) => ({ length: medidas.toque, offset: medidas.toque * i, index: i })}
            renderItem={({ item }) => {
              const activa = item.valor === valor;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: activa }}
                  onPress={() => {
                    onElegir(item.valor);
                    setAbierto(false);
                  }}
                  style={({ pressed }) => [estilos.opcion, pressed && estilos.apretado]}
                >
                  <Text style={[estilos.textoOpcion, numerico && estilos.numerico, activa && estilos.textoActivo]}>{item.texto}</Text>
                  {activa && <View style={estilos.marca} />}
                </Pressable>
              );
            }}
          />
        </SafeAreaView>
      </Modal>
    </>
  );
}

const estilos = StyleSheet.create({
  campo: {
    height: medidas.toque,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colores.gris300,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  apretado: {
    backgroundColor: colores.fondo,
  },
  valor: {
    flexShrink: 1,
    fontFamily: fuentes.sans[400],
    fontSize: 17,
    color: colores.negro,
  },
  numerico: {
    fontFamily: fuentes.mono[500],
    fontSize: 18,
    ...tabular,
  },
  vacio: {
    color: colores.gris400,
  },
  // Un ángulo hecho con dos bordes, como en el encabezado del circuito: sin react-native-svg.
  chevron: {
    width: 8,
    height: 8,
    marginTop: -4,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: colores.gris500,
    transform: [{ rotate: '45deg' }],
  },
  fondo: {
    flex: 1,
    backgroundColor: 'rgba(10, 11, 13, 0.4)',
  },
  hoja: {
    maxHeight: '60%',
    backgroundColor: colores.blanco,
    borderTopLeftRadius: radios.superficie,
    borderTopRightRadius: radios.superficie,
    paddingTop: 18,
    paddingHorizontal: medidas.margen,
  },
  titulo: {
    fontFamily: fuentes.sans[600],
    fontSize: 16,
    color: colores.negro,
    marginBottom: 6,
  },
  opcion: {
    height: medidas.toque,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colores.lineaSuave,
  },
  textoOpcion: {
    fontFamily: fuentes.sans[400],
    fontSize: 17,
    color: colores.gris700,
  },
  textoActivo: {
    fontFamily: fuentes.sans[600],
    color: colores.negro,
  },
  // Un tilde hecho con dos bordes.
  marca: {
    width: 7,
    height: 13,
    marginRight: 4,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: colores.negro,
    transform: [{ rotate: '45deg' }],
  },
});
