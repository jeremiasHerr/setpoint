// Los cuadros en la app (F11, decisión 136): una ronda a la vez, como en el celular de la web
// (decisión 038). Usa la misma ruta pública que la página de los cuadros y se abre desde Mi zona.
import type { ClaveCuadro, CuadroEliminatorio, JugadorDelCuadro, PartidoDelCuadro } from '@setpoint/shared';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Chip } from '../../components/Chip';
import { Esqueleto } from '../../components/Esqueleto';
import { useSesion } from '../../features/auth/SesionProvider';
import {
  lugaresDeLaRonda,
  marcadorDelLado,
  rondaParaAbrir,
  rotuloDelPaseDirecto,
  rotuloDeRonda,
  tieneResultado,
} from '../../features/cuadros/cuadro';
import { useCuadros } from '../../features/cuadros/useCuadros';
import { ErrorApi } from '../../lib/api';
import { diaYHora } from '../../lib/fechas';
import { colores, fuentes, medidas, radios, tabular } from '../../lib/tokens';

function mensajeDeError(error: Error) {
  if (error instanceof ErrorApi && error.codigo === 'SIN_CONEXION') return 'No pudimos conectarnos. Revisá tu conexión y probá de nuevo.';
  if (error instanceof ErrorApi && error.codigo === 'TORNEO_NO_ENCONTRADO') return 'No encontramos ese torneo.';
  return 'No pudimos cargar los cuadros. Probá de nuevo en unos minutos.';
}

