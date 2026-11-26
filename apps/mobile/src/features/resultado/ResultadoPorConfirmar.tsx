import type { PartidoDelJugador } from '@setpoint/shared';
import { StyleSheet, Text, View } from 'react-native';
import { Boton } from '../../components/Boton';
import { ErrorApi } from '../../lib/api';
import { colores, fuentes, tabular } from '../../lib/tokens';
import { useResponderResultado } from './useResultado';

const MENSAJES: Record<string, string> = {
  SIN_RESULTADO_PENDIENTE: 'El resultado cambió mientras tanto. Mirá cómo quedó.',
  RESULTADO_CAMBIO: 'El resultado cambió mientras tanto. Mirá cómo quedó.',
  PARTIDO_CON_RESULTADO: 'La organización ya cargó el resultado de este partido.',
  SIN_CONEXION: 'No pudimos conectarnos. Revisá tu conexión y probá de nuevo.',
};

// El resultado que cargó el rival y espera la respuesta (decisión 127). Va en Cuándo juego, arriba,
// como la fecha por confirmar: es donde abre el aviso. Confirmado, cuenta; si no fue así, no cuenta
// y cualquiera de los dos lo vuelve a cargar.
export function ResultadoPorConfirmar({ partido }: { partido: PartidoDelJugador }) {
  const confirmar = useResponderResultado('confirmacion');
  const rechazar = useResponderResultado('rechazo');
  const { rival, resultadoPropuesto: propuesta } = partido;
  if (!rival || !propuesta) return null;

  const enCurso = confirmar.isPending || rechazar.isPending;
  const fallo = confirmar.error ?? rechazar.error;
  const error = fallo instanceof ErrorApi ? fallo : null;
  const mensaje = fallo ? (MENSAJES[error?.codigo ?? ''] ?? 'No pudimos mandar tu respuesta. Probá de nuevo.') : null;

  return (
    <View style={estilos.tarjeta}>
      <View style={estilos.franja} />
      <View style={estilos.cuerpo}>
        <View style={estilos.arriba}>
          <Text style={estilos.rival} numberOfLines={1}>
            {rival.nombre} {rival.apellido}
          </Text>
          <Text style={estilos.instancia}>{partido.instancia}</Text>
        </View>
        <View style={estilos.resultado}>
          <Text style={estilos.texto}>{rival.nombre} cargó el resultado:</Text>
          <Text style={estilos.marcador}>{propuesta.marcador}</Text>
          <Text style={estilos.quien}>{propuesta.gano ? 'Ganaste vos' : `Ganó ${rival.nombre}`}</Text>
        </View>
        {mensaje && <Text style={estilos.error}>{mensaje}</Text>}
        <Boton
          texto={confirmar.isPending ? 'Confirmando…' : 'Confirmar'}
          variante="principal"
          disabled={enCurso}
          onPress={() => confirmar.mutate(partido.id)}
        />
        <Boton texto={rechazar.isPending ? 'Avisando…' : 'No fue así'} disabled={enCurso} onPress={() => rechazar.mutate(partido.id)} />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    borderWidth: 1,
    backgroundColor: colores.papel,
    borderColor: colores.linea,
    borderRadius: 16,
    overflow: 'hidden',
  },
  // Lona y no rojo, como la fecha por confirmar: no vence nada, falta un toque.
  franja: { height: 4, backgroundColor: colores.lona },
  cuerpo: { padding: 18, gap: 14 },
  arriba: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 },
  rival: { flexShrink: 1, fontFamily: fuentes.sans[600], fontSize: 22, letterSpacing: -0.55, color: colores.noche },
  instancia: { fontFamily: fuentes.mono[500], fontSize: 13, color: colores.pizarra500 },
  resultado: { gap: 4 },
  texto: { fontFamily: fuentes.sans[400], fontSize: 16, lineHeight: 22, color: colores.pizarra500 },
  // Desde su lado: sus games primero.
  marcador: { fontFamily: fuentes.mono[500], fontSize: 26, letterSpacing: -0.26, color: colores.noche, ...tabular },
  quien: { fontFamily: fuentes.sans[500], fontSize: 16, color: colores.pizarra700 },
  error: { fontFamily: fuentes.sans[500], fontSize: 15, lineHeight: 21, color: colores.noche },
});
