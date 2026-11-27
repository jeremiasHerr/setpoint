// Cargar el resultado (decisión 127). El jugador anota cómo terminó su partido y se lo manda al
// rival para que lo confirme: hasta entonces no cuenta. Sigue el estilo de Anotar la fecha
// (docs/pantallas/jugador/anotar-fecha.html), que es el mismo ida y vuelta.
import type { CargaDelResultado, DatosResultadoDelJugador } from '@setpoint/shared';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Boton } from '../../../components/Boton';
import { Chip } from '../../../components/Chip';
import { Esqueleto } from '../../../components/Esqueleto';
import { ErrorDeCarga } from '../../../features/auth/ErrorDeCarga';
import { GrillaDeSets } from '../../../features/resultado/GrillaDeSets';
import { filaVacia, problemaDelResultado, setsParaMandar, type FilaDeSet } from '../../../features/resultado/sets';
import { useCargaDelResultado, useCargarResultado } from '../../../features/resultado/useResultado';
import { ErrorApi } from '../../../lib/api';
import { colores, fuentes, medidas, radios } from '../../../lib/tokens';

export default function CargarResultado() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const consulta = useCargaDelResultado(Number(id));
  const carga = consulta.data;

  return (
    <SafeAreaView style={estilos.pantalla}>
      <KeyboardAvoidingView style={estilos.pantalla} behavior="padding">
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
            <Text style={estilos.titulo} accessibilityRole="header">
              Cargar el resultado
            </Text>
          </View>

          {consulta.isPending && <Esqueleto forma="tarjeta" />}
          {consulta.error && !carga && (
            <ErrorDeCarga error={consulta.error} que="el partido" onReintentar={() => void consulta.refetch()} />
          )}
          {carga && <Contenido carga={carga} recargar={() => void consulta.refetch()} />}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Por qué no puede cargarlo, en lugar del formulario.
function porQueNo(carga: CargaDelResultado) {
  const { partido } = carga;
  const rival = partido.rival?.nombre ?? 'tu rival';
  if (partido.resultado) return `Este partido ya tiene resultado: ${partido.resultado.marcador}. Si está mal, pedile a la organización que lo corrija.`;
  const propuesta = partido.resultadoPropuesto;
  if (propuesta?.cargadoPor === 'rival' && propuesta.estado === 'pendiente') {
    return `${rival} ya cargó ${propuesta.marcador}. Confirmalo o decí que no fue así desde Cuándo juego.`;
  }
  if (!partido.rival) return 'Todavía no se sabe quién es tu rival en este partido.';
  return 'En este circuito los resultados los carga la organización.';
}

function Contenido({ carga, recargar }: { carga: CargaDelResultado; recargar: () => void }) {
  const { partido } = carga;
  return (
    <>
      {partido.rival && (
        <View style={estilos.tarjeta}>
          <Text style={estilos.nombreRival} numberOfLines={1}>
            {partido.rival.nombre} {partido.rival.apellido}
          </Text>
          <Text style={estilos.instancia}>{partido.instancia}</Text>
        </View>
      )}
      {partido.puedeCargarResultado && partido.rival ? (
        <Formulario carga={carga} rival={partido.rival} recargar={recargar} />
      ) : (
        <View style={estilos.aviso}>
          <Text style={estilos.textoAviso}>{porQueNo(carga)}</Text>
        </View>
      )}
    </>
  );
}

const MENSAJES: Record<string, string> = {
  EL_RIVAL_YA_CARGO_EL_RESULTADO: 'Tu rival cargó el resultado mientras lo escribías. Confirmalo desde Cuándo juego.',
  PARTIDO_CON_RESULTADO: 'El partido ya tiene resultado: lo cargó la organización.',
  LA_ORGANIZACION_CARGA_LOS_RESULTADOS: 'En este circuito los resultados los carga la organización.',
  SIN_CONEXION: 'No pudimos conectarnos. Revisá tu conexión y probá de nuevo.',
};

type Rival = NonNullable<CargaDelResultado['partido']['rival']>;

function Formulario({ carga, rival, recargar }: { carga: CargaDelResultado; rival: Rival; recargar: () => void }) {
  const { sistema, esA, yo, partido } = carga;
  const mandar = useCargarResultado(partido.id);
  const [tipo, setTipo] = useState<'jugado' | 'abandono'>('jugado');
  const [filas, setFilas] = useState<FilaDeSet[]>(() => Array.from({ length: sistema.setsPorPartido }, filaVacia));
  const [siguio, setSiguio] = useState<number | null>(null);

  const sets = setsParaMandar(sistema, filas, esA);
  const datos: DatosResultadoDelJugador | null =
    tipo === 'jugado' ? (sets ? { tipo, sets } : null) : siguio !== null ? { tipo, ganadorId: siguio } : null;
  const problema = datos ? problemaDelResultado(sistema, datos) : null;

  const error = mandar.error instanceof ErrorApi ? mandar.error : null;
  const mensaje = error ? (MENSAJES[error.codigo] ?? Object.values(error.campos)[0] ?? 'No pudimos mandar el resultado. Probá de nuevo.') : null;
  const mio = partido.resultadoPropuesto?.cargadoPor === 'yo' && partido.resultadoPropuesto.estado === 'pendiente' ? partido.resultadoPropuesto : null;

  function cambiarFila(indice: number, cambio: Partial<FilaDeSet>) {
    setFilas((actuales) => actuales.map((fila, i) => (i === indice ? { ...fila, ...cambio } : fila)));
  }

  function enviar() {
    if (!datos || problema) return;
    mandar.mutate(datos, {
      onSuccess: () => router.back(),
      // Si el partido cambió (el rival cargó otro, la organización lo cerró), se ve cómo quedó.
      onError: (e) => {
        if (e instanceof ErrorApi && !Object.keys(e.campos).length) recargar();
      },
    });
  }

  return (
    <>
      {mio && (
        <View style={estilos.aviso}>
          <Text style={estilos.textoAviso}>
            Ya le mandaste {mio.marcador} y {rival.nombre} todavía no lo confirmó. Si lo cargás de nuevo, va a ver el nuevo.
          </Text>
        </View>
      )}

      <View style={estilos.seccion}>
        <Text style={estilos.pregunta}>¿Cómo terminó?</Text>
        <View style={estilos.opciones}>
          <Chip texto="Se jugó" activo={tipo === 'jugado'} onPress={() => setTipo('jugado')} />
          <Chip texto="Hubo abandono" activo={tipo === 'abandono'} onPress={() => setTipo('abandono')} />
        </View>
      </View>

      {tipo === 'jugado' ? (
        <View style={estilos.seccion}>
          <Text style={estilos.pregunta}>Los games de cada set</Text>
          <GrillaDeSets sistema={sistema} filas={filas} rival={rival.nombre} onCambiar={cambiarFila} />
          {problema && <Text style={estilos.error}>{problema}</Text>}
        </View>
      ) : (
        <View style={estilos.seccion}>
          <Text style={estilos.pregunta}>¿Quién siguió jugando?</Text>
          <View style={estilos.opciones}>
            <Chip texto="Yo" activo={siguio === yo.jugadorId} onPress={() => setSiguio(yo.jugadorId)} />
            <Chip texto={rival.nombre} activo={siguio === rival.jugadorId} onPress={() => setSiguio(rival.jugadorId)} />
          </View>
          <Text style={estilos.ayuda}>Cuenta 6-0 6-0 para quien siguió, como un W.O. El W.O. lo da la organización.</Text>
        </View>
      )}

      <View style={estilos.pie}>
        <View style={estilos.aviso}>
          <Text style={estilos.textoAviso}>
            No cuenta hasta que {rival.nombre} lo confirme. Si no tiene la app, lo confirma la organización.
          </Text>
        </View>
        {mensaje && <Text style={estilos.error}>{mensaje}</Text>}
        <Boton
          texto={mandar.isPending ? 'Mandando…' : `Mandar a ${rival.nombre} para que confirme`}
          variante="principal"
          disabled={!datos || problema !== null || mandar.isPending}
          onPress={enviar}
        />
      </View>
    </>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.niebla },
  contenido: { flexGrow: 1, paddingHorizontal: medidas.margen, paddingTop: 20, paddingBottom: 28, gap: 22 },
  encabezado: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  volver: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colores.linea,
    backgroundColor: colores.papel,
    alignItems: 'center',
    justifyContent: 'center',
  },
  apretado: { backgroundColor: colores.lineaSuave },
  // Un ángulo hecho con dos bordes, apuntando a la izquierda, como en Anotar la fecha.
  flecha: {
    width: 9,
    height: 9,
    marginLeft: 4,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: colores.noche,
    transform: [{ rotate: '45deg' }],
  },
  titulo: { fontFamily: fuentes.display[600], fontSize: 20, letterSpacing: -0.4, color: colores.noche },
  tarjeta: {
    borderWidth: 1,
    backgroundColor: colores.papel,
    borderColor: colores.linea,
    borderRadius: radios.tarjeta,
    paddingVertical: 16,
    paddingHorizontal: 18,
    gap: 4,
  },
  nombreRival: { fontFamily: fuentes.sans[600], fontSize: 20, letterSpacing: -0.5, color: colores.noche },
  instancia: { fontFamily: fuentes.mono[400], fontSize: 13, color: colores.pizarra500 },
  seccion: { gap: 11 },
  pregunta: { fontFamily: fuentes.sans[600], fontSize: 16, color: colores.noche },
  opciones: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ayuda: { fontFamily: fuentes.sans[400], fontSize: 14, lineHeight: 20, color: colores.pizarra500 },
  error: { fontFamily: fuentes.sans[500], fontSize: 15, lineHeight: 21, color: colores.noche },
  pie: { marginTop: 'auto', gap: 12 },
  aviso: { borderRadius: 12, backgroundColor: colores.niebla, paddingVertical: 14, paddingHorizontal: 16 },
  textoAviso: { fontFamily: fuentes.sans[400], fontSize: 15, lineHeight: 21, color: colores.pizarra700 },
});
