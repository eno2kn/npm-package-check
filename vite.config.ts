import { defineConfig } from 'vite';
import pages from '@hono/vite-cloudflare-pages';
import devServer from '@hono/vite-dev-server';

const globalConfig = {
  resolve: {
    alias: [{ find: '@', replacement: '/src' }],
  },
};

export default defineConfig(({ mode }) => {
  if (mode === 'client') {
    return {
      ...globalConfig,
      build: {
        rollupOptions: {
          input: ['./src/client.tsx', './src/index.css'],
          output: {
            entryFileNames: 'static/[name].js',
            assetFileNames: 'static/[name].[ext]',
          },
        },
      },
    };
  } else if (mode === 'test') {
    return {
      ...globalConfig,
    };
  } else {
    return {
      ...globalConfig,
      ssr: {
        external: ['react', 'react-dom'],
      },
      plugins: [
        pages(),
        devServer({
          entry: 'src/index.tsx',
        }),
      ],
    };
  }
});
