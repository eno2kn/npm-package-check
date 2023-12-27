import { handle } from 'hono/cloudflare-pages';
import { app } from '../../src/api';

export const onRequest = handle(app);
