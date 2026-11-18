import type { PartidoDelJugador } from '@setpoint/shared';
import { router } from 'expo-router';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { diaYHora } from '../../lib/fechas';
import { colores, fuentes, medidas, radios, tabular } from '../../lib/tokens';
import { enlaceDeWhatsApp } from './agrupar';
import { SinTelefono } from './SinTelefono';

// El partido que viene, en noche, ocupando el tercio de arriba. "Escribirle" abre WhatsApp con el
// rival: no hay chat en la app (04-flujo-jugador §6.6).
export function TarjetaProximo({ partido }: { partido: PartidoDelJugador }) {
  const { rival } = partido;
  if (!rival || !partido.fechaAcordada) return null;

  return (
    <View style={estilos.tarjeta}>
      <View style={estilos.arriba}>
        <Text style={estilos.rotulo}>Tu próximo partido</Text>
        <View style={estilos.instancia}>
          <Text style={estilos.textoInstancia}>{partido.instancia}</Text>
        </View>
      </View>
      <View>
        <Text style={estilos.rival}>
          {rival.nombre} {rival.apellido}
        </Text>
      </View>
      <View style={estilos.separador} />
      <View style={estilos.cuando}>
        <Text style={estilos.fecha}>{diaYHora(partido.fechaAcordada)}</Text>
        {partido.sede && <Text style={estilos.sede}>{partido.sede}</Text>}
        {/* La anotó él: hasta que el rival confirme, no es un turno pactado (04-flujo-jugador §6.3). */}
        {partido.estado === 'ANOTADA' && partido.anotadaPor === 'yo' && (
          <Text style={estilos.pendiente}>Falta que {rival.nombre} confirme</Text>
        )}
      </View>
      {rival.telefono && (
        <Pressable
          accessibilityRole="link"
          onPress={() => Linking.openURL(enlaceDeWhatsApp(rival.telefono!))}
          style={({ pressed }) => [estilos.boton, pressed && estilos.apretado]}
        >
          <Text style={estilos.textoBoton}>Escribirle</Text>
        </Pressable>
      )}
      {!rival.telefono && <SinTelefono nombre={rival.nombre} sobreNegro />}
      {/* Sin la acción (menos de 24 horas, sin reprogramaciones) no se ofrece: lo resuelve la organización. */}
      {(partido.accionDeFecha === 'cambiar' || partido.accionDeFecha === 'reprogramar') && (
        <Pressable
          accessibilityRole="button"
          hitSlop={12}
          onPress={() => router.push({ pathname: '/partido/[id]/fecha', params: { id: String(partido.id) } })}
          style={({ pressed }) => [estilos.enlace, pressed && estilos.apretado]}
        >
          <Text style={estilos.textoEnlace}>{partido.accionDeFecha === 'cambiar' ? 'Cambiar la fecha' : 'Reprogramar'}</Text>
        </Pressable>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.noche,
    borderRadius: radios.superficie,
    paddingTop: 22,
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 18,
  },
  // Con dos torneos en juego la instancia lleva el nombre del torneo y no entra al lado del
  // rótulo: baja a la línea siguiente.
  arriba: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rotulo: {
    fontFamily: fuentes.sans[500],
    fontSize: 15,
    color: colores.pizarra400,
  },
  instancia: {
    flexShrink: 1,
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderWidth: 1,
    borderColor: colores.bordeNoche,
    borderRadius: radios.chip,
  },
  textoInstancia: {
    fontFamily: fuentes.mono[500],
    fontSize: 12,
    color: colores.pizarra400,
  },
  rival: {
    fontFamily: fuentes.display[600],
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -0.68,
    color: colores.blanco,
  },
  separador: {
    height: 1,
    backgroundColor: colores.noche2,
  },
  cuando: {
    gap: 7,
  },
  fecha: {
    fontFamily: fuentes.mono[500],
    fontSize: 24,
    letterSpacing: -0.24,
    color: colores.blanco,
    ...tabular,
  },
  sede: {
    fontFamily: fuentes.sans[400],
    fontSize: 17,
    color: colores.pizarra400,
  },
  boton: {
    height: medidas.toque,
    borderRadius: 12,
    backgroundColor: colores.lona,
    borderWidth: 1,
    borderColor: colores.lonaBorde,
    alignItems: 'center',
    justifyContent: 'center',
  },
  apretado: {
    opacity: 0.85,
  },
  textoBoton: {
    fontFamily: fuentes.sans[600],
    fontSize: 17,
    color: colores.noche900,
  },
  pendiente: {
    fontFamily: fuentes.sans[500],
    fontSize: 15,
    color: colores.pizarra400,
  },
  enlace: {
    alignSelf: 'center',
    paddingVertical: 4,
  },
  textoEnlace: {
    fontFamily: fuentes.sans[500],
    fontSize: 15,
    color: colores.blanco,
    textDecorationLine: 'underline',
  },
});
