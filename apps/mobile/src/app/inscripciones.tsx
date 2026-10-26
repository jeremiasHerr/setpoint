// Inscripciones en curso: docs/pantallas/jugador/inscripciones-en-curso.html, estados 1 a 5. Lo que
// ve quien todavía no juega en ningún circuito (decisión 054): su perfil pendiente no es un circuito,
// pero sí ve en qué quedó su inscripción. Cuando se confirma el pago, el circuito aparece y la app
// pasa sola al inicio.
import type { AvisoDeInscripcion, InscripcionEnCurso } from '@setpoint/shared';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Boton } from '../components/Boton';
import { Logo } from '../components/Logo';
import { ErrorDeCarga } from '../features/auth/ErrorDeCarga';
import { useSesion } from '../features/auth/SesionProvider';
import { Marca, Reloj, Vence } from '../features/cuenta/piezas';
import { Pagar } from '../features/cuenta/Pagar';
import { colores, fuentes, medidas, radios } from '../lib/tokens';

export default function Inscripciones() {
  const { sesion, cuenta, avisos, descartarAviso, cerrarSesion } = useSesion();
  if (!sesion) return null;

  const aviso = avisos[0];
  const enCurso = cuenta.data?.enCurso ?? [];

  return (
    <SafeAreaView style={estilos.pantalla}>
      <ScrollView
        contentContainerStyle={estilos.contenido}
        refreshControl={<RefreshControl refreshing={cuenta.isRefetching} onRefresh={() => void cuenta.refetch()} />}
      >
        <View style={estilos.marca}>
          <Logo />
          <Text style={estilos.nombreMarca}>SetPoint</Text>
        </View>

        {cuenta.isPending && <Text style={estilos.texto}>Cargando tus inscripciones…</Text>}
        {cuenta.error && !cuenta.data && <ErrorDeCarga error={cuenta.error} que="tus inscripciones" />}

        {cuenta.data &&
          (aviso ? (
            <AvisoUnico aviso={aviso} onEntendido={() => descartarAviso(aviso.inscripcionId)} />
          ) : enCurso.length > 0 ? (
            <>
              <View style={estilos.encabezado}>
                <Text style={estilos.titulo}>Tus inscripciones</Text>
                <Text style={estilos.bajada}>
                  Todavía no jugás en ningún circuito. Cuando se confirme una inscripción, el circuito aparece acá.
                </Text>
              </View>
              {enCurso.map((inscripcion) => (
                <Tarjeta key={inscripcion.inscripcionId} inscripcion={inscripcion} />
              ))}
            </>
          ) : (
            <>
              <View style={[estilos.encabezado, estilos.encabezadoVacio]}>
                <Text style={estilos.titulo}>Todavía no jugás en ningún circuito</Text>
                <Text style={estilos.bajada}>
                  Inscribite desde el link que comparte tu organización. Cuando se confirme la inscripción, entrás a tu circuito
                  desde acá, con este mismo email.
                </Text>
              </View>
              <View style={estilos.caja}>
                <Text style={estilos.textoCaja}>
                  Mirar el ranking, las zonas y los cuadros no necesita cuenta: se abren desde el link que comparte la organización.
                </Text>
              </View>
            </>
          ))}

        {/* El aviso único termina en "Entendido": no lleva "Cerrar sesión" abajo. */}
        {!(cuenta.data && aviso) && (
          <View style={estilos.pie}>
            <Boton texto="Cerrar sesión" onPress={cerrarSesion} />
            <Text style={estilos.cuenta}>Entraste como {sesion.usuario.email}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// 1 a 3 · Una inscripción en curso: en revisión, aprobada o reservando.
function Tarjeta({ inscripcion }: { inscripcion: InscripcionEnCurso }) {
  return (
    <View style={estilos.tarjeta}>
      <Marca estado={inscripcion.estado} />
      <View style={estilos.datos}>
        <Text style={estilos.edicion}>
          {inscripcion.torneo} · {inscripcion.categoria}
        </Text>
        <Text style={estilos.circuito}>{inscripcion.organizacion.nombre}</Text>
      </View>

      {inscripcion.estado === 'solicitada' && (
        <Text style={estilos.textoTarjeta}>Tu solicitud está en revisión. Te avisamos cuando la organización la apruebe.</Text>
      )}
      {inscripcion.estado === 'aprobada' && (
        <>
          <Text style={estilos.textoTarjeta}>La organización aprobó tu solicitud. Pagá para confirmar tu lugar.</Text>
          <Pagar inscripcion={inscripcion} />
          <View style={estilos.reloj}>
            <Reloj />
            <Text style={estilos.textoReloj}>Te guardamos el lugar unos minutos desde que tocás Pagar.</Text>
          </View>
        </>
      )}
      {inscripcion.estado === 'reservando' && (
        <>
          {inscripcion.reservaVence && (
            <Text style={estilos.textoTarjeta}>
              Tenés un lugar reservado hasta las <Vence iso={inscripcion.reservaVence} />.
            </Text>
          )}
          <Pagar inscripcion={inscripcion} />
        </>
      )}
    </View>
  );
}

// 5 · Una solicitud no aprobada o una reserva vencida, una sola vez.
function AvisoUnico({ aviso, onEntendido }: { aviso: AvisoDeInscripcion; onEntendido: () => void }) {
  const torneo = `${aviso.torneo} · ${aviso.categoria}`;
  return (
    <>
      <View style={[estilos.encabezado, estilos.encabezadoVacio]}>
        <Text style={estilos.titulo}>
          {aviso.motivo === 'no_aprobada' ? 'La organización no aprobó tu solicitud' : 'Venció tu reserva'}
        </Text>
        <Text style={estilos.bajada}>
          {aviso.motivo === 'no_aprobada'
            ? `Para ${torneo}, de ${aviso.organizacion.nombre}. No tenés que hacer nada más: no se te cobró.`
            : `En ${torneo}, de ${aviso.organizacion.nombre}. No llegaste a pagar a tiempo y el lugar se liberó. Si quedan lugares, podés inscribirte de nuevo desde el link del torneo.`}
        </Text>
      </View>
      <View style={estilos.pie}>
        <Boton texto="Entendido" variante="organizador" onPress={onEntendido} />
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
    fontSize: 16,
    letterSpacing: -0.24,
    color: colores.negro,
  },
  encabezado: {
    gap: 10,
    paddingTop: 10,
  },
  encabezadoVacio: {
    gap: 12,
    paddingTop: 40,
  },
  titulo: {
    fontFamily: fuentes.sans[600],
    fontSize: 30,
    lineHeight: 33,
    letterSpacing: -0.96,
    color: colores.negro,
  },
  bajada: {
    fontFamily: fuentes.sans[400],
    fontSize: 16,
    lineHeight: 23,
    color: colores.gris500,
  },
  tarjeta: {
    borderWidth: 1,
    borderColor: colores.linea,
    borderRadius: radios.tarjeta,
    padding: 18,
    gap: 14,
  },
  datos: {
    gap: 4,
  },
  edicion: {
    fontFamily: fuentes.sans[600],
    fontSize: 22,
    letterSpacing: -0.55,
    color: colores.negro,
  },
  circuito: {
    fontFamily: fuentes.sans[400],
    fontSize: 15,
    color: colores.gris500,
  },
  textoTarjeta: {
    fontFamily: fuentes.sans[400],
    fontSize: 16,
    lineHeight: 23,
    color: colores.gris700,
  },
  reloj: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  textoReloj: {
    flex: 1,
    fontFamily: fuentes.sans[400],
    fontSize: 15,
    lineHeight: 21,
    color: colores.gris500,
  },
  caja: {
    backgroundColor: colores.fondo,
    borderRadius: radios.control,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  textoCaja: {
    fontFamily: fuentes.sans[400],
    fontSize: 15,
    lineHeight: 21,
    color: colores.gris700,
  },
  texto: {
    fontFamily: fuentes.sans[400],
    fontSize: 15,
    lineHeight: 22,
    color: colores.gris700,
  },
  pie: {
    marginTop: 'auto',
    gap: 12,
  },
  cuenta: {
    fontFamily: fuentes.sans[400],
    fontSize: 15,
    color: colores.gris500,
    textAlign: 'center',
  },
});
