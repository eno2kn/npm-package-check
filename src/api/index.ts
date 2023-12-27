import { Hono } from 'hono';
import { npmRoute } from './npm';

export const app = new Hono().basePath('/api');

const route = app.route('/npm', npmRoute);

export type AppType = typeof route;
