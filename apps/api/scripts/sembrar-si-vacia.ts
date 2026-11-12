import { execSync } from 'node:child_process';
import { PrismaClient } from '@prisma/client';

// Corre al arrancar el contenedor de la API. Con SEMBRAR=si-vacia, que pone el docker-compose de la
// entrega, carga el seed si la base no tiene ninguna organización: la demo arranca con datos, y un
// reinicio no borra lo que se cargó (el seed empieza vaciando la base). Sin la variable, como en la
// versión publicada, no hace nada (decisión 085).
async function main() {
  if (process.env.SEMBRAR !== 'si-vacia') return;

  const prisma = new PrismaClient();
  const organizaciones = await prisma.organizacion.count();
  await prisma.$disconnect();

  if (organizaciones > 0) {
    console.log('La base ya tiene datos: no se carga el seed.');
    return;
  }
  execSync('npx prisma db seed', { stdio: 'inherit' });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
