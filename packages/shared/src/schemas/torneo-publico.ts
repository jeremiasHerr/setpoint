import type { Contacto } from './circuito';

// La parte del torneo que se está jugando, para marcarla en el cronograma (decisión 160).
export type FaseDelTorneo = 'inscripcion' | 'sorteo' | 'zonas' | 'cuadros' | 'terminado';

// La convocatoria de un torneo para cualquiera con el link, sin cuenta: la pantalla El torneo
// (F12, docs/pantallas/jugador/el-torneo.html). Sin datos de los inscriptos.
export type TorneoPublico = {
  id: number;
  // Lo que va en su link: /inscripcion/<organización>/<slugPublico> (decisión 140).
  slugPublico: string | null;
  // Los contactos los carga la organización en Tu circuito; puede no haber ninguno (decisión 091).
  // usaRanking: si el circuito lleva ranking, la página vuelve a él (decisión 156).
  organizacion: { nombre: string; slug: string; usaRanking: boolean; contactos: Contacto[] };
  // La edición, o el nombre si es un torneo suelto: "Primavera 2026".
  nombre: string;
  categoria: string;
  // Ajeno al circuito: se anota cualquiera del padrón, sin importar su categoría (decisión 089).
  suelto: boolean;
  // Abierta mientras el torneo está publicado; después ya no se inscribe nadie.
  inscripcion: 'abierta' | 'cerrada';
  // Quién puede inscribirse: solo el padrón, con aprobación o cualquiera (07 §2.6).
  modoInscripcion: 'cerrada' | 'con_aprobacion' | 'abierta';
  // 'AAAA-MM-DD'.
  cierreInscripcion: string | null;
  fechaInicio: string | null;
  cantidadGrupos: number;
  clasificanPorGrupo: number;
  tieneCuadroConsuelo: boolean;
  // Cómo llama el circuito a su cuadro consuelo, ya resuelto: "Complementaria" (07 §1.2).
  nombreCuadroConsuelo: string;
  // Los plazos de cada fase, para el cronograma (decisión 160).
  plazoGruposDias: number;
  plazoPorRondaDias: number;
  // En qué parte del cronograma está el torneo, según su estado.
  fase: FaseDelTorneo;
  cupo: number;
  // Pagadas más reservas sin pagar, como en Inscripciones.
  ocupados: number;
  precio: number;
  // Lo que dura la reserva del lugar mientras se paga.
  minutosReserva: number;
  // Con el cupo lleno, quien llega se anota acá (F13). Las horas son las que tiene para pagar cuando
  // le toca un lugar (decisión 076). null si el torneo no tiene lista de espera.
  listaDeEspera: { personas: number; horas: number } | null;
  // Lo que escribió la organización al crear el torneo, por ejemplo qué incluye la inscripción.
  descripcion: string | null;
};

// El link público de un torneo (decisión 140): con su nombre desde que se publica. Sin slug, el de
// antes, con el número, que sigue andando y lleva al nuevo.
export function rutaDelTorneo(organizacion: string, torneo: { id: number; slugPublico: string | null }) {
  return torneo.slugPublico ? `/inscripcion/${organizacion}/${torneo.slugPublico}` : `/c/${organizacion}/torneos/${torneo.id}`;
}
