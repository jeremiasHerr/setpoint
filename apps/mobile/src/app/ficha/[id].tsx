// Ficha del jugador en la app (F17): docs/pantallas/publico/ficha-y-cara-a-cara.html. Usa la misma
// ruta pública que la web y se abre desde el ranking (decisión 074). Ningún dato de contacto.
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Boton } from '../../components/Boton';
import { Esqueleto } from '../../components/Esqueleto';
import { useSesion } from '../../features/auth/SesionProvider';
import { PartidosDeLaFicha } from '../../features/ficha/PartidosDeLaFicha';
import { PuntosPorTorneo } from '../../features/ficha/PuntosPorTorneo';
import { RecordDeLaFicha } from '../../features/ficha/RecordDeLaFicha';
import { cantidadDePuntos } from '../../features/ficha/textos';
import { TorneosDeLaFicha } from '../../features/ficha/TorneosDeLaFicha';
import { useFicha } from '../../features/ficha/useFicha';
import { ErrorApi } from '../../lib/api';
import { colores, fuentes, medidas, tabular } from '../../lib/tokens';

function mensajeDeError(error: Error) {
  if (error instanceof ErrorApi && error.codigo === 'SIN_CONEXION') return 'No pudimos conectarnos. Revisá tu conexión y probá de nuevo.';
  if (error instanceof ErrorApi && error.codigo === 'JUGADOR_NO_ENCONTRADO') return 'No encontramos a ese jugador.';
  return 'No pudimos cargar la ficha. Probá de nuevo en unos minutos.';
}

export default function Ficha() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { perfil } = useSesion();
  const consulta = useFicha(perfil?.organizacion.slug ?? '', id);
  const ficha = consulta.data;

  return (
    <SafeAreaView style={estilos.pantalla}>
      <ScrollView
        contentContainerStyle={estilos.contenido}
        refreshControl={
          <RefreshControl
            refreshing={consulta.isRefetching}
            onRefresh={() => {
              consulta.refetch();
            }}
          />
        }
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={() => router.back()}
          hitSlop={8}
          style={({ pressed }) => [estilos.volver, pressed && estilos.apretado]}
        >
          <View style={estilos.flecha} />
        </Pressable>

        {consulta.isPending && <Esqueleto forma="lista" />}
        {consulta.error && <Text style={estilos.aviso}>{mensajeDeError(consulta.error)}</Text>}
        {ficha && (
          <>
            <View style={estilos.cabecera}>
              <Text style={estilos.nombre}>
                {ficha.nombre} {ficha.apellido}
              </Text>
              {(ficha.categoria || ficha.ranking) && (
                <View style={estilos.pildoras}>
                  {ficha.categoria && <Text style={estilos.pildora}>{ficha.categoria}</Text>}
                  {ficha.ranking && (
                    <Text style={estilos.pildora}>
                      {ficha.ranking.puesto}º · {cantidadDePuntos(ficha.ranking.puntos)}
                    </Text>
                  )}
                </View>
              )}
            </View>
            {/* En la ficha de otro, su historial con quien la abre (F18). En la propia, no. */}
            {perfil && perfil.jugador.id !== ficha.jugadorId && (
              <Boton
                texto={`Cómo te fue con ${ficha.nombre}`}
                onPress={() => router.push({ pathname: '/rival/[id]', params: { id: String(ficha.jugadorId) } })}
              />
            )}
            {/* En cualquier ficha, también la propia: con quién jugó, para comparar (decisión 143). */}
            <Boton
              texto="Comparar con otro jugador"
              variante="secundario"
              onPress={() => router.push({ pathname: '/comparar/[id]', params: { id: String(ficha.jugadorId) } })}
            />
            <RecordDeLaFicha record={ficha.record} />
            {ficha.ranking && <PuntosPorTorneo ranking={ficha.ranking} />}
            <TorneosDeLaFicha torneos={ficha.torneos} consuelo={ficha.nombreCuadroConsuelo} />
            {/* Sin torneos no hay partidos: con el aviso de Torneos alcanza. */}
            {ficha.torneos.length > 0 && (
              <PartidosDeLaFicha jugadorId={ficha.jugadorId} partidos={ficha.partidos} consuelo={ficha.nombreCuadroConsuelo} />
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.niebla },
  contenido: { paddingHorizontal: medidas.margen, paddingTop: 20, paddingBottom: 28, gap: 22 },
  aviso: { fontFamily: fuentes.sans[400], fontSize: 15, lineHeight: 22, color: colores.pizarra700 },
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
  // Un ángulo hecho con dos bordes, apuntando a la izquierda.
  flecha: {
    width: 9,
    height: 9,
    marginLeft: 4,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: colores.noche,
    transform: [{ rotate: '45deg' }],
  },
  cabecera: { gap: 8 },
  nombre: { fontFamily: fuentes.display[600], fontSize: 28, lineHeight: 31, letterSpacing: -0.6, color: colores.noche },
  pildoras: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  pildora: {
    fontFamily: fuentes.mono[400],
    fontSize: 13,
    color: colores.pizarra500,
    borderWidth: 1,
    borderColor: colores.linea,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    ...tabular,
  },
});