export default function Cuadros() {
  const { id, cuadro: pedido } = useLocalSearchParams<{ id: string; cuadro?: ClaveCuadro }>();
  const { perfil } = useSesion();
  const consulta = useCuadros(perfil?.organizacion.slug ?? '', id);
  const datos = consulta.data;
  const [elegido, setElegido] = useState<ClaveCuadro | null>(pedido ?? null);
  const cuadro = datos?.cuadros.find((c) => c.cuadro === elegido) ?? datos?.cuadros[0];
  const nombreDe = (clave: ClaveCuadro) => (clave === 'campeonato' ? 'Campeonato' : (datos?.nombreCuadroConsuelo ?? ''));

  return (
    <SafeAreaView style={estilos.pantalla}>
      <ScrollView
        contentContainerStyle={estilos.contenido}
        refreshControl={<RefreshControl refreshing={consulta.isRefetching} onRefresh={() => void consulta.refetch()} />}
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
        {datos && (
          <View style={estilos.cabecera}>
            <Text style={estilos.titulo}>Cuadros</Text>
            <Text style={estilos.bajada}>{datos.nombre}</Text>
          </View>
        )}
        {datos && datos.cuadros.length > 1 && (
          <View style={estilos.chips}>
            {datos.cuadros.map((c) => (
              <Chip key={c.cuadro} texto={nombreDe(c.cuadro)} activo={c.cuadro === cuadro?.cuadro} onPress={() => setElegido(c.cuadro)} />
            ))}
          </View>
        )}
        {cuadro && <CuadroPorRonda key={cuadro.cuadro} cuadro={cuadro} jugadorId={perfil?.jugador.id} />}
        {datos && datos.cuadros.length === 0 && <Text style={estilos.aviso}>Este torneo todavía no tiene cuadros.</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

// Abre en la ronda donde juega o jugó por última vez quien mira; si no está, en la que se juega.
function CuadroPorRonda({ cuadro, jugadorId }: { cuadro: CuadroEliminatorio; jugadorId: number | undefined }) {
  const [ronda, setRonda] = useState(() => rondaParaAbrir(cuadro, jugadorId));
  const rondas = Array.from({ length: cuadro.rondas }, (_, i) => i + 1);

  return (
    <View style={estilos.cuadro}>
      <View style={estilos.chips}>
        {rondas.map((r) => (
          <Chip key={r} texto={rotuloDeRonda(r, cuadro.rondas)} activo={r === ronda} onPress={() => setRonda(r)} />
        ))}
      </View>
      {lugaresDeLaRonda(cuadro, ronda).map((lugar, i) =>
        lugar?.tipo === 'partido' ? (
          <TarjetaPartido key={lugar.partido.id} partido={lugar.partido} jugadorId={jugadorId} />
        ) : lugar?.tipo === 'pase' ? (
          <View key={`pase-${i}`} style={estilos.pase}>
            <Text style={estilos.paseNombre}>{lugar.jugador.apellido}</Text>
            <Text style={estilos.paseRotulo}>{rotuloDelPaseDirecto(cuadro.rondas)}</Text>
          </View>
        ) : null,
      )}
    </View>
  );
}

function TarjetaPartido({ partido, jugadorId }: { partido: PartidoDelCuadro; jugadorId: number | undefined }) {
  const jugado = tieneResultado(partido);
  const esMio = partido.jugadorA?.jugadorId === jugadorId || partido.jugadorB?.jugadorId === jugadorId;
  const pie = jugado ? null : partido.fechaAcordada ? diaYHora(partido.fechaAcordada) : partido.jugadorA && partido.jugadorB ? 'a coordinar' : null;

  return (
    <View style={[estilos.tarjeta, esMio && estilos.tarjetaMia]}>
      <Fila jugador={partido.jugadorA} gano={jugado && partido.ganadorId === partido.jugadorA?.jugadorId} marcador={marcadorDelLado(partido, 'A')} jugadorId={jugadorId} />
      <View style={estilos.separador} />
      <Fila jugador={partido.jugadorB} gano={jugado && partido.ganadorId === partido.jugadorB?.jugadorId} marcador={marcadorDelLado(partido, 'B')} jugadorId={jugadorId} />
      {pie && <Text style={estilos.pie}>{pie}</Text>}
    </View>
  );
}

function Fila({ jugador, gano, marcador, jugadorId }: { jugador: JugadorDelCuadro | null; gano: boolean; marcador: string; jugadorId: number | undefined }) {
  const vos = jugador !== null && jugador.jugadorId === jugadorId;
  return (
    <View style={estilos.fila}>
      <Text style={[estilos.nombre, !jugador && estilos.aDefinir, gano && estilos.ganador]} numberOfLines={1}>
        {jugador ? `${jugador.nombre} ${jugador.apellido}` : 'a definir'}
        {vos && <Text style={estilos.vos}> · vos</Text>}
      </Text>
      <Text style={[estilos.marcador, gano && estilos.ganador]}>{marcador}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.niebla },
  contenido: { paddingHorizontal: medidas.margen, paddingTop: 20, paddingBottom: 28, gap: 18 },
  aviso: { fontFamily: fuentes.sans[400], fontSize: 15, lineHeight: 22, color: colores.pizarra700 },
  volver: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colores.linea,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colores.papel,
  },
  apretado: { opacity: 0.6 },
  flecha: {
    width: 9,
    height: 9,
    marginLeft: 4,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: colores.noche,
    transform: [{ rotate: '45deg' }],
  },
  cabecera: { gap: 4 },
  titulo: { fontFamily: fuentes.display[600], fontSize: 30, lineHeight: 33, letterSpacing: -0.6, color: colores.noche },
  bajada: { fontFamily: fuentes.sans[400], fontSize: 15, color: colores.pizarra500 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cuadro: { gap: 12 },
  tarjeta: {
    backgroundColor: colores.papel,
    borderWidth: 1,
    borderColor: colores.linea,
    borderRadius: radios.tarjeta,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  // Su propio partido, con el borde noche: es lo que vino a buscar.
  tarjetaMia: { borderColor: colores.noche, borderWidth: 1.5 },
  separador: { height: 1, backgroundColor: colores.lineaSuave },
  fila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, minHeight: 44 },
  nombre: { flex: 1, fontFamily: fuentes.sans[400], fontSize: 16, color: colores.pizarra700 },
  aDefinir: { color: colores.pizarra400 },
  ganador: { fontFamily: fuentes.sans[600], color: colores.noche },
  vos: { fontFamily: fuentes.sans[400], fontSize: 14, color: colores.pizarra500 },
  marcador: { fontFamily: fuentes.mono[500], fontSize: 15, color: colores.pizarra500, ...tabular },
  pie: { fontFamily: fuentes.sans[400], fontSize: 13, color: colores.pizarra500, paddingBottom: 8 },
  // Quien pasa directo por un bye: tenue, sin borde de tarjeta (decisión 083).
  pase: { backgroundColor: colores.lineaSuave, borderRadius: radios.tarjeta, paddingHorizontal: 14, paddingVertical: 12, gap: 2 },
  paseNombre: { fontFamily: fuentes.sans[500], fontSize: 16, color: colores.pizarra700 },
  paseRotulo: { fontFamily: fuentes.sans[400], fontSize: 13, color: colores.pizarra500 },
});
