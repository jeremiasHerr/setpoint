// La convocatoria de un torneo para cualquiera con el link, sin cuenta: la pantalla El torneo
// (F12, docs/pantallas/jugador/el-torneo.html). Sin datos de los inscriptos.
export type TorneoPublico = {
  id: number;
  // El contacto lo carga la organización en Tu circuito; puede no estar.
  organizacion: { nombre: string; slug: string; contacto: string | null };
  // La edición, o el nombre si es un torneo suelto: "Primavera 2026".
  nombre: string;
  categoria: string;
  // Abierta mientras el torneo está publicado; después ya no se inscribe nadie.
  inscripcion: 'abierta' | 'cerrada';
  // Quién puede inscribirse: solo el padrón, con aprobación o cualquiera (07 §2.6).
  modoInscripcion: 'cerrada' | 'con_aprobacion' | 'abierta';
  // 'AAAA-MM-DD'.
  cierreInscripcion: string | null;
  fechaInicio: string | null;
  cantidadGrupos: number;
  tieneCuadroConsuelo: boolean;
  cupo: number;
  // Pagadas más reservas sin pagar, como en Inscripciones.
  ocupados: number;
  precio: number;
  // Lo que dura la reserva del lugar mientras se paga.
  minutosReserva: number;
  // Lo que escribió la organización al crear el torneo, por ejemplo qué incluye la inscripción.
  descripcion: string | null;
};
