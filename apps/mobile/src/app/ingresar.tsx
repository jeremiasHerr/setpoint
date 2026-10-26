// Ingreso del jugador con email y código: docs/pantallas/jugador/cuenta-e-ingreso.html.
// No hay contraseña ni registro: la cuenta es el email verificado (decisión 049).
import { useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Boton } from '../components/Boton';
import { Campo } from '../components/Campo';
import { CampoCodigo } from '../components/CampoCodigo';
import { Logo } from '../components/Logo';
import { usePedirCodigo, useVerificarCodigo } from '../features/auth/useIngreso';
import { ErrorApi } from '../lib/api';
import { colores, fuentes, medidas, radios, tabular } from '../lib/tokens';

function codigoDe(error: Error | null) {
  return error instanceof ErrorApi ? error.codigo : error ? 'DESCONOCIDO' : null;
}

function mensajeGeneral(codigo: string | null): string | null {
  switch (codigo) {
    case null:
      return null;
    case 'DATOS_INVALIDOS':
      return 'El email no es válido.';
    case 'DEMASIADOS_PEDIDOS':
      return 'Pediste muchos códigos seguidos. Esperá unos minutos y probá de nuevo.';
    case 'SIN_CONEXION':
      return 'No pudimos conectarnos. Revisá tu conexión y probá de nuevo.';
    case 'SIN_API_URL':
      return 'Falta EXPO_PUBLIC_API_URL en apps/mobile/.env.';
    default:
      return 'Algo salió mal. Probá de nuevo en unos minutos.';
  }
}

