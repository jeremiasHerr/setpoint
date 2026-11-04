import { Router } from 'express';
import { torneoEnVivo } from './en-vivo.service';

// Se monta en /api/publico/:slug/torneos/:id/en-vivo. Sin login, como todo lo que cuelga de
// /api/publico (decisión 033): las zonas y el calendario de la página que la organización
// comparte en el grupo (F10). Los cuadros siguen en su propia ruta.
export const enVivoRouter = Router({ mergeParams: true });

enVivoRouter.get('/', async (req, res) => {
  const { slug, id } = req.params as { slug: string; id: string };
  res.json(await torneoEnVivo(slug, Number(id)));
});
