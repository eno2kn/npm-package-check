import { describe, test, expect, afterAll, afterEach, beforeAll } from 'vitest';
import { Hono } from 'hono';
import { server } from '@/mocks/server';
import { apiRoute } from './index';

describe('GET /api/npm', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  afterAll(() => server.close());

  afterEach(() => {
    server.resetHandlers();
  });

  const app = new Hono();

  app.route('/api', apiRoute);

  test('Should return 200 response', async () => {
    const res = await app.request(`/api/npm?name=hono`);
    expect(res.status).toBe(200);

    const body = await res.json();

    expect(body).toEqual({
      latest: {
        version: '4.0.9',
        publishedAt: '2024-03-03T05:20:10.983Z',
      },
      downloads: 130682,
      contributors: 110,
      github: 'https://github.com/honojs/hono',
    });
  });

  test('Should return 400 response', async () => {
    const res = await app.request(`/api/npm`);
    expect(res.status).toBe(400);
  });

  test('Should return 404 response', async () => {
    const res = await app.request(`/api/npm?name=excited!`);
    expect(res.status).toBe(404);
  });
});
