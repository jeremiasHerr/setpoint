import { z } from 'zod';

// Mismo mínimo que LARGO_MINIMO_CONTRASENA en el formulario de registro.
export const LARGO_MINIMO_CONTRASENA = 8;

export const registroOrganizacionSchema = z.object(
  {
    organizacion: z
      .string({ error: 'Escribí el nombre del circuito' })
      .trim()
      .min(2, 'Escribí el nombre del circuito')
      .max(80),
    nombre: z.string({ error: 'Escribí tu nombre' }).trim().min(1, 'Escribí tu nombre').max(80),
    email: z
      .string({ error: 'Escribí tu email' })
      .trim()
      .toLowerCase()
      .pipe(z.email('El email no es válido')),
    contrasena: z
      .string({ error: 'Escribí una contraseña' })
      .min(LARGO_MINIMO_CONTRASENA, `La contraseña tiene que tener al menos ${LARGO_MINIMO_CONTRASENA} caracteres`),
  },
  { error: 'Faltan los datos del registro' },
);

export type DatosRegistroOrganizacion = z.infer<typeof registroOrganizacionSchema>;

export const respuestaRegistroSchema = z.object({
  token: z.string(),
  usuario: z.object({ id: z.number(), email: z.string(), nombre: z.string() }),
  organizacion: z.object({ id: z.number(), nombre: z.string(), slug: z.string() }),
});

export type RespuestaRegistro = z.infer<typeof respuestaRegistroSchema>;

// Ingreso de quien administra una organización. Responde con la misma forma que el registro.
export const ingresoSchema = z.object(
  {
    email: z
      .string({ error: 'Escribí tu email' })
      .trim()
      .toLowerCase()
      .pipe(z.email('El email no es válido')),
    contrasena: z.string({ error: 'Escribí tu contraseña' }).min(1, 'Escribí tu contraseña'),
  },
  { error: 'Faltan el email y la contraseña' },
);

export type DatosIngreso = z.infer<typeof ingresoSchema>;
