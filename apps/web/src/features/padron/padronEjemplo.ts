import type { JugadorPadron } from '@setpoint/shared';

// Datos de ejemplo hasta conectar la pantalla con la API. Nombres ficticios.
const hoy = new Date().toISOString();

export const categoriasEjemplo = ['Segunda', 'Tercera'];

export const padronEjemplo: JugadorPadron[] = [
  { id: 1, nombre: 'Tomás', apellido: 'Quiroga', categoria: 'Tercera', telefono: '', activo: true, puntos: 165, puesto: 1, partidos: 31, creadoEn: '2025-09-01T12:00:00Z' },
  { id: 2, nombre: 'Diego', apellido: 'Mansilla', categoria: 'Tercera', telefono: '', activo: true, puntos: 110, puesto: 2, partidos: 28, creadoEn: '2025-09-01T12:00:00Z' },
  { id: 3, nombre: 'Juan', apellido: 'Painemil', categoria: 'Tercera', telefono: '', activo: true, puntos: 100, puesto: 3, partidos: 9, creadoEn: '2026-03-10T12:00:00Z' },
  { id: 4, nombre: 'Ariel', apellido: 'Huenchul', categoria: 'Tercera', telefono: '', activo: true, puntos: 0, puesto: 7, partidos: 0, creadoEn: hoy },
  { id: 5, nombre: 'Marcelo', apellido: 'Sanhueza', categoria: 'Tercera', telefono: '', activo: true, puntos: 85, puesto: 5, partidos: 24, creadoEn: '2025-12-01T12:00:00Z' },
  { id: 6, nombre: 'Pablo', apellido: 'Roa', categoria: 'Tercera', telefono: '', activo: true, puntos: 95, puesto: 4, partidos: 26, creadoEn: '2025-09-01T12:00:00Z' },
  { id: 7, nombre: 'Rubén', apellido: 'Márquez', categoria: 'Tercera', telefono: '', activo: false, puntos: 0, puesto: null, partidos: 4, creadoEn: '2025-09-01T12:00:00Z' },
  { id: 8, nombre: 'Lucas', apellido: 'Cayul', categoria: 'Segunda', telefono: '', activo: true, puntos: 140, puesto: 1, partidos: 30, creadoEn: '2025-09-01T12:00:00Z' },
];
