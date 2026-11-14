import type { PartidoDelJugador } from '@setpoint/shared';
import { router } from 'expo-router';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { Boton } from '../../components/Boton';
import { ErrorApi } from '../../lib/api';
import { diaYHora } from '../../lib/fechas';
import { colores, fuentes, tabular } from '../../lib/tokens';
import { useConfirmarFecha } from '../coordinacion/useConfirmarFecha';
import { enlaceDeWhatsApp } from './agrupar';
import { SinTelefono } from './SinTelefono';

const MENSAJES: Record<string, string> = {
  PARTIDO_CAMBIO: 'La fecha cambió mientras tanto. Mirá cómo quedó.',
  NADA_PARA_CONFIRMAR: 'La fecha cambió mientras tanto. Mirá cómo quedó.',
  PLAZO_VENCIDO: 'Venció el plazo para jugar este partido. Lo resuelve la organización.',
  SIN_CONEXION: 'No pudimos conectarnos. Revisá tu conexión y probá de nuevo.',
};

// Una fecha que anotó el rival y espera la confirmación (F14). La confirmación vive acá, en Cuándo
// juego, donde abre el aviso (decisión 068). Si no puede ese día, propone otro desde Anotar la fecha:
// cambiar una fecha sin confirmar no gasta la reprogramación (decisión 065).
export function PorConfirmar({ partido }: { partido: PartidoDelJugador }) {
  const confirmar = useConfirmarFecha();
  const { rival } = partido;
  if (!rival || !partido.fechaAcordada) return null;

  const error = confirmar.error instanceof ErrorApi ? confirmar.error : null;
  const mensaje = error ? (MENSAJES[error.codigo] ?? 'No pudimos confirmar. Probá de nuevo.') : null;

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
        <View style={estilos.cuando}>
          <Text style={estilos.texto}>{rival.nombre} anotó la fecha:</Text>
          <Text style={estilos.fecha}>{diaYHora(partido.fechaAcordada)}</Text>
          {partido.sede && <Text style={estilos.sede}>{partido.sede}</Text>}
        </View>
        {mensaje && <Text style={estilos.error}>{mensaje}</Text>}
        <Boton
          texto={confirmar.isPending ? 'Confirmando…' : 'Confirmar'}
          variante="principal"
          disabled={confirmar.isPending}
          onPress={() => confirmar.mutate(partido.id)}
        />
        <View style={estilos.botones}>
          {partido.accionDeFecha && (
            <View style={estilos.boton}>
              <Boton
                texto="No puedo ese día"
                onPress={() => router.push({ pathname: '/partido/[id]/fecha', params: { id: String(partido.id) } })}
              />
            </View>
          )}
          {rival.telefono && (
            <View style={estilos.boton}>
              <Boton texto="Escribirle" accessibilityRole="link" onPress={() => Linking.openURL(enlaceDeWhatsApp(rival.telefono!))} />
            </View>
          )}
        </View>
        {!rival.telefono && <SinTelefono nombre={rival.nombre} />}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    borderWidth: 1,
    borderColor: colores.linea,
    borderRadius: 16,
    overflow: 'hidden',
  },
  // Lima y no rojo: no vence nada, falta un toque.
  franja: {
    height: 4,
    backgroundColor: colores.lima,
  },
  cuerpo: {
    padding: 18,
    gap: 14,
  },
  arriba: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
  },
  rival: {
    flexShrink: 1,
    fontFamily: fuentes.sans[600],
    fontSize: 22,
    letterSpacing: -0.55,
    color: colores.negro,
  },
  instancia: {
    fontFamily: fuentes.mono[500],
    fontSize: 13,
    color: colores.gris500,
  },
  cuando: {
    gap: 4,
  },
  texto: {
    fontFamily: fuentes.sans[400],
    fontSize: 16,
    lineHeight: 22,
    color: colores.gris500,
  },
  fecha: {
    fontFamily: fuentes.mono[500],
    fontSize: 22,
    letterSpacing: -0.22,
    color: colores.negro,
    ...tabular,
  },
  sede: {
    fontFamily: fuentes.sans[400],
    fontSize: 16,
    color: colores.gris700,
  },
  error: {
    fontFamily: fuentes.sans[400],
    fontSize: 14,
    lineHeight: 20,
    color: colores.rojoTexto,
  },
  botones: {
    flexDirection: 'row',
    gap: 10,
  },
  boton: {
    flex: 1,
  },
});
