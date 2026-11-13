// Anotar la fecha (F14): docs/pantallas/jugador/anotar-fecha.html. El jugador registra el día, la
// hora y el club que acordó con su rival por WhatsApp; el rival confirma (04-flujo-jugador §6). La
// misma pantalla cambia una fecha sin confirmar y reprograma una confirmada (decisión 065).
import type { CoordinacionDelPartido } from '@setpoint/shared';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Boton } from '../../../components/Boton';
import { Campo } from '../../../components/Campo';
import { Esqueleto } from '../../../components/Esqueleto';
import { ErrorDeCarga } from '../../../features/auth/ErrorDeCarga';
import { Desplegable } from '../../../features/coordinacion/Desplegable';
import { ElegirDia } from '../../../features/coordinacion/ElegirDia';
import {
  ayudaDeLaSede,
  horasDisponibles,
  textoDeLaConfirmacion,
  textoDelBloqueo,
  textoDelBoton,
  textoDelPlazo,
  tituloDeLaPantalla,
} from '../../../features/coordinacion/textos';
import { useAnotarFecha, useCoordinacion } from '../../../features/coordinacion/useCoordinacion';
import { ErrorApi } from '../../../lib/api';
import { colores, fuentes, medidas, radios, tabular } from '../../../lib/tokens';

const OTRO = 'otro';

