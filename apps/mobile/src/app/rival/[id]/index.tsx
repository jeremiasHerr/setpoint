// Cómo te fue con él (F18): el historial del jugador con el rival de un partido, para mirarlo antes
// de jugar. Con ?de=, el de dos jugadores cualesquiera, elegidos desde una ficha (decisión 143).
// Usa las mismas rutas públicas que el cara a cara de la web (decisión 122).
import { cortaDe, cruceEnPalabras, type Superficie } from '@setpoint/shared';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Chip } from '../../../components/Chip';
import { Esqueleto } from '../../../components/Esqueleto';
import { useSesion } from '../../../features/auth/SesionProvider';
import { ErrorDeCarga } from '../../../features/auth/ErrorDeCarga';
import { PartidosDelCruce } from '../../../features/caraACara/PartidosDelCruce';
import { useCaraACara } from '../../../features/caraACara/useCaraACara';
import { colores, fuentes, medidas, radios, tabular } from '../../../lib/tokens';

const conMayuscula = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);

export default function ComoTeFueConEl() {
  const { id, de } = useLocalSearchParams<{ id: string; de?: string }>();
  const { perfil } = useSesion();
  // Sin ?de=, o si de es quien tiene la sesión, es su propio historial: "vos".
  const conVos = de === undefined || Number(de) === perfil?.jugador.id;
  const consulta = useCaraACara(Number(id), de === undefined ? undefined : Number(de));
  const cara = consulta.data;
  // El filtro solo achica la lista: el panel sigue con el cruce de todas las canchas (decisión 126).
  const [superficie, setSuperficie] = useState<Superficie | null>(null);
  const partidos = cara && superficie ? cara.partidos.filter((p) => p.superficie === superficie) : (cara?.partidos ?? []);

  return (
    <SafeAreaView style={estilos.pantalla}>
      <ScrollView contentContainerStyle={estilos.contenido}>
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
            {!cara ? 'Cara a cara' : conVos ? `Cómo te fue con ${cara.b.nombre}` : `${cara.a.apellido} y ${cara.b.apellido}`}
          </Text>
        </View>

        {consulta.isPending && <Esqueleto forma="tarjeta" />}
        {consulta.error && <ErrorDeCarga error={consulta.error} que="el historial" onReintentar={() => void consulta.refetch()} />}
        {cara && (
          <>
            <View style={estilos.panel}>
              <Text style={estilos.contra}>
                {cara.resumen.jugados === 0
                  ? 'Todavía no se jugaron'
                  : cara.resumen.jugados === 1
                    ? 'Se jugaron una vez'
                    : `Se jugaron ${cara.resumen.jugados} veces`}
              </Text>
              <View style={estilos.cuenta}>
                <Text style={estilos.numero}>{cara.resumen.ganadosA}</Text>
                <Text style={estilos.guion}>-</Text>
                <Text style={estilos.numero}>{cara.resumen.ganadosB}</Text>
              </View>
              <Text style={estilos.leyenda}>
                {conVos ? 'Vos' : `${cara.a.nombre} ${cara.a.apellido}`} · {cara.b.nombre} {cara.b.apellido}
              </Text>
            </View>

            {cara.resumen.walkovers > 0 && (
              <Text style={estilos.nota}>
                {cara.resumen.walkovers === 1
                  ? 'Sin contar un W.O., que no se jugó.'
                  : `Sin contar ${cara.resumen.walkovers} W.O., que no se jugaron.`}
              </Text>
            )}

            {cara.partidos.length === 0 ? (
              <Text style={estilos.nota}>
                {conVos
                  ? 'Nunca jugaron entre ustedes: este va a ser el primero. Cuando haya un resultado, el historial aparece acá.'
                  : 'Todavía no jugaron entre ellos.'}
              </Text>
            ) : (
              <>
                <Text style={estilos.subtitulo}>Partidos</Text>
                {/* Solo las superficies en las que jugaron: sin el dato del club, no hay filtro (decisión 126). */}
                {cara.porSuperficie.length > 0 && (
                  <View accessibilityLabel="Filtrar por superficie" style={estilos.filtro}>
                    <Chip texto="Todas" activo={superficie === null} onPress={() => setSuperficie(null)} />
                    {cara.porSuperficie.map((cruce) => (
                      <Chip
                        key={cruce.superficie}
                        texto={conMayuscula(cortaDe(cruce.superficie))}
                        activo={superficie === cruce.superficie}
                        onPress={() => setSuperficie(cruce.superficie)}
                      />
                    ))}
                  </View>
                )}
                <PartidosDelCruce
                  partidos={partidos}
                  apellidoJugador={conVos ? null : cara.a.apellido}
                  apellidoRival={cara.b.apellido}
                  consuelo={cara.nombreCuadroConsuelo}
                />
                {cara.porSuperficie.length > 0 && (
                  <Text style={estilos.nota}>{cruceEnPalabras(cara.porSuperficie, cara.a.apellido, cara.b.apellido)}</Text>
                )}
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.niebla },
  contenido: { paddingHorizontal: medidas.margen, paddingTop: 20, paddingBottom: 28, gap: 18 },
  encabezado: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  volver: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colores.linea,
    backgroundColor: colores.papel,
    alignItems: 'center',
    justifyContent: 'center',
  },
  apretado: { backgroundColor: colores.lineaSuave },
  flecha: {
    width: 9,
    height: 9,
    marginLeft: 4,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: colores.noche,
    transform: [{ rotate: '45deg' }],
  },
  titulo: {
    flex: 1,
    fontFamily: fuentes.display[600],
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.44,
    color: colores.noche,
  },
  panel: { backgroundColor: colores.noche, borderRadius: radios.superficie, padding: 22, gap: 12 },
  contra: { fontFamily: fuentes.sans[500], fontSize: 15, color: colores.pizarra400 },
  cuenta: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  numero: { fontFamily: fuentes.mono[500], fontSize: 48, color: colores.blanco, ...tabular },
  guion: { fontFamily: fuentes.mono[400], fontSize: 32, color: colores.pizarra400 },
  leyenda: { fontFamily: fuentes.sans[400], fontSize: 15, color: colores.pizarra400 },
  nota: { fontFamily: fuentes.sans[400], fontSize: 15, lineHeight: 22, color: colores.pizarra700 },
  filtro: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  subtitulo: { fontFamily: fuentes.sans[600], fontSize: 20, letterSpacing: -0.4, color: colores.noche },
});
