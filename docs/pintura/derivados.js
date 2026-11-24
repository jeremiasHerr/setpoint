// Arma las imágenes de la web a partir de la pintura exportada (docs/pintura/README.md). Usa
// jimp-compact, que llega con las dependencias de la app (Expo): correrlo desde la raíz del repo,
// `node docs/pintura/derivados.js`, después de `npm install`.
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp-compact');

const AQUI = __dirname;
const PUBLICO = path.join(AQUI, '..', '..', 'apps', 'web', 'public');

(async () => {
  const exportada = path.join(AQUI, 'cancha-noche-2400.jpg');
  const pintura = await Jimp.read(exportada);
  if (pintura.bitmap.width !== 2400 || pintura.bitmap.height !== 2400) throw new Error('La pintura tiene que ser de 2400 × 2400');

  // El hero en la compu: la entera tal como la exporta el navegador, que la comprime mejor que jimp,
  // y una de 1800 para las pantallas que no la necesitan grande.
  fs.copyFileSync(exportada, path.join(PUBLICO, 'pinturas', 'cancha-noche-2400.jpg'));
  await pintura.clone().resize(1800, 1800).quality(86).writeAsync(path.join(PUBLICO, 'pinturas', 'cancha-noche-1800.jpg'));
  // El hero en el celular: la columna del centro, de punta a punta.
  await pintura.clone().crop(720, 0, 960, 2400).quality(86).writeAsync(path.join(PUBLICO, 'pinturas', 'cancha-noche-celu.jpg'));
  // La vista previa de WhatsApp (decisión 144): la franja de arriba, a 1200 × 630.
  await pintura.clone().crop(0, 0, 2400, 1260).resize(1200, 630).quality(82).writeAsync(path.join(PUBLICO, 'vista-previa.jpg'));

  console.log('Listas las cuatro imágenes en apps/web/public. Si cambia la pintura, cambiá también sus nombres: los navegadores las guardan.');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
