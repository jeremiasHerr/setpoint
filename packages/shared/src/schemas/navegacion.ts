// La franja de pestañas de las pantallas de un torneo, en la web de la organización (decisión 095).
// La API dice qué pestaña se puede abrir; la web solo la dibuja.
import type { EstadoTorneo } from './torneo';

// En el orden en que se usan. Zonas es el Sorteo de zonas.
export const pestanasDelTorneo = ['inscripciones', 'zonas', 'tablero', 'resultados', 'cierre'] as const;
export type PestanaDelTorneo = (typeof pestanasDelTorneo)[number];

export type NavegacionDelTorneo = {
  torneoId: number;
  // El id del primer torneo de la convocatoria: el que abre Nuevo torneo (decisión 003).
  convocatoriaId: number;
  // "Primavera 26 · Tercera".
  nombre: string;
  estado: EstadoTorneo;
  // Mientras la convocatoria entera tiene la inscripción abierta: después, el sorteo ya usó el formato.
  sePuedeEditar: boolean;
  // Las que no se pueden abrir todavía se ven apagadas.
  disponibles: Record<PestanaDelTorneo, boolean>;
};
