import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import tsconfigPaths from 'vite-tsconfig-paths';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    dts({
      insertTypesEntry: true,
      tsconfigPath: resolve(__dirname, 'tsconfig.json'),
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'PlanaraCore',
      fileName: (format) => `index.${format}.js`,
      formats: ['es', 'cjs', 'umd'],
    },
    rollupOptions: {
      external: [
        'three',
        'mobx',
        'events',
        'reflect-metadata',
        'tsyringe',
        '@planara/three',
        '@planara/types',
      ],
      output: {
        globals: {
          three: 'THREE',
          mobx: 'mobx',
          events: 'events',
          'reflect-metadata': 'Reflect',
          tsyringe: 'tsyringe',
          '@planara/three': 'PlanaraThree',
          '@planara/types': 'PlanaraTypes',
        },
      },
    },
  },
});