export default function Ingresar() {
  const pedirCodigo = usePedirCodigo();
  const verificar = useVerificarCodigo();
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [paso, setPaso] = useState<'email' | 'codigo'>('email');

  const mandarCodigo = () =>
    pedirCodigo.mutate(
      { email },
      {
        onSuccess: () => {
          setCodigo('');
          verificar.reset();
          setPaso('codigo');
        },
      },
    );

  const confirmar = (valor = codigo) => verificar.mutate({ email, codigo: valor });

  const cambiarEmail = () => {
    setCodigo('');
    verificar.reset();
    pedirCodigo.reset();
    setPaso('email');
  };

  const errorVerificar = codigoDe(verificar.error);

  return (
    <SafeAreaView style={estilos.pantalla}>
      <KeyboardAvoidingView style={estilos.pantalla} behavior="padding">
        <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
          <View style={estilos.marca}>
            <Logo />
            <Text style={estilos.nombreMarca}>SetPoint</Text>
          </View>

          {paso === 'email' && (
            <>
              <View style={estilos.encabezado}>
                <Text style={estilos.titulo}>Ingresar</Text>
                <Text style={estilos.bajada}>Con tu email. Te mandamos un código: no hay contraseña.</Text>
              </View>

              <Campo
                rotulo="Tu email"
                placeholder="tu@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="go"
                onSubmitEditing={mandarCodigo}
              />
              <Text style={estilos.texto}>El mismo con el que te inscribiste.</Text>

              <Aviso mensaje={mensajeGeneral(codigoDe(pedirCodigo.error))} />

              <Boton
                texto={pedirCodigo.isPending ? 'Mandando…' : 'Mandarme el código'}
                variante="organizador"
                onPress={mandarCodigo}
                disabled={pedirCodigo.isPending}
              />

              <View style={estilos.caja}>
                <Text style={estilos.tituloCaja}>¿Todavía no te inscribiste?</Text>
                <Text style={estilos.textoCaja}>
                  Tu cuenta se crea con tu primera inscripción, desde el link del torneo que comparte tu organización.
                </Text>
              </View>

              <Text style={[estilos.texto, estilos.pie]}>¿Administrás un circuito? Entrá por la web, con tu contraseña.</Text>
            </>
          )}

          {paso === 'codigo' && (errorVerificar === 'CODIGO_VENCIDO' || errorVerificar === 'DEMASIADOS_INTENTOS') && (
            <>
              <View style={estilos.encabezado}>
                {errorVerificar === 'CODIGO_VENCIDO' && <Text style={estilos.vencio}>venció</Text>}
                <Text style={estilos.titulo}>
                  {errorVerificar === 'CODIGO_VENCIDO' ? 'Este código ya no sirve' : 'Probaste 5 veces'}
                </Text>
                <Text style={estilos.bajada}>
                  {errorVerificar === 'CODIGO_VENCIDO'
                    ? `Los códigos duran 10 minutos. Pedí uno nuevo: llega a ${email}.`
                    : 'Por seguridad, ese código dejó de servir. Pedí uno nuevo y usá el último que te llegue.'}
                </Text>
              </View>
              <CampoCodigo valor={codigo} onChange={setCodigo} apagado />
              <Aviso mensaje={mensajeGeneral(codigoDe(pedirCodigo.error))} />
              <View style={[estilos.botones, estilos.pie]}>
                <Boton
                  texto={pedirCodigo.isPending ? 'Mandando…' : 'Mandarme un código nuevo'}
                  variante="organizador"
                  onPress={mandarCodigo}
                  disabled={pedirCodigo.isPending}
                />
                <Boton texto="Cambiar el email" onPress={cambiarEmail} />
              </View>
            </>
          )}

          {paso === 'codigo' &&
            errorVerificar !== 'CODIGO_VENCIDO' &&
            errorVerificar !== 'DEMASIADOS_INTENTOS' && (
              <>
                <View style={estilos.encabezado}>
                  <Text style={estilos.titulo}>Revisá tu email</Text>
                  <Text style={estilos.bajada}>
                    Te mandamos un código de <Text style={estilos.numero}>6</Text> dígitos a{' '}
                    <Text style={estilos.email}>{email}</Text>.
                  </Text>
                </View>

                <View style={estilos.bloqueCodigo}>
                  <CampoCodigo valor={codigo} onChange={setCodigo} onCompleto={confirmar} />
                  {errorVerificar === 'CODIGO_INCORRECTO' ? (
                    <View accessibilityRole="alert" style={estilos.incorrecto}>
                      <Text style={estilos.textoIncorrecto}>
                        <Text style={estilos.fuerte}>Ese código no es. </Text>
                        {(verificar.error as ErrorApi).campos.codigo}. Revisá que sea el último que te mandamos.
                      </Text>
                    </View>
                  ) : (
                    <Text style={estilos.texto}>Vence en 10 minutos.</Text>
                  )}
                  <Aviso mensaje={errorVerificar === 'CODIGO_INCORRECTO' ? null : mensajeGeneral(errorVerificar)} />
                </View>

                <View style={estilos.enlaces}>
                  <Pressable onPress={mandarCodigo} disabled={pedirCodigo.isPending} accessibilityRole="button">
                    <Text style={estilos.enlace}>{pedirCodigo.isPending ? 'Mandando…' : 'Reenviar el código'}</Text>
                  </Pressable>
                  <Pressable onPress={cambiarEmail} accessibilityRole="button">
                    <Text style={[estilos.enlace, estilos.enlaceGris]}>Cambiar el email</Text>
                  </Pressable>
                </View>

                <View style={estilos.caja}>
                  <Text style={estilos.textoCaja}>¿No te llegó? Fijate en spam o en correo no deseado. Puede tardar un minuto.</Text>
                </View>

                <View style={estilos.pie}>
                  <Boton
                    texto={verificar.isPending ? 'Entrando…' : 'Entrar'}
                    variante="organizador"
                    onPress={() => confirmar()}
                    disabled={verificar.isPending || codigo.length < 6}
                  />
                </View>
              </>
            )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// El rojo es solo para vencimientos (design.md §3): los errores van en gris sobre fondo.
function Aviso({ mensaje }: { mensaje: string | null }) {
  if (!mensaje) return null;
  return (
    <View accessibilityRole="alert" style={estilos.error}>
      <Text style={estilos.textoError}>{mensaje}</Text>
    </View>
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
    fontSize: 15,
    color: colores.negro,
  },
  encabezado: {
    gap: 8,
    paddingTop: 8,
  },
  titulo: {
    fontFamily: fuentes.sans[600],
    fontSize: 28,
    letterSpacing: -0.9,
    color: colores.negro,
  },
  bajada: {
    fontFamily: fuentes.sans[400],
    fontSize: 16,
    lineHeight: 23,
    color: colores.gris500,
  },
  numero: {
    fontFamily: fuentes.mono[400],
    ...tabular,
  },
  email: {
    fontFamily: fuentes.sans[500],
    color: colores.negro,
  },
  vencio: {
    alignSelf: 'flex-start',
    fontFamily: fuentes.mono[500],
    fontSize: 15,
    color: colores.rojoTexto,
    backgroundColor: colores.rojoFondo,
    borderColor: colores.rojoLinea,
    borderWidth: 1,
    borderRadius: radios.chip,
    paddingHorizontal: 12,
    paddingVertical: 5,
    overflow: 'hidden',
  },
  bloqueCodigo: {
    gap: 12,
  },
  incorrecto: {
    borderWidth: 1,
    borderColor: colores.negro,
    borderRadius: radios.control,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  textoIncorrecto: {
    fontFamily: fuentes.sans[400],
    fontSize: 15,
    lineHeight: 21,
    color: colores.negro,
  },
  fuerte: {
    fontFamily: fuentes.sans[600],
  },
  enlaces: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  enlace: {
    fontFamily: fuentes.sans[500],
    fontSize: 15,
    color: colores.negro,
    textDecorationLine: 'underline',
  },
  enlaceGris: {
    color: colores.gris500,
  },
  error: {
    backgroundColor: colores.fondo,
    borderRadius: radios.control,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  textoError: {
    fontFamily: fuentes.sans[500],
    fontSize: 15,
    lineHeight: 21,
    color: colores.gris700,
  },
  caja: {
    backgroundColor: colores.fondo,
    borderRadius: radios.control,
    padding: 16,
    gap: 6,
  },
  tituloCaja: {
    fontFamily: fuentes.sans[600],
    fontSize: 15,
    color: colores.negro,
  },
  textoCaja: {
    fontFamily: fuentes.sans[400],
    fontSize: 15,
    lineHeight: 22,
    color: colores.gris700,
  },
  texto: {
    fontFamily: fuentes.sans[400],
    fontSize: 15,
    lineHeight: 22,
    color: colores.gris500,
  },
  botones: {
    gap: 12,
  },
  pie: {
    marginTop: 'auto',
    textAlign: 'center',
  },
});
