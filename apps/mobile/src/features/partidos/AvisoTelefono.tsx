import { StyleSheet, Text, View } from 'react-native';
import { Boton } from '../../components/Boton';
import { ErrorApi } from '../../lib/api';
import { colores, fuentes, radios } from '../../lib/tokens';
import { useGuardarTelefono } from './useMisPartidos';

// El aviso previo de 04 §6.6 (decisión 128): la primera vez, antes de que nadie más lo note, el
// jugador se entera de que su rival ve su teléfono y elige. Aparece mientras no responda.
export function AvisoTelefono() {
  const guardar = useGuardarTelefono();
  const error = guardar.error instanceof ErrorApi && guardar.error.codigo === 'SIN_CONEXION'
    ? 'No pudimos conectarnos. Revisá tu conexión y probá de nuevo.'
    : guardar.error
      ? 'No pudimos guardar tu elección. Probá de nuevo.'
      : null;

  return (
    <View style={estilos.tarjeta}>
      <Text style={estilos.titulo} accessibilityRole="header">
        Tus rivales ven tu teléfono
      </Text>
      <Text style={estilos.texto}>
        Así te pueden escribir por WhatsApp para coordinar. Solo lo ve quien juega con vos un partido que todavía no se jugó. Nadie más,
        salvo la organización.
      </Text>
      {error && <Text style={estilos.error}>{error}</Text>}
      <Boton texto="Entendido" variante="principal" disabled={guardar.isPending} onPress={() => guardar.mutate({ mostrar: true })} />
      <Boton texto="No mostrar mi teléfono" disabled={guardar.isPending} onPress={() => guardar.mutate({ mostrar: false })} />
      <Text style={estilos.nota}>Lo podés cambiar cuando quieras tocando el nombre del circuito, arriba de todo.</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    borderWidth: 1,
    backgroundColor: colores.papel,
    borderColor: colores.linea,
    borderRadius: radios.tarjeta,
    padding: 18,
    gap: 12,
  },
  titulo: { fontFamily: fuentes.sans[600], fontSize: 20, letterSpacing: -0.4, color: colores.noche },
  texto: { fontFamily: fuentes.sans[400], fontSize: 16, lineHeight: 23, color: colores.pizarra700 },
  error: { fontFamily: fuentes.sans[500], fontSize: 15, lineHeight: 21, color: colores.noche },
  nota: { fontFamily: fuentes.sans[400], fontSize: 14, lineHeight: 20, color: colores.pizarra500 },
});
