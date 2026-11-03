import type { PartidoDelJugador } from '@setpoint/shared';
import { router } from 'expo-router';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { Boton } from '../../components/Boton';
import { diasHasta } from '../../lib/fechas';
import { colores, fuentes, tabular } from '../../lib/tokens';
import { enlaceDeWhatsApp } from './agrupar';

function plazo(fechaLimite: string) {
  const dias = diasHasta(fechaLimite);
  if (dias < 0) return 'venció el plazo';
  if (dias === 0) return 'vence hoy';
  return `vence en ${dias} ${dias === 1 ? 'día' : 'días'}`;
}

// Un partido sin fecha. El rojo aparece una sola vez en la pantalla y solo por vencimiento: en el
// que vence primero. Se coordina por WhatsApp ("Escribirle") y se anota en la app (F14).
export function SinCoordinar({ partido, urgente }: { partido: PartidoDelJugador; urgente: boolean }) {
  const { rival } = partido;
  if (!rival) return null;
  const rojo = urgente && partido.fechaLimite !== null;

  return (
    <View style={estilos.tarjeta}>
      {rojo && <View style={estilos.franja} />}
      <View style={estilos.cuerpo}>
        <View style={estilos.arriba}>
          <Text style={estilos.rival} numberOfLines={1}>
            {rival.nombre} {rival.apellido}
          </Text>
          {partido.fechaLimite && (
            <Text style={[estilos.plazo, rojo && estilos.plazoRojo]}>{plazo(partido.fechaLimite)}</Text>
          )}
        </View>
        <Text style={estilos.texto}>
          {partido.instancia}. Todavía nadie anotó la fecha. La puede cargar cualquiera de los dos.
        </Text>
        <View style={estilos.botones}>
          {partido.accionDeFecha && (
            <View style={estilos.boton}>
              <Boton
                texto="Anotar la fecha"
                variante="organizador"
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
  franja: {
    height: 4,
    backgroundColor: colores.rojo,
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
  plazo: {
    fontFamily: fuentes.mono[500],
    fontSize: 14,
    color: colores.gris500,
    ...tabular,
  },
  plazoRojo: {
    color: colores.rojoTexto,
  },
  botones: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  boton: {
    flex: 1,
  },
  texto: {
    fontFamily: fuentes.sans[400],
    fontSize: 16,
    lineHeight: 22,
    color: colores.gris500,
  },
});
