import { extname } from 'node:path';
import { Router, type RequestHandler } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { aplicarImportacionSchema, confirmarImportacionSchema } from '@setpoint/shared';
import { autenticar } from '../../../middleware/autenticar';
import { ErrorHttp } from '../../../middleware/errores';
import { limiteDeIaPorUsuario } from '../../../middleware/limite';
import { validar } from '../../../middleware/validar';
import {
  type ArchivoSubido,
  aplicarImportacion,
  confirmarImportacion,
  crearImportacion,
  descartarImportacion,
  deshacerImportacion,
  obtenerImportacion,
} from './importaciones.service';

const TAMANIO_MAXIMO = 2 * 1024 * 1024;
// Un lote: uno o varios archivos por categoría (decisión 012).
const ARCHIVOS_MAXIMOS = 10;
// El PDF con texto se lee como una planilla de una hoja (decisión 141).
const EXTENSIONES = ['.xlsx', '.xls', '.csv', '.pdf'];
// Un ranking pegado: 77 jugadores con sus casilleros entran de sobra.
const TEXTO_MAXIMO = 50_000;
// La IA tarda ~20 s por planilla y puede reintentar una vez. Las hojas se procesan en paralelo, así
// que un lote tarda lo que su hoja más lenta: se deja margen de sobra.
const TIEMPO_MAXIMO_MS = 180_000;

// En memoria: la planilla se lee y se descarta, no se guarda el archivo.
const subida = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: TAMANIO_MAXIMO, files: ARCHIVOS_MAXIMOS },
  fileFilter: (_req, archivo, cb) => {
    if (EXTENSIONES.includes(extname(archivo.originalname).toLowerCase())) cb(null, true);
    else cb(new ErrorHttp(400, 'ARCHIVO_INVALIDO'));
  },
}).array('archivos', ARCHIVOS_MAXIMOS);

// Traduce los errores de multer a los códigos de la API.
const recibirArchivo: RequestHandler = (req, res, next) => {
  subida(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      const codigos: Partial<Record<string, ErrorHttp>> = {
        LIMIT_FILE_SIZE: new ErrorHttp(413, 'ARCHIVO_MUY_GRANDE'),
        LIMIT_FILE_COUNT: new ErrorHttp(400, 'DEMASIADOS_ARCHIVOS'),
        LIMIT_UNEXPECTED_FILE: new ErrorHttp(400, 'DEMASIADOS_ARCHIVOS'),
      };
      next(codigos[err.code] ?? new ErrorHttp(400, 'ARCHIVO_INVALIDO'));
      return;
    }
    if (err) return next(err);
    // Los archivos o el texto pegado: alguno de los dos.
    const sinArchivos = !Array.isArray(req.files) || req.files.length === 0;
    const sinTexto = typeof req.body?.texto !== 'string' || req.body.texto.trim() === '';
    if (sinArchivos && sinTexto) {
      return next(new ErrorHttp(400, 'DATOS_INVALIDOS', { archivos: 'Elegí al menos una planilla o pegá el ranking' }));
    }
    next();
  });
};

// La categoría viaja por nombre, igual que en el alta de jugadores. Vacía, se toma la que diga la
// planilla (decisión 011).
const subirSchema = z.object({
  categoria: z.string().trim().max(40).optional(),
  texto: z.string().max(TEXTO_MAXIMO, 'El texto es muy largo').optional(),
});

// Se monta en /api/organizaciones/:slug/importaciones: mergeParams trae el slug del padre.
export const importacionesRouter = Router({ mergeParams: true });

importacionesRouter.use(autenticar);

importacionesRouter.post(
  '/',
  limiteDeIaPorUsuario,
  (req, res, next) => {
    req.setTimeout(TIEMPO_MAXIMO_MS);
    res.setTimeout(TIEMPO_MAXIMO_MS);
    next();
  },
  recibirArchivo,
  validar(subirSchema),
  async (req, res) => {
    const { slug } = req.params as { slug: string };
    // multer entrega el nombre en latin1: así no se rompen las tildes y las eñes.
    const archivos: ArchivoSubido[] = ((req.files ?? []) as Express.Multer.File[]).map((archivo) => ({
      nombre: Buffer.from(archivo.originalname, 'latin1').toString('utf8'),
      contenido: archivo.buffer,
    }));
    // El texto pegado se procesa como un archivo más del lote (decisión 141).
    const texto: string | undefined = req.body.texto?.trim();
    if (texto) archivos.push({ nombre: 'Texto pegado', contenido: Buffer.from(texto, 'utf8'), esTexto: true });
    const importacion = await crearImportacion(slug, res.locals.usuarioId, archivos, req.body.categoria || null);
    res.status(201).json(importacion);
  },
);

importacionesRouter.get('/:id', async (req, res) => {
  const { slug, id } = req.params as { slug: string; id: string };
  res.json(await obtenerImportacion(slug, res.locals.usuarioId, Number(id)));
});

// Confirma lo que se crea en el circuito y aplica las filas seguras (decisión 118).
importacionesRouter.post('/:id/aplicar', validar(aplicarImportacionSchema), async (req, res) => {
  const { slug, id } = req.params as { slug: string; id: string };
  res.json(await aplicarImportacion(slug, res.locals.usuarioId, Number(id), req.body));
});

importacionesRouter.post('/:id/confirmar', validar(confirmarImportacionSchema), async (req, res) => {
  const { slug, id } = req.params as { slug: string; id: string };
  res.json(await confirmarImportacion(slug, res.locals.usuarioId, Number(id), req.body));
});

importacionesRouter.post('/:id/descartar', async (req, res) => {
  const { slug, id } = req.params as { slug: string; id: string };
  res.json(await descartarImportacion(slug, res.locals.usuarioId, Number(id)));
});

importacionesRouter.post('/:id/deshacer', async (req, res) => {
  const { slug, id } = req.params as { slug: string; id: string };
  res.json(await deshacerImportacion(slug, res.locals.usuarioId, Number(id)));
});
