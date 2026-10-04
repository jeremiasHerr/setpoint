import { JUGADORES_POR_GRUPO, type DatosConvocatoria } from './schemas/torneo';

// Traduce el formato de una convocatoria a lo que el organizador puede evaluar sin hacer
// cuentas: cuántos partidos se juegan y cuándo termina (ver pantallas/organizador/nuevo-torneo).

export type DatosFormato = Pick<
  DatosConvocatoria,
  | 'cantidadGrupos'
  | 'clasificanPorGrupo'
  | 'tieneComplementaria'
  | 'plazoGruposDias'
  | 'plazoPorRondaDias'
  | 'fechaInicio'
>;

export type InstanciaCronograma = {
  nombre: string;
  dias: number;
  // 'AAAA-MM-DD', ambos inclusive. null mientras no haya fecha de inicio.
  desde: string | null;
  hasta: string | null;
};

export type Formato = {
  jugadoresCampeonato: number;
  jugadoresComplementaria: number;
  partidosZona: number;
  partidosCampeonato: number;
  partidosComplementaria: number;
  partidosTotal: number;
  rondas: number;
  duracionDias: number;
  minimoPartidosPorJugador: number;
  cronograma: InstanciaCronograma[];
  fechaFin: string | null;
};

// Todos contra todos en un grupo de 4: 4 × 3 / 2.
const PARTIDOS_POR_GRUPO = (JUGADORES_POR_GRUPO * (JUGADORES_POR_GRUPO - 1)) / 2;

// Desde la final hacia atrás. Con 32 grupos de 3 clasificados entran 96: 7 rondas.
const NOMBRES_RONDA = ['final', 'semis', 'cuartos', 'octavos', 'dieciseisavos', '32avos', '64avos'];

// En eliminación directa cada partido elimina a uno: con n jugadores son n − 1, haya byes o no.
const partidosDeCuadro = (jugadores: number) => Math.max(jugadores - 1, 0);
const rondasDeCuadro = (jugadores: number) => (jugadores < 2 ? 0 : Math.ceil(Math.log2(jugadores)));

// Suma días a una fecha 'AAAA-MM-DD' en UTC, para que no se corra por zona horaria.
function sumarDias(dia: string, dias: number) {
  const fecha = new Date(`${dia}T00:00:00.000Z`);
  fecha.setUTCDate(fecha.getUTCDate() + dias);
  return fecha.toISOString().slice(0, 10);
}

export function calcularFormato(datos: DatosFormato): Formato {
  const jugadoresCampeonato = datos.cantidadGrupos * datos.clasificanPorGrupo;
  const jugadoresComplementaria = datos.tieneComplementaria
    ? datos.cantidadGrupos * (JUGADORES_POR_GRUPO - datos.clasificanPorGrupo)
    : 0;

  const partidosZona = datos.cantidadGrupos * PARTIDOS_POR_GRUPO;
  const partidosCampeonato = partidosDeCuadro(jugadoresCampeonato);
  const partidosComplementaria = partidosDeCuadro(jugadoresComplementaria);

  // Los dos cuadros corren en paralelo: manda el más grande.
  const rondas = Math.max(rondasDeCuadro(jugadoresCampeonato), rondasDeCuadro(jugadoresComplementaria));

  const plazos = [
    { nombre: 'grupos', dias: datos.plazoGruposDias },
    ...NOMBRES_RONDA.slice(0, rondas)
      .reverse()
      .map((nombre) => ({ nombre, dias: datos.plazoPorRondaDias })),
  ];

  let desde = datos.fechaInicio;
  const cronograma = plazos.map(({ nombre, dias }): InstanciaCronograma => {
    if (desde === null) return { nombre, dias, desde: null, hasta: null };
    const instancia = { nombre, dias, desde, hasta: sumarDias(desde, dias - 1) };
    desde = sumarDias(desde, dias);
    return instancia;
  });

  // Cada jugador juega sus 3 de zona, y uno más si después entra a un cuadro donde haya rival.
  const todosJueganCuadro = jugadoresCampeonato >= 2 && jugadoresComplementaria >= 2;

  return {
    jugadoresCampeonato,
    jugadoresComplementaria,
    partidosZona,
    partidosCampeonato,
    partidosComplementaria,
    partidosTotal: partidosZona + partidosCampeonato + partidosComplementaria,
    rondas,
    duracionDias: datos.plazoGruposDias + rondas * datos.plazoPorRondaDias,
    minimoPartidosPorJugador: JUGADORES_POR_GRUPO - 1 + (todosJueganCuadro ? 1 : 0),
    cronograma,
    fechaFin: cronograma.at(-1)?.hasta ?? null,
  };
}
