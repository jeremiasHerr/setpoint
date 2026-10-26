import type { DatosPagoSimulado, InicioDePago, InscripcionEnCurso, InscripcionParaPagar } from '@setpoint/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { Boton } from '../../components/Boton';
import { ErrorApi, pedir } from '../../lib/api';
import { colores, fuentes, radios } from '../../lib/tokens';
import { useSesion } from '../auth/SesionProvider';

function mensajeDeError(error: Error | null): string | null {
  if (!error) return null;
  switch (error instanceof ErrorApi ? error.codigo : '') {
    case 'SIN_LUGARES':
      return 'Ya no quedan lugares en este torneo.';
    case 'RESERVA_NO_VIGENTE':
      return 'Venció la reserva. Si quedan lugares, inscribite de nuevo desde el link del torneo.';
    case 'INSCRIPCION_NO_ABIERTA':
      return 'La inscripción de este torneo ya cerró.';
    case 'SIN_CONEXION':
      return 'No pudimos conectarnos. Revisá tu conexión y probá de nuevo.';
    default:
      return 'No pudimos seguir con el pago. Probá de nuevo en unos minutos.';
  }
}

// "Pagar" desde la app, con la sesión de la app (decisión 054). La aprobada reserva el lugar recién
// ahora. El checkout se abre con el sistema y no con un navegador dentro de la app: así Android
// puede abrir la app de MercadoPago si está instalada. La confirmación llega por el webhook, y la
// app la ve al volver al frente, cuando vuelve a pedir la cuenta.
export function Pagar({ inscripcion }: { inscripcion: InscripcionEnCurso }) {
  const { sesion } = useSesion();
  const queryClient = useQueryClient();
  const [simulado, setSimulado] = useState(false);
  const token = sesion?.token;
  const base = `/api/inscripcion/${inscripcion.organizacion.slug}/inscripciones/${inscripcion.inscripcionId}`;
  const actualizar = () => queryClient.invalidateQueries({ queryKey: ['cuenta'] });

  const pagar = useMutation({
    mutationFn: async () => {
      const datos =
        inscripcion.estado === 'aprobada'
          ? await pedir<InscripcionParaPagar>('POST', `${base}/reservar`, undefined, token)
          : await pedir<InscripcionParaPagar>('GET', base, undefined, token);
      if (datos.pagoSimulado) return 'simulado' as const;
      const { url } = await pedir<InicioDePago>('POST', `${base}/pago`, undefined, token);
      if (url) await Linking.openURL(url);
      return 'abierto' as const;
    },
    onSuccess: (resultado) => setSimulado(resultado === 'simulado'),
    onSettled: actualizar,
  });

  const simular = useMutation({
    mutationFn: (datos: DatosPagoSimulado) => pedir<void>('POST', `${base}/simulado`, datos, token),
    onSettled: actualizar,
  });

  const error = mensajeDeError(pagar.error ?? simular.error);

  // Sin credenciales de MercadoPago (decisión 053). Ningún jugador real ve esto.
  if (simulado) {
    return (
      <View style={estilos.bloque}>
        <View style={estilos.caja}>
          <Text style={estilos.tituloCaja}>Pago simulado</Text>
          <Text style={estilos.textoCaja}>Esta instalación no tiene credenciales de MercadoPago. Elegí cómo termina el pago.</Text>
        </View>
        {error && <Text style={estilos.error}>{error}</Text>}
        <Boton
          texto="Simular pago aprobado"
          variante="principal"
          onPress={() => simular.mutate({ resultado: 'aprobado' })}
          disabled={simular.isPending}
        />
        <Boton
          texto="Simular pago rechazado"
          onPress={() => simular.mutate({ resultado: 'rechazado' })}
          disabled={simular.isPending}
        />
      </View>
    );
  }

  return (
    <View style={estilos.bloque}>
      {error && <Text style={estilos.error}>{error}</Text>}
      <Boton
        texto={pagar.isPending ? 'Abriendo el pago…' : 'Pagar'}
        variante="principal"
        onPress={() => pagar.mutate()}
        disabled={pagar.isPending}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  bloque: {
    gap: 12,
  },
  caja: {
    backgroundColor: colores.fondo,
    borderRadius: radios.control,
    padding: 14,
    gap: 4,
  },
  tituloCaja: {
    fontFamily: fuentes.sans[600],
    fontSize: 15,
    color: colores.negro,
  },
  textoCaja: {
    fontFamily: fuentes.sans[400],
    fontSize: 15,
    lineHeight: 21,
    color: colores.gris700,
  },
  // El rojo es solo para vencimientos (design.md §3): los errores van en gris sobre fondo.
  error: {
    fontFamily: fuentes.sans[500],
    fontSize: 15,
    lineHeight: 21,
    color: colores.gris700,
    backgroundColor: colores.fondo,
    borderRadius: radios.control,
    paddingHorizontal: 14,
    paddingVertical: 12,
    overflow: 'hidden',
  },
});
