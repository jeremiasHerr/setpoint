import type { SistemaDeJuego } from '@setpoint/shared';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colores, fuentes, medidas, radios, tabular } from '../../lib/tokens';
import { esSuperTieBreak, filasVisibles, type FilaDeSet } from './sets';

type Props = {
  sistema: SistemaDeJuego;
  filas: FilaDeSet[];
  rival: string;
  onCambiar: (indice: number, cambio: Partial<FilaDeSet>) => void;
};

function Casillero({ valor, rotulo, onCambiar }: { valor: string; rotulo: string; onCambiar: (texto: string) => void }) {
  const [enfocado, setEnfocado] = useState(false);
  return (
    <TextInput
      accessibilityLabel={rotulo}
      value={valor}
      // Solo dígitos: el teclado numérico igual deja pegar otra cosa.
      onChangeText={(texto) => onCambiar(texto.replace(/\D/g, '').slice(0, 2))}
      keyboardType="number-pad"
      maxLength={2}
      selectTextOnFocus
      onFocus={() => setEnfocado(true)}
      onBlur={() => setEnfocado(false)}
      style={[estilos.casillero, enfocado && estilos.casilleroEnfocado]}
    />
  );
}

// Los games de cada set desde el lado del jugador: los suyos a la izquierda, los del rival a la
// derecha. Las filas aparecen a medida que hacen falta (sets.ts).
export function GrillaDeSets({ sistema, filas, rival, onCambiar }: Props) {
  const visibles = filasVisibles(sistema, filas);
  return (
    <View style={estilos.grilla}>
      <View style={estilos.fila}>
        <View style={estilos.rotuloFila} />
        <Text style={estilos.columna}>Vos</Text>
        <Text style={estilos.columna} numberOfLines={1}>
          {rival}
        </Text>
      </View>
      {Array.from({ length: visibles }, (_, i) => {
        const nombre = esSuperTieBreak(sistema, i) ? 'Super tie-break' : `Set ${i + 1}`;
        const fila = filas[i] ?? { mios: '', suyos: '' };
        return (
          <View key={i} style={estilos.fila}>
            <Text style={estilos.rotuloFila}>{nombre}</Text>
            <Casillero valor={fila.mios} rotulo={`${nombre}, tus games`} onCambiar={(mios) => onCambiar(i, { mios })} />
            <Casillero valor={fila.suyos} rotulo={`${nombre}, games de ${rival}`} onCambiar={(suyos) => onCambiar(i, { suyos })} />
          </View>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  grilla: { gap: 10 },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rotuloFila: { flex: 1, fontFamily: fuentes.sans[500], fontSize: 15, color: colores.pizarra700 },
  columna: {
    width: 72,
    textAlign: 'center',
    fontFamily: fuentes.sans[500],
    fontSize: 13,
    color: colores.pizarra500,
  },
  casillero: {
    width: 72,
    height: medidas.toque,
    borderWidth: 1,
    borderColor: colores.bordeCampo,
    borderRadius: radios.control,
    backgroundColor: colores.papel,
    textAlign: 'center',
    fontFamily: fuentes.mono[500],
    fontSize: 22,
    color: colores.noche,
    ...tabular,
  },
  // Enfocado, el borde pasa a 2px noche, como el Campo (design.md §6).
  casilleroEnfocado: { borderWidth: 2, borderColor: colores.noche },
});
