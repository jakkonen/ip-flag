import { defineConfig } from 'vite';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const target = mode === 'firefox' ? 'firefox' : 'chromium';

  return {
    publicDir: 'public',
    plugins: [
      {
        name: 'remove-extension-crossorigin',
        transformIndexHtml: {
          order: 'post',
          handler: (html) => html.replace(/\s+crossorigin(?=[\s>])/g, '')
        }
      }
    ],
    build: {
      modulePreload: false,
      outDir: `dist/${target}`,
      emptyOutDir: true,
      sourcemap: true,
      rollupOptions: {
        input: {
          background: resolve(here, 'src/background/index.ts'),
          popup: resolve(here, 'src/popup/popup.html')
        },
        output: {
          entryFileNames: (chunk) =>
            chunk.name === 'background' ? 'background.js' : 'assets/[name].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]'
        }
      }
    }
  };
});
