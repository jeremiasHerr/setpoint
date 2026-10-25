import type { TorneoPublico } from './torneo-publico';

// El link personal que la organización le manda a cada jugador (decisión 050). Sin login: la
// pantalla saluda por el nombre antes de pedir el email.
export type LinkPersonal = {
  organizacion: { nombre: string; slug: string };
  jugador: { id: number; nombre: string; apellido: string; categoria: string | null };
  // Ya tiene cuenta: el link deja de servir para vincular.
  vinculado: boolean;
  // Las ediciones de su categoría con la inscripción abierta.
  torneos: TorneoPublico[];
};

// Lo que el link significa para la persona que lo abrió, ya con su sesión.
// - libre: se vincula al pagar.
// - propio: el perfil ya es suyo, sigue a los torneos.
// - otra_cuenta: el perfil está vinculado a otra cuenta.
// - otro_perfil: su cuenta ya tiene otro perfil en este circuito.
export type SituacionDelLink = { situacion: 'libre' | 'propio' | 'otra_cuenta' | 'otro_perfil' };
