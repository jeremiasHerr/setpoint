// Comparar a un jugador con otro (F18, decisión 143): desde su ficha, la lista de con quiénes jugó,
// con un buscador por nombre o apellido (decisión 146). Al tocar uno se abre el cara a cara de los dos. Solo los que ya se
// enfrentaron, como en la web (decisión 122): con otro no habría nada que mostrar.
import { coincideConElNombre } from '@setpoint/shared';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Campo } from '../../components/Campo';
import { Esqueleto } from '../../components/Esqueleto';
import { useSesion } from '../../features/auth/SesionProvider';
import { ErrorDeCarga } from '../../features/auth/ErrorDeCarga';
import { useRivales } from '../../features/caraACara/useCaraACara';
import { colores, fuentes, medidas, tabular } from '../../lib/tokens';

const vecesJugadas = (n: number) => (n === 1 ? '1 partido' : `${n} partidos`);

export default function Comparar() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const jugadorId = Number(id);
  const { perfil } = useSesion();
  const consulta = useRivales(jugadorId);
  const datos = consulta.data;
  const [busqueda, setBusqueda] = useState('');

  const esVos = perfil?.jugador.id === jugadorId;
  const rivales = (datos?.rivales ?? []).filter((r) => coincideConElNombre(r, busqueda));

  return (
    <SafeAreaView style={estilos.pantalla}>
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
            {esVos ? '¿Con quién te comparás?' : datos ? `¿Con quién comparás a ${datos.apellido}?` : 'Comparar'}
          </Text>
        </View>

        {consulta.isPending && <Esqueleto forma="lista" />}
        {consulta.error && <ErrorDeCarga error={consulta.error} que="los rivales" />}
        {datos &&
          (datos.rivales.length === 0 ? (
            <Text style={estilos.nota}>
              {esVos ? 'Todavía no jugaste con nadie' : `${datos.apellido} todavía no jugó con nadie`}: cuando haya un resultado, vas a
              poder comparar acá.
            </Text>
          ) : (
            <>
              <Text style={estilos.nota}>
                {esVos ? 'Las personas con las que jugaste' : `Las personas con las que jugó ${datos.nombre}`}, de la que más
                veces a la que menos.
              </Text>
              <Campo
                rotulo="Buscar por nombre o apellido"
                value={busqueda}
                onChangeText={setBusqueda}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="search"
              />
              {rivales.length === 0 ? (
                <Text style={estilos.nota}>Ningún rival se llama así.</Text>
              ) : (
                <View>
                  {rivales.map((rival) => (
                    <Pressable
                      key={rival.jugadorId}
                      accessibilityRole="button"
                      accessibilityLabel={`Comparar con ${rival.nombre} ${rival.apellido}, ${vecesJugadas(rival.partidos)}`}
                      onPress={() =>
                        router.push({ pathname: '/rival/[id]', params: { id: String(rival.jugadorId), de: String(jugadorId) } })
                      }
                      style={({ pressed }) => [estilos.fila, pressed && estilos.apretado]}
                    >
                      <View style={estilos.centro}>
                        <Text style={estilos.apellido} numberOfLines={1}>
                          {rival.apellido}
                        </Text>
                        <Text style={estilos.detalle} numberOfLines={1}>
                          {rival.nombre}
                          {rival.categoria ? ` · ${rival.categoria}` : ''}
                        </Text>
                      </View>
                      <Text style={estilos.veces}>{vecesJugadas(rival.partidos)}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </>
          ))}
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
  nota: { fontFamily: fuentes.sans[400], fontSize: 15, lineHeight: 22, color: colores.pizarra700 },
  fila: {
    minHeight: medidas.toque,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colores.lineaSuave,
  },
  centro: { flex: 1, gap: 2 },
  apellido: { fontFamily: fuentes.sans[500], fontSize: 16, color: colores.noche },
  detalle: { fontFamily: fuentes.sans[400], fontSize: 12, color: colores.pizarra500 },
  veces: { fontFamily: fuentes.mono[400], fontSize: 14, color: colores.pizarra700, ...tabular },
});
