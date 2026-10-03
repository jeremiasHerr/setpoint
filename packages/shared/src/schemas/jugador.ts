import { z } from 'zod';

const nombre = z.string({ error: 'Escribí el nombre' }).trim().min(1, 'Escribí el nombre').max(60);
const apellido = z.string({ error: 'Escribí el apellido' }).trim().min(1, 'Escribí el apellido').max(60);

// La categoría viaja por nombre, igual que en la configuración del circuito. null = sin categoría.
const categoria = z.string().trim().min(1).max(40).nullable();

const telefono = z.string().trim().max(30, 'Como máximo 30 caracteres');

export const crearJugadorSchema = z.object(
  { nombre, apellido, categoria, telefono: telefono.default('') },
  { error: 'Faltan los datos del jugador' },
);

export type DatosCrearJugador = z.infer<typeof crearJugadorSchema>;

// Edición parcial: solo se toca lo que llega. `activo: false` es la baja; `true`, la reactivación.
export const editarJugadorSchema = z
  .object(
    { nombre, apellido, categoria, telefono, activo: z.boolean() },
    { error: 'Faltan los datos del jugador' },
  )
  .partial()
  .refine((datos) => Object.keys(datos).length > 0, 'No hay nada para cambiar');

export type DatosEditarJugador = z.infer<typeof editarJugadorSchema>;

// Una fila del padrón, tal como la ve la organización. Incluye el teléfono:
// nunca se usa en una respuesta pública.
export type JugadorPadron = {
  id: number;
  nombre: string;
  apellido: string;
  categoria: string | null;
  telefono: string;
  activo: boolean;
  puntos: number;
  // Puesto en el ranking de su categoría. null si está de baja o no tiene categoría.
  puesto: number | null;
  partidos: number;
  creadoEn: string;
};
