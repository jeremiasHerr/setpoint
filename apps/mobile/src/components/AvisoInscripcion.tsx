import type { AvisoDeInscripcion, InscripcionEnCurso } from '@setpoint/shared';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSesion } from '../features/auth/SesionProvider';
import { Pagar } from '../features/cuenta/Pagar';
import { Reloj, Vence } from '../features/cuenta/piezas';
import { colores, fuentes, radios } from '../lib/tokens';

// Estado 6 de docs/pantallas/jugador/inscripciones-en-curso.html: quien ya juega en un circuito ve
// arriba de Cuándo juego sus inscripciones en curso en otro, y una vez los avisos de una solicitud
// no aprobada o una reserva vencida (decisión 054). Borde de 1 px, sin sombra (design.md §2).
export function AvisoInscripcion() {
  const { cuenta, avisos, descartarAviso } = useSesion();
  const enCurso = cuenta.data?.enCurso ?? [];
  if (enCurso.length === 0 && avisos.length === 0) return null;

  return (
    <View style={estilos.lista}>
      {enCurso.map((inscripcion) => (
        <EnCurso key={inscripcion.inscripcionId} inscripcion={inscripcion} />
      ))}
      {avisos.map((aviso) => (
        <Terminada key={aviso.inscripcionId} aviso={aviso} onEntendido={() => descartarAviso(aviso.inscripcionId)} />
      ))}
    </View>
  );
}

function EnCurso({ inscripcion }: { inscripcion: InscripcionEnCurso }) {
  const torneo = (
    <Text style={estilos.fuerte}>
      {inscripcion.torneo} · {inscripcion.categoria}
    </Text>
  );
  return (
    <View style={estilos.aviso}>
      <View style={estilos.fila}>
        <Reloj />
        <Text style={estilos.texto}>
          {inscripcion.estado === 'solicitada' && <>Tu solicitud para {torneo} está en revisión.</>}
          {inscripcion.estado === 'aprobada' && <>Te aprobaron la solicitud para {torneo}. Pagá para confirmar tu lugar.</>}
          {inscripcion.estado === 'reservando' && (
            <>
              Tenés un lugar reservado en {torneo}
              {inscripcion.reservaVence && (
                <>
                  {' '}
                  hasta las <Vence iso={inscripcion.reservaVence} />
                </>
              )}
              .
            </>
          )}
        </Text>
      </View>
      {inscripcion.estado !== 'solicitada' && <Pagar inscripcion={inscripcion} />}
    </View>
  );
}

function Terminada({ aviso, onEntendido }: { aviso: AvisoDeInscripcion; onEntendido: () => void }) {
  const torneo = (
    <Text style={estilos.fuerte}>
      {aviso.torneo} · {aviso.categoria}
    </Text>
  );
  return (
    <View style={estilos.aviso}>
      <Text style={estilos.texto}>
        {aviso.motivo === 'no_aprobada' ? (
          <>La organización no aprobó tu solicitud para {torneo}. No se te cobró.</>
        ) : (
          <>Venció tu reserva en {torneo}. El lugar se liberó y no se te cobró.</>
        )}
      </Text>
      <Pressable accessibilityRole="button" onPress={onEntendido} hitSlop={12} style={estilos.entendido}>
        <Text style={estilos.textoEntendido}>Entendido</Text>
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  lista: {
    gap: 12,
  },
  aviso: {
    borderWidth: 1,
    borderColor: colores.linea,
    borderRadius: radios.tarjeta,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  texto: {
    flex: 1,
    fontFamily: fuentes.sans[400],
    fontSize: 15,
    lineHeight: 21,
    color: colores.gris700,
  },
  fuerte: {
    fontFamily: fuentes.sans[600],
    color: colores.negro,
  },
  entendido: {
    alignSelf: 'flex-start',
  },
  textoEntendido: {
    fontFamily: fuentes.sans[500],
    fontSize: 15,
    color: colores.negro,
    textDecorationLine: 'underline',
  },
});
