import type { InscripcionEnCurso } from '@setpoint/shared';
import { StyleSheet, Text, View } from 'react-native';
import { hora } from '../../lib/fechas';
import { colores, fuentes, radios, tabular } from '../../lib/tokens';

// Piezas de las inscripciones en curso, en la pantalla propia y en el aviso de Cuándo juego.

// Faltando menos que esto, la hora de vencimiento va en rojo (design.md §7).
const POCO_TIEMPO_MS = 5 * 60_000;

// Un reloj hecho con bordes: para dos íconos no se suma react-native-svg.
export function Reloj({ tamano = 18 }: { tamano?: number }) {
  return (
    <View style={[estilos.reloj, { width: tamano, height: tamano, borderRadius: tamano / 2 }]}>
      <View style={[estilos.aguja, { height: tamano * 0.3, top: tamano * 0.18, left: tamano / 2 - 1.8 }]} />
    </View>
  );
}

// El estado de la inscripción (design.md §7): punto hueco en revisión, negro lleno aprobada (el lima
// queda para "pagada"), y el reloj mientras reserva.
export function Marca({ estado }: { estado: InscripcionEnCurso['estado'] }) {
  return (
    <View style={estilos.marca}>
      {estado === 'solicitada' && <View style={[estilos.punto, estilos.hueco]} />}
      {estado === 'aprobada' && <View style={[estilos.punto, estilos.lleno]} />}
      {estado === 'reservando' && <Reloj tamano={14} />}
      <Text style={estilos.textoMarca}>
        {estado === 'solicitada' ? 'en revisión' : estado === 'aprobada' ? 'aprobada' : 'reservando'}
      </Text>
    </View>
  );
}

// "18:42", dentro de un texto. Se calcula al mostrarse: la app vuelve a pedir la cuenta al volver al
// frente.
export function Vence({ iso }: { iso: string }) {
  const urgente = new Date(iso).getTime() - Date.now() < POCO_TIEMPO_MS;
  return <Text style={[estilos.hora, urgente && estilos.urgente]}>{hora(iso)}</Text>;
}

const estilos = StyleSheet.create({
  reloj: {
    borderWidth: 1.8,
    borderColor: colores.gris500,
  },
  aguja: {
    position: 'absolute',
    width: 1.8,
    backgroundColor: colores.gris500,
  },
  marca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  punto: {
    width: 9,
    height: 9,
    borderRadius: radios.chip,
  },
  hueco: {
    borderWidth: 1.5,
    borderColor: colores.gris400,
  },
  lleno: {
    backgroundColor: colores.negro,
  },
  textoMarca: {
    fontFamily: fuentes.sans[400],
    fontSize: 15,
    color: colores.gris500,
  },
  hora: {
    fontFamily: fuentes.mono[500],
    color: colores.negro,
    ...tabular,
  },
  urgente: {
    color: colores.rojoTexto,
  },
});
