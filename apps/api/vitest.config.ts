import { defineConfig } from 'vitest/config';

// Los tests contra la base (*.base.test.ts) corren de a uno. Cada uno usa su propia organización,
// pero las inscripciones se escriben en transacciones serializables, y Postgres corta una de dos
// que se cruzan aunque sean de organizaciones distintas: en paralelo, fallaban al azar con CONFLICTO.
// Los demás no tocan la base y siguen en paralelo.
export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        test: { name: 'unidad', include: ['tests/**/*.test.ts'], exclude: ['tests/**/*.base.test.ts'] },
      },
      {
        extends: true,
        test: { name: 'base', include: ['tests/**/*.base.test.ts'], fileParallelism: false },
      },
    ],
  },
});
