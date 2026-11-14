import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import type { RespuestaSalud } from '@setpoint/shared';
import { hayMercadoPago } from './lib/mercadopago';
import { manejarErrores } from './middleware/errores';
import { authRouter } from './modules/auth/auth.routes';
import { cierreRouter } from './modules/competencia/cierre.routes';
import { enVivoRouter } from './modules/competencia/en-vivo.routes';
import { cuadrosPublicoRouter } from './modules/competencia/cuadros-publico.routes';
import { cuadrosRouter } from './modules/competencia/cuadros.routes';
import { programarInicioDeGrupos } from './modules/competencia/inicio-de-grupos';
import { posicionesRouter } from './modules/competencia/posiciones.routes';
import { resultadosRouter } from './modules/competencia/resultados.routes';
import { sorteoRouter } from './modules/competencia/sorteo.routes';
import { tableroRouter } from './modules/competencia/tablero.routes';
import { coordinacionRouter } from './modules/coordinacion/coordinacion.routes';
import { fichaPublicaRouter } from './modules/ficha/ficha-publica.routes';
import { inscripcionesRouter } from './modules/inscripciones/inscripciones.routes';
import { inscripcionRouter } from './modules/inscripcion/inscripcion.routes';
import { padronPublicoRouter } from './modules/inscripcion/padron-publico.routes';
import { reclamoRouter } from './modules/inscripcion/reclamo.routes';
import { jugadorRouter } from './modules/jugador/jugador.routes';
import { jugadoresRouter } from './modules/jugadores/jugadores.routes';
import { linkPersonalRouter } from './modules/link-personal/link-personal.routes';
import { organizacionesRouter } from './modules/organizaciones/organizaciones.routes';
import { pagoRouter } from './modules/pagos/pago.routes';
import { programarVencimientoDeReservas } from './modules/pagos/vencimiento';
import { webhookRouter } from './modules/pagos/webhook.routes';
import { importacionesRouter } from './modules/padron/importacion/importaciones.routes';
import { rankingPublicoRouter } from './modules/ranking/ranking-publico.routes';
import { revisionesRouter } from './modules/revisiones/revisiones.routes';
import { navegacionRouter } from './modules/torneos/navegacion.routes';
import { torneoPublicoRouter } from './modules/torneos/torneo-publico.routes';
import { torneosRouter } from './modules/torneos/torneos.routes';

const app = express();
// Detrás del proxy (nginx en el compose, el de Railway en la versión publicada), la IP del que pide
// viene en X-Forwarded-For. Sin esto, el límite por IP vería a todos como el proxy (decisión 086).
app.set('trust proxy', 1);
// La versión publicada sirve la web desde otro dominio: solo ella puede llamar a la API desde el
// navegador. La app del celular no pasa por CORS.
app.use(cors(process.env.WEB_URL ? { origin: process.env.WEB_URL } : undefined));
app.use(express.json());

app.get('/api/salud', (_req, res) => {
  res.json({ ok: true, servicio: 'setpoint-api' } satisfies RespuestaSalud);
});

app.use('/api/auth', authRouter);
app.use('/api/organizaciones/:slug/jugadores', jugadoresRouter);
// Antes que torneosRouter, que también recibe todo lo que cuelga de /torneos.
app.use('/api/organizaciones/:slug/torneos/:id/sorteo', sorteoRouter);
app.use('/api/organizaciones/:slug/torneos/:id/posiciones', posicionesRouter);
app.use('/api/organizaciones/:slug/torneos/:id/inscripciones', inscripcionesRouter);
app.use('/api/organizaciones/:slug/torneos/:id/cuadros', cuadrosRouter);
app.use('/api/organizaciones/:slug/torneos/:id/partidos/:partidoId/fecha', coordinacionRouter);
app.use('/api/organizaciones/:slug/torneos/:id/partidos', resultadosRouter);
app.use('/api/organizaciones/:slug/torneos/:id/cierre', cierreRouter);
app.use('/api/organizaciones/:slug/torneos/:id/tablero', tableroRouter);
app.use('/api/organizaciones/:slug/torneos/:id/navegacion', navegacionRouter);
app.use('/api/organizaciones/:slug/torneos', torneosRouter);
app.use('/api/organizaciones/:slug/importaciones', importacionesRouter);
app.use('/api/organizaciones/:slug/revisiones', revisionesRouter);
app.use('/api/organizaciones', organizacionesRouter);
// Sin login. Nada de acá devuelve datos de contacto.
app.use('/api/publico/:slug/ranking', rankingPublicoRouter);
app.use('/api/publico/:slug/jugadores/:id', fichaPublicaRouter);
app.use('/api/publico/:slug/torneos/:id/cuadros', cuadrosPublicoRouter);
app.use('/api/publico/:slug/torneos/:id/en-vivo', enVivoRouter);
app.use('/api/publico/:slug/torneos/:id/padron', padronPublicoRouter);
app.use('/api/publico/:slug/torneos/:id', torneoPublicoRouter);
// Con la sesión del código, todavía sin perfil: encontrarlo y reservar el lugar (F12).
app.use('/api/links/:codigo', linkPersonalRouter);
app.use('/api/inscripcion/:slug/torneos/:id', inscripcionRouter);
app.use('/api/inscripcion/:slug/inscripciones/:id', pagoRouter);
app.use('/api/inscripcion/:slug/reclamos', reclamoRouter);
// MercadoPago avisa los pagos acá (05-pagos §3).
app.use('/api/webhooks/mercadopago', webhookRouter);
// Con login de jugador: lo suyo, en la app.
app.use('/api/jugador/:slug', jugadorRouter);

app.use(manejarErrores);

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
});

programarInicioDeGrupos();
programarVencimientoDeReservas();

if (!hayMercadoPago()) {
  console.log('Sin MERCADOPAGO_ACCESS_TOKEN: el pago de las inscripciones es simulado (decisión 053).');
}
