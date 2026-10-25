// La convocatoria de un torneo para cualquiera con el link, sin cuenta: la pantalla El torneo
// (F12, docs/pantallas/jugador/el-torneo.html). Sin datos de los inscriptos.
export type TorneoPublico = {
  id: number;
  organizacion: { nombre: string; slug: string };
  // La edición, o el nombre si es un torneo suelto: "Primavera 2026".
  nombre: string;
  categoria: string;
  // Abierta mientras el torneo está publicado; después ya no se inscribe nadie.
  inscripcion: 'abierta' | 'cerrada';
  // 'AAAA-MM-DD'.
  cierreInscripcion: string | null;
  fechaInicio: string | null;
  cantidadGrupos: number;
  tieneCuadroConsuelo: boolean;
  cupo: number;
  // Pagadas más reservas sin pagar, como en Inscripciones.
  ocupados: number;
  precio: number;
  // Lo que escribió la organización al crear el torneo, por ejemplo qué incluye la inscripción.
  descripcion: string | null;
};
