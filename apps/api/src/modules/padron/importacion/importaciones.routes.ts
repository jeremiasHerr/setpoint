import { extname } from 'node:path';
import { Router, type RequestHandler } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { confirmarImportacionSchema } from '@setpoint/shared';
import { autenticar } from '../../../middleware/autenticar';
import { ErrorHttp } from '../../../middleware/errores';
import { validar } from '../../../middleware/validar';
import {
  confirmarImportacion,
  crearImportacion,
  descartarImportacion,
  obtenerImportacion,
} from './importaciones.service';

const TAMANIO_MAXIMO = 2 * 1024 * 1024;
const EXTENSIONES = ['.xlsx', '.xls', '.csv'];
// La IA tarda ~20 s por planilla y puede reintentar una vez: se deja margen de sobra.
const TIEMPO_MAXIMO_MS = 180_000;

// En memoria: la planilla se lee y se descarta, no se guarda el archivo.
const subida = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: TAMANIO_MAXIMO, files: 1 },
  fileFilter: (_req, archivo, cb) => {
    if (EXTENSIONES.includes(extname(archivo.originalname).toLowerCase())) cb(null, true);
    else cb(new ErrorHttp(400, 'ARCHIVO_INVALIDO'));
  },
}).single('archivo');

// Traduce los errores de multer a los códigos de la API.
const recibirArchivo: RequestHandler = (req, res, next) => {
  subida(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      next(err.code === 'LIMIT_FILE_SIZE' ? new ErrorHttp(413, 'ARCHIVO_MUY_GRANDE') : new ErrorHttp(400, 'ARCHIVO_INVALIDO'));
      return;
    }
    if (err) return next(err);
    if (!req.file) return next(new ErrorHttp(400, 'DATOS_INVALIDOS', { archivo: 'Elegí una planilla' }));
    next();
  });
};

// La categoría viaja por nombre, igual que en el alta de jugadores.
const subirSchema = z.object(
  { categoria: z.string({ error: 'Elegí la categoría' }).trim().min(1, 'Elegí la categoría').max(40) },
  { error: 'Elegí la categoría' },
);

// Se monta en /api/organizaciones/:slug/importaciones: mergeParams trae el slug del padre.
export const importacionesRouter = Router({ mergeParams: true });

importacionesRouter.use(autenticar);

importacionesRouter.post(
  '/',
  (req, res, next) => {
    req.setTimeout(TIEMPO_MAXIMO_MS);
    res.setTimeout(TIEMPO_MAXIMO_MS);
    next();
  },
  recibirArchivo,
  validar(subirSchema),
  async (req, res) => {
    const { slug } = req.params as { slug: string };
    const archivo = req.file!;
    // multer entrega el nombre en latin1: así no se rompen las tildes y las eñes.
    const nombre = Buffer.from(archivo.originalname, 'latin1').toString('utf8');
    const importacion = await crearImportacion(
      slug,
      res.locals.usuarioId,
      { nombre, contenido: archivo.buffer },
      req.body.categoria,
    );
    res.status(201).json(importacion);
  },
);

importacionesRouter.get('/:id', async (req, res) => {
  const { slug, id } = req.params as { slug: string; id: string };
  res.json(await obtenerImportacion(slug, res.locals.usuarioId, Number(id)));
});

importacionesRouter.post('/:id/confirmar', validar(confirmarImportacionSchema), async (req, res) => {
  const { slug, id } = req.params as { slug: string; id: string };
  res.json(await confirmarImportacion(slug, res.locals.usuarioId, Number(id), req.body));
});

importacionesRouter.post('/:id/descartar', async (req, res) => {
  const { slug, id } = req.params as { slug: string; id: string };
  res.json(await descartarImportacion(slug, res.locals.usuarioId, Number(id)));
});
