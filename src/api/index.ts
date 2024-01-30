import { Hono } from 'hono';
import { cache } from 'hono/cache';
import { npmRoute } from './npm';

export const app = new Hono().basePath('/api');

app.use(
  '*',
  cache({
    cacheName: 'npm-pkg-api',
    cacheControl: 'max-age=86400, stale-while-revalidate=3600',
  }),
);

const route = app.route('/npm', npmRoute);

export type AppType = typeof route;
