import { z } from 'zod';

// La forma de la respuesta de la IA (capas 2 y 3 de 06-ia.md §2). Solo los mensajes que informan un
// resultado: la conversación no se devuelve. Que el mensaje y el partido existan, y que el marcador
// esté en el mensaje y sea válido, lo controla la auditoría.
export const respuestaMensajesSchema = z.object({
  resultados: z.array(
    z.object({
      // El número del mensaje, como viene en la entrada.
      mensaje: z.number(),
      // El id del partido de la lista. null si el mensaje es un resultado pero no se sabe de cuál.
      partidoId: z.number().nullable(),
      tipo: z.enum(['jugado', 'walkover', 'abandono']),
      // Quién ganó, como A o B del partido: en un W.O., quien estuvo; en un abandono, quien siguió.
      ganador: z.enum(['A', 'B']).nullable(),
      // Del lado de A y de B del partido, en orden. Vacío en un W.O. o un abandono.
      sets: z.array(z.object({ gamesA: z.number(), gamesB: z.number(), esSuperTieBreak: z.boolean() })),
      confianza: z.enum(['alta', 'media', 'baja']),
    }),
  ),
});

export type RespuestaMensajes = z.infer<typeof respuestaMensajesSchema>;
export type ResultadoDeLaIA = RespuestaMensajes['resultados'][number];
