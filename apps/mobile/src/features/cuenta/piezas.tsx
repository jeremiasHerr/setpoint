import type { InscripcionEnCurso } from '@setpoint/shared';
import { StyleSheet, Text, View } from 'react-native';
import { diaCorto, diasHasta, hora } from '../../lib/fechas';
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

const TEXTO_DE_LA_MARCA: Record<InscripcionEnCurso['estado'], string> = {
  solicitada: 'en revisión',
  aprobada: 'aprobada',
  reservando: 'reservando',
  en_lista_espera: 'en lista de espera',
};

// El estado de la inscripción (design.md §7): punto hueco en revisión, noche lleno aprobada (el verde
// queda para "pagada"), el reloj mientras reserva y, en la lista de espera, su puesto, porque la
// lista va numerada por orden de llegada.
export function Marca({ inscripcion }: { inscripcion: InscripcionEnCurso }) {
  const { estado, listaDeEspera } = inscripcion;
  return (
    <View style={estilos.marca}>
      {estado === 'solicitada' && <View style={[estilos.punto, estilos.hueco]} />}
      {estado === 'aprobada' && <View style={[estilos.punto, estilos.lleno]} />}
      {estado === 'reservando' && <Reloj tamano={14} />}
      {listaDeEspera && <Text style={estilos.puesto}>{listaDeEspera.puesto}°</Text>}
      <Text style={estilos.textoMarca}>{TEXTO_DE_LA_MARCA[estado]}</Text>
    </View>
  );
}

// "hasta las 18:42", dentro de un texto. Si no vence hoy, también el día: el lugar que le toca a
// quien esperaba en la lista es suyo por 24 horas (decisión 076), y la hora sola diría otro día. Se
// calcula al mostrarse: la app vuelve a pedir la cuenta al volver al frente.
export function Vence({ iso }: { iso: string }) {
  const urgente = new Date(iso).getTime() - Date.now() < POCO_TIEMPO_MS;
  const otroDia = diasHasta(iso) !== 0;
  return (
    <>
      {otroDia ? `hasta el ${diaCorto(iso)} a las ` : 'hasta las '}
      <Text style={[estilos.hora, urgente && estilos.urgente]}>{hora(iso)}</Text>
    </>
  );
}

const estilos = StyleSheet.create({
  reloj: {
    borderWidth: 1.8,
    borderColor: colores.pizarra500,
  },
  aguja: {
    position: 'absolute',
    width: 1.8,
    backgroundColor: colores.pizarra500,
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
    borderColor: colores.pizarra400,
  },
  lleno: {
    backgroundColor: colores.noche,
  },
  puesto: {
    fontFamily: fuentes.mono[500],
    fontSize: 15,
    color: colores.noche,
    ...tabular,
  },
  textoMarca: {
    fontFamily: fuentes.sans[400],
    fontSize: 15,
    color: colores.pizarra500,
  },
  hora: {
    fontFamily: fuentes.mono[500],
    color: colores.noche,
    ...tabular,
  },
  urgente: {
    color: colores.rojoTexto,
  },
});
