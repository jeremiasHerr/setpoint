import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colores, fuentes, radios, tabular } from '../../lib/tokens';
import { partesDelDia } from './textos';

type Props = {
  dias: string[];
  elegido: string | null;
  onElegir: (dia: string) => void;
};

// Los días que quedan del plazo, no un calendario abierto (nota de diseño de la referencia). Hasta
// cinco entran en el ancho; con más, la fila se desliza.
export function ElegirDia({ dias, elegido, onElegir }: Props) {
  const enFila = dias.length <= 5;
  const tarjetas = dias.map((dia) => {
    const { semana, numero } = partesDelDia(dia);
    const activo = dia === elegido;
    return (
      <Pressable
        key={dia}
        accessibilityRole="button"
        accessibilityState={{ selected: activo }}
        accessibilityLabel={`${semana} ${numero}`}
        onPress={() => onElegir(dia)}
        style={({ pressed }) => [estilos.dia, enFila ? estilos.diaEnFila : estilos.diaDeslizable, activo ? estilos.activo : pressed && estilos.apretado]}
      >
        <Text style={[estilos.semana, activo && estilos.semanaActiva]}>{semana}</Text>
        <Text style={[estilos.numero, activo && estilos.numeroActivo]}>{numero}</Text>
      </Pressable>
    );
  });

  if (enFila) return <View style={estilos.fila}>{tarjetas}</View>;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.fila}>
      {tarjetas}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    gap: 8,
  },
  dia: {
    height: 68,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colores.linea,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  diaEnFila: {
    flexGrow: 1,
    flexBasis: 0,
  },
  diaDeslizable: {
    width: 62,
  },
  activo: {
    backgroundColor: colores.negro,
    borderColor: colores.negro,
  },
  apretado: {
    backgroundColor: colores.fondo,
  },
  semana: {
    fontFamily: fuentes.mono[400],
    fontSize: 11,
    color: colores.gris500,
  },
  semanaActiva: {
    color: colores.gris400,
  },
  numero: {
    fontFamily: fuentes.mono[500],
    fontSize: 20,
    color: colores.negro,
    ...tabular,
  },
  numeroActivo: {
    fontFamily: fuentes.mono[600],
    color: colores.lima,
  },
});
