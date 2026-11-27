import { coincideConElNombre, type PartidoDeLaFicha } from '@setpoint/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Boton } from '../../components/Boton';
import { Campo } from '../../components/Campo';
import { Chip } from '../../components/Chip';
import { colores, fuentes, tabular } from '../../lib/tokens';
import { rotuloDeRonda } from './textos';

// Los últimos, y el resto se despliega en el lugar.
const VISIBLES = 5;

type Resultado = 'todos' | 'ganados' | 'perdidos';
const FILTROS: { clave: Resultado; texto: string }[] = [
  { clave: 'todos', texto: 'Todos' },
  { clave: 'ganados', texto: 'Ganados' },
  { clave: 'perdidos', texto: 'Perdidos' },
];

// "zona C", "final", o en el cuadro consuelo "semis · Complementaria" (con el nombre del circuito).
function donde(partido: PartidoDeLaFicha, consuelo: string) {
  if (partido.grupo) return `zona ${partido.grupo}`;
  const ronda = rotuloDeRonda(partido.ronda!, partido.rondas!);
  return partido.cuadro === 'complementaria' ? `${ronda} · ${consuelo}` : ronda;
}

// Sus partidos con resultado, del más reciente al más viejo. El punto verde es un partido ganado; el
// W.O. figura aunque no cuente en jugados (decisión 073). Se filtran por ganados o perdidos y por el
// nombre del rival (decisión 146), y cada uno abre el cara a cara con ese rival (decisión 143).
export function PartidosDeLaFicha({ jugadorId, partidos, consuelo }: { jugadorId: number; partidos: PartidoDeLaFicha[]; consuelo: string }) {
  const [todos, setTodos] = useState(false);
  const [resultado, setResultado] = useState<Resultado>('todos');
  const [busqueda, setBusqueda] = useState('');

  const buscado = busqueda.trim();
  const filtrando = resultado !== 'todos' || buscado !== '';
  const filtrados = partidos.filter(
    (p) =>
      (resultado === 'todos' || p.gano === (resultado === 'ganados')) &&
      coincideConElNombre(p.rival, buscado),
  );
  // Con un filtro se ve todo lo que coincide: si no, un partido viejo quedaría escondido.
  const hayMas = !filtrando && filtrados.length > VISIBLES;
  const visibles = todos || filtrando ? filtrados : filtrados.slice(0, VISIBLES);

  return (
    <View style={estilos.seccion}>
      <Text style={estilos.titulo}>{hayMas && !todos ? 'Últimos partidos' : 'Partidos'}</Text>
      {partidos.length === 0 ? (
        <Text style={estilos.vacio}>Todavía no tiene partidos con resultado.</Text>
      ) : (
        <>
          <View accessibilityLabel="Filtrar por resultado" style={estilos.filtros}>
            {FILTROS.map((f) => (
              <Chip key={f.clave} texto={f.texto} activo={resultado === f.clave} onPress={() => setResultado(f.clave)} />
            ))}
          </View>
          <View style={estilos.buscador}>
            <Campo
              rotulo="Buscar rival por nombre o apellido"
              value={busqueda}
              onChangeText={setBusqueda}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="search"
            />
          </View>
          {visibles.length === 0 ? (
            <Text style={estilos.vacio}>
              {buscado !== ''
                ? 'Ningún partido contra un rival que se llame así.'
                : resultado === 'ganados'
                  ? 'Todavía no ganó ninguno.'
                  : 'Todavía no perdió ninguno.'}
            </Text>
          ) : (
            visibles.map((partido) => (
              <Pressable
                key={partido.id}
                accessibilityRole="button"
                accessibilityLabel={`${partido.gano ? 'Le ganó a' : 'Perdió con'} ${partido.rival.apellido}, ${partido.marcador}. Ver el cara a cara`}
                onPress={() =>
                  router.push({ pathname: '/rival/[id]', params: { id: String(partido.rival.jugadorId), de: String(jugadorId) } })
                }
                style={({ pressed }) => [estilos.fila, pressed && estilos.apretado]}
              >
                <View style={[estilos.punto, partido.gano && estilos.puntoGanado]} />
                <View style={estilos.centro}>
                  <Text style={[estilos.rival, partido.gano ? estilos.rivalGanado : estilos.rivalPerdido]} numberOfLines={1}>
                    {partido.rival.apellido}
                  </Text>
                  <Text style={estilos.donde} numberOfLines={1}>
                    {partido.torneo} · {donde(partido, consuelo)}
                  </Text>
                </View>
                <Text style={[estilos.marcador, !partido.gano && estilos.marcadorPerdido]}>{partido.marcador}</Text>
              </Pressable>
            ))
          )}
        </>
      )}
      {hayMas && !todos && <Boton texto={`Ver los ${partidos.length} partidos`} onPress={() => setTodos(true)} />}
    </View>
  );
}

const estilos = StyleSheet.create({
  seccion: { gap: 4 },
  titulo: { fontFamily: fuentes.sans[600], fontSize: 17, letterSpacing: -0.3, color: colores.noche, paddingBottom: 6 },
  vacio: { fontFamily: fuentes.sans[400], fontSize: 15, lineHeight: 22, color: colores.pizarra500, paddingTop: 8 },
  filtros: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 8 },
  buscador: { paddingBottom: 8 },
  fila: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: colores.lineaSuave,
  },
  apretado: { backgroundColor: colores.lineaSuave },
  punto: { width: 7, height: 7, borderRadius: 4, backgroundColor: colores.linea },
  puntoGanado: { backgroundColor: colores.lonaTexto },
  centro: { flex: 1, gap: 2 },
  rival: { fontSize: 16 },
  rivalGanado: { fontFamily: fuentes.sans[500], color: colores.noche },
  rivalPerdido: { fontFamily: fuentes.sans[400], color: colores.pizarra700 },
  donde: { fontFamily: fuentes.sans[400], fontSize: 12, color: colores.pizarra500 },
  marcador: { fontFamily: fuentes.mono[400], fontSize: 14, color: colores.noche, ...tabular },
  marcadorPerdido: { color: colores.pizarra500 },
});
