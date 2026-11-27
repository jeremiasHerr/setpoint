// Los circuitos en los que juega y "Cerrar sesión" (decisión 040). Sirve para elegir al entrar,
// si juega en varios, y como menú desde el encabezado. No tiene pantalla de referencia: está armada
// con los componentes de design.md.
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Boton } from '../components/Boton';
import { Logo } from '../components/Logo';
import { useSesion } from '../features/auth/SesionProvider';
import { useGuardarTelefono, useMisPartidos } from '../features/partidos/useMisPartidos';
import { colores, fuentes, medidas, radios } from '../lib/tokens';

export default function Circuitos() {
  const { sesion, perfiles, perfil, elegirCircuito, cerrarSesion } = useSesion();
  if (!sesion) return null;

  const eligiendo = perfil === null;
  const titulo = eligiendo ? '¿A qué circuito entrás?' : perfiles.length > 1 ? 'Tus circuitos' : 'Tu circuito';

  async function elegir(jugadorId: number) {
    await elegirCircuito(jugadorId);
    // Desde el encabezado se vuelve atrás; al entrar, no hay atrás y va al inicio.
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }

  return (
    <SafeAreaView style={estilos.pantalla}>
      <ScrollView contentContainerStyle={estilos.contenido}>
        <View style={estilos.marca}>
          <Logo />
          <Text style={estilos.nombreMarca}>Setpoint</Text>
        </View>

        <View style={estilos.encabezado}>
          <Text style={estilos.titulo}>{titulo}</Text>
          {eligiendo && (
            <Text style={estilos.bajada}>
              Jugás en {perfiles.length}. Después podés cambiar tocando el nombre del circuito, arriba de todo.
            </Text>
          )}
        </View>

        <View style={estilos.lista}>
          {perfiles.map(({ jugador, organizacion }, i) => {
            const actual = perfil?.jugador.id === jugador.id;
            return (
              <Pressable
                key={jugador.id}
                accessibilityRole="button"
                accessibilityState={{ selected: actual }}
                onPress={() => elegir(jugador.id)}
                style={({ pressed }) => [estilos.fila, i > 0 && estilos.separador, pressed && estilos.filaApretada]}
              >
                {/* El verde marca dónde estás vos (design.md §2). */}
                <View style={[estilos.punto, actual && estilos.puntoActual]} />
                <View style={estilos.datos}>
                  <Text style={estilos.circuito}>{organizacion.nombre}</Text>
                  <Text style={estilos.categoria}>{jugador.categoria?.nombre ?? 'Sin categoría'}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Si sus rivales ven su teléfono (decisión 128). Solo con un circuito elegido y el teléfono en el padrón. */}
        {perfil && <Telefono />}

        <View style={estilos.pie}>
          <Boton texto="Cerrar sesión" onPress={cerrarSesion} />
          <Text style={estilos.cuenta}>Entraste como {sesion.usuario.email}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Telefono() {
  const consulta = useMisPartidos();
  const guardar = useGuardarTelefono();
  const telefono = consulta.data?.miTelefono;
  if (!telefono?.cargado) return null;
  // Sin elegir todavía, se muestra, como antes del aviso.
  const visible = telefono.mostrar !== false;

  return (
    <View style={estilos.telefono}>
      <Text style={estilos.circuito}>Tu teléfono</Text>
      <Text style={estilos.categoria}>
        {visible
          ? 'Lo ven tus rivales de partidos por jugar, para escribirte por WhatsApp.'
          : 'Tus rivales no lo ven: te tienen que encontrar por otro lado o por la organización.'}
      </Text>
      <Boton
        texto={guardar.isPending ? 'Guardando…' : visible ? 'No mostrar mi teléfono' : 'Mostrar mi teléfono'}
        disabled={guardar.isPending}
        onPress={() => guardar.mutate({ mostrar: !visible })}
      />
      {guardar.error && <Text style={estilos.error}>No pudimos guardar el cambio. Probá de nuevo.</Text>}
    </View>
  );
}

const estilos = StyleSheet.create({
  telefono: {
    borderWidth: 1,
    backgroundColor: colores.papel,
    borderColor: colores.linea,
    borderRadius: radios.tarjeta,
    padding: 16,
    gap: 8,
  },
  error: {
    fontFamily: fuentes.sans[500],
    fontSize: 15,
    lineHeight: 21,
    color: colores.noche,
  },
  pantalla: {
    flex: 1,
    backgroundColor: colores.niebla,
  },
  contenido: {
    flexGrow: 1,
    paddingHorizontal: medidas.margen,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 20,
  },
  marca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  nombreMarca: {
    fontFamily: fuentes.sans[600],
    fontSize: 15,
    color: colores.noche,
  },
  encabezado: {
    gap: 8,
    paddingTop: 8,
  },
  titulo: {
    fontFamily: fuentes.display[600],
    fontSize: 28,
    letterSpacing: -0.56,
    color: colores.noche,
  },
  bajada: {
    fontFamily: fuentes.sans[400],
    fontSize: 16,
    lineHeight: 23,
    color: colores.pizarra500,
  },
  lista: {
    borderWidth: 1,
    backgroundColor: colores.papel,
    borderColor: colores.linea,
    borderRadius: radios.tarjeta,
    overflow: 'hidden',
  },
  fila: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  separador: {
    borderTopWidth: 1,
    borderTopColor: colores.lineaSuave,
  },
  filaApretada: {
    backgroundColor: colores.niebla,
  },
  punto: {
    width: 7,
    height: 7,
    borderRadius: radios.chip,
    backgroundColor: colores.linea,
  },
  puntoActual: {
    backgroundColor: colores.lonaTexto,
  },
  datos: {
    flex: 1,
    gap: 2,
  },
  circuito: {
    fontFamily: fuentes.sans[500],
    fontSize: 17,
    color: colores.noche,
  },
  categoria: {
    fontFamily: fuentes.sans[400],
    fontSize: 15,
    color: colores.pizarra500,
  },
  pie: {
    marginTop: 'auto',
    gap: 12,
  },
  cuenta: {
    fontFamily: fuentes.sans[400],
    fontSize: 15,
    color: colores.pizarra500,
    textAlign: 'center',
  },
});