export default function AnotarFecha() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const partidoId = Number(id);
  const consulta = useCoordinacion(partidoId);
  const coordinacion = consulta.data;

  return (
    <SafeAreaView style={estilos.pantalla}>
      <KeyboardAvoidingView style={estilos.pantalla} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
          <View style={estilos.encabezado}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Volver"
              onPress={() => router.back()}
              hitSlop={8}
              style={({ pressed }) => [estilos.volver, pressed && estilos.apretado]}
            >
              <View style={estilos.flecha} />
            </Pressable>
            <Text style={estilos.titulo}>{tituloDeLaPantalla(coordinacion?.accion ?? 'anotar')}</Text>
          </View>

          {consulta.isPending && <Esqueleto forma="tarjeta" />}
          {consulta.error && !coordinacion && <ErrorDeCarga error={consulta.error} que="el partido" />}
          {coordinacion && <Contenido coordinacion={coordinacion} recargar={() => void consulta.refetch()} />}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Contenido({ coordinacion, recargar }: { coordinacion: CoordinacionDelPartido; recargar: () => void }) {
  const rival = coordinacion.rival;
  return (
    <>
      {rival && <TarjetaDelRival coordinacion={coordinacion} />}
      {coordinacion.accion && rival ? (
        <Formulario coordinacion={coordinacion} rival={rival.nombre} recargar={recargar} />
      ) : (
        <View style={estilos.aviso}>
          <Text style={estilos.textoAviso}>
            {textoDelBloqueo(coordinacion.bloqueo ?? 'PARTIDO_TERMINADO', coordinacion.horasAntelacionReprogramar)}
          </Text>
        </View>
      )}
    </>
  );
}

// El rival, la instancia y cuántos días quedan del plazo. El rojo, solo cuando quedan pocos: es el
// color del vencimiento (design.md §3).
function TarjetaDelRival({ coordinacion }: { coordinacion: CoordinacionDelPartido }) {
  const { rival, dias, ultimoDia } = coordinacion;
  const urgente = dias.length <= 3;
  return (
    <View style={estilos.tarjeta}>
      <View style={estilos.rival}>
        <Text style={estilos.nombreRival} numberOfLines={1}>
          {rival!.nombre} {rival!.apellido}
        </Text>
        <Text style={estilos.instancia}>{coordinacion.instancia}</Text>
      </View>
      {ultimoDia && (
        <View style={[estilos.plazo, urgente && estilos.plazoUrgente]}>
          <Text style={[estilos.textoPlazo, urgente && estilos.textoPlazoUrgente]}>
            {dias.length} {dias.length === 1 ? 'día' : 'días'}
          </Text>
        </View>
      )}
    </View>
  );
}

const MENSAJES: Record<string, string> = {
  PARTIDO_CAMBIO: 'Tu rival cambió la fecha mientras la anotabas. Mirá cómo quedó y probá de nuevo.',
  SIN_CONEXION: 'No pudimos conectarnos. Revisá tu conexión y probá de nuevo.',
};

function Formulario({ coordinacion, rival, recargar }: { coordinacion: CoordinacionDelPartido; rival: string; recargar: () => void }) {
  const { actual, sede } = coordinacion;
  const anotar = useAnotarFecha(coordinacion.partidoId);

  const [dia, setDia] = useState<string | null>(actual && coordinacion.dias.includes(actual.dia) ? actual.dia : null);
  const [hora, setHora] = useState<string | null>(actual?.hora ?? null);
  // Un club de la lista por su id, u "otro" con la sede escrita.
  const [club, setClub] = useState<string | null>(
    actual?.clubId ? String(actual.clubId) : actual?.sedeTexto ? OTRO : null,
  );
  const [sedeTexto, setSedeTexto] = useState(actual?.sedeTexto ?? '');

  const libre = sede.modo === 'libre';
  const sinClubes = libre && sede.clubes.length === 0;
  const escribiendo = sinClubes || club === OTRO;
  const horas = dia ? horasDisponibles(dia) : [];
  const horaValida = hora !== null && horas.includes(hora);
  const sedeLista = !libre || (escribiendo ? sedeTexto.trim() !== '' : club !== null);

  const error = anotar.error instanceof ErrorApi ? anotar.error : null;
  const campos = error?.campos ?? {};
  const mensaje = error && !Object.keys(campos).length ? (MENSAJES[error.codigo] ?? 'No pudimos anotar la fecha. Probá de nuevo.') : null;

  function guardar() {
    if (!dia || !hora) return;
    anotar.mutate(
      {
        dia,
        hora,
        clubId: libre && !escribiendo && club ? Number(club) : null,
        sedeTexto: libre && escribiendo ? sedeTexto : null,
      },
      {
        onSuccess: () => router.back(),
        // Si el partido cambió (lo cambió el rival, venció), la pantalla se actualiza con lo de ahora.
        onError: (e) => {
          if (e instanceof ErrorApi && !Object.keys(e.campos).length) recargar();
        },
      },
    );
  }

  return (
    <>
      <View style={estilos.seccion}>
        <Text style={estilos.pregunta}>¿Qué día?</Text>
        <ElegirDia dias={coordinacion.dias} elegido={dia} onElegir={setDia} />
        {textoDelPlazo(coordinacion) && <Text style={estilos.ayuda}>{textoDelPlazo(coordinacion)}</Text>}
        {campos.dia && <Text style={estilos.error}>{campos.dia}</Text>}
      </View>

      <View style={estilos.seccion}>
        <Text style={estilos.pregunta}>¿A qué hora?</Text>
        {dia ? (
          <Desplegable
            rotulo="¿A qué hora?"
            opciones={horas.map((h) => ({ valor: h, texto: h }))}
            valor={horaValida ? hora : null}
            vacio="Elegí la hora"
            onElegir={setHora}
            numerico
          />
        ) : (
          <Text style={estilos.ayuda}>Primero elegí el día.</Text>
        )}
        {dia && horas.length === 0 && <Text style={estilos.ayuda}>Hoy ya no quedan horarios. Elegí otro día.</Text>}
        {campos.hora && <Text style={estilos.error}>{campos.hora}</Text>}
      </View>

      <View style={estilos.seccion}>
        <Text style={estilos.pregunta}>¿Dónde juegan?</Text>
        {sede.modo === 'designada' ? (
          <View style={estilos.sedeFija}>
            <Text style={estilos.textoSedeFija}>{sede.nombre ?? 'A definir por la organización'}</Text>
          </View>
        ) : (
          <>
            {!sinClubes && (
              <Desplegable
                rotulo="¿Dónde juegan?"
                opciones={[...sede.clubes.map((c) => ({ valor: String(c.id), texto: c.nombre })), { valor: OTRO, texto: 'Otro lugar' }]}
                valor={club}
                vacio="Elegí el club"
                onElegir={setClub}
              />
            )}
            {escribiendo && (
              <Campo
                rotulo={sinClubes ? 'El club o la dirección' : 'Escribí dónde'}
                value={sedeTexto}
                onChangeText={setSedeTexto}
                placeholder="Club Independiente"
                maxLength={80}
                returnKeyType="done"
              />
            )}
          </>
        )}
        <Text style={estilos.ayuda}>{ayudaDeLaSede(coordinacion)}</Text>
        {campos.clubId && <Text style={estilos.error}>{campos.clubId}</Text>}
      </View>

      <View style={estilos.pie}>
        <View style={estilos.aviso}>
          <Text style={estilos.textoAviso}>{textoDeLaConfirmacion(coordinacion, rival)}</Text>
        </View>
        {mensaje && <Text style={estilos.error}>{mensaje}</Text>}
        <Boton
          texto={anotar.isPending ? 'Anotando…' : textoDelBoton(coordinacion.accion!, rival)}
          variante="principal"
          disabled={!dia || !horaValida || !sedeLista || anotar.isPending}
          onPress={guardar}
        />
      </View>
    </>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.blanco,
  },
  contenido: {
    flexGrow: 1,
    paddingHorizontal: medidas.margen,
    paddingTop: 20,
    paddingBottom: 28,
    gap: 22,
  },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  volver: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colores.linea,
    alignItems: 'center',
    justifyContent: 'center',
  },
  apretado: {
    backgroundColor: colores.fondo,
  },
  // Un ángulo hecho con dos bordes, apuntando a la izquierda.
  flecha: {
    width: 9,
    height: 9,
    marginLeft: 4,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: colores.negro,
    transform: [{ rotate: '45deg' }],
  },
  titulo: {
    fontFamily: fuentes.sans[600],
    fontSize: 20,
    letterSpacing: -0.5,
    color: colores.negro,
  },
  texto: {
    fontFamily: fuentes.sans[400],
    fontSize: 15,
    lineHeight: 22,
    color: colores.gris700,
  },
  tarjeta: {
    borderWidth: 1,
    borderColor: colores.linea,
    borderRadius: radios.tarjeta,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rival: {
    flexShrink: 1,
    gap: 4,
  },
  nombreRival: {
    fontFamily: fuentes.sans[600],
    fontSize: 20,
    letterSpacing: -0.5,
    color: colores.negro,
  },
  instancia: {
    fontFamily: fuentes.mono[400],
    fontSize: 13,
    color: colores.gris500,
  },
  plazo: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colores.linea,
    borderRadius: radios.chip,
  },
  plazoUrgente: {
    borderColor: colores.rojoLinea,
  },
  textoPlazo: {
    fontFamily: fuentes.mono[500],
    fontSize: 12,
    color: colores.gris500,
    ...tabular,
  },
  textoPlazoUrgente: {
    color: colores.rojoTexto,
  },
  seccion: {
    gap: 11,
  },
  pregunta: {
    fontFamily: fuentes.sans[600],
    fontSize: 16,
    color: colores.negro,
  },
  ayuda: {
    fontFamily: fuentes.sans[400],
    fontSize: 14,
    lineHeight: 20,
    color: colores.gris500,
  },
  error: {
    fontFamily: fuentes.sans[400],
    fontSize: 14,
    lineHeight: 20,
    color: colores.rojoTexto,
  },
  sedeFija: {
    height: medidas.toque,
    borderRadius: 12,
    backgroundColor: colores.fondo,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  textoSedeFija: {
    fontFamily: fuentes.sans[400],
    fontSize: 17,
    color: colores.negro,
  },
  pie: {
    marginTop: 'auto',
    gap: 12,
  },
  aviso: {
    borderRadius: 12,
    backgroundColor: colores.fondo,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  textoAviso: {
    fontFamily: fuentes.sans[400],
    fontSize: 15,
    lineHeight: 21,
    color: colores.gris700,
  },
});
