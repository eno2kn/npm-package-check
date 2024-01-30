import { describe, test, expect } from 'vitest';
import { Hono } from 'hono';
import { npmRoute } from './npm';

describe('GET /api/npm', () => {
  const app = new Hono().basePath('/api');

  app.route('/npm', npmRoute);

  test('Should return 200 response', async () => {
    const params = new URLSearchParams({
      name: 'hono',
    });

    const res = await app.request(`/api/npm?${params.toString()}`);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toEqual({
      latest: {
        version: expect.any(String),
        publishedAt: expect.any(String),
      },
      downloads: expect.any(Number),
      contributors: expect.any(Number),
      github: expect.any(String),
    });
  });

  test('Should return 400 response', async () => {
    const res = await app.request(`/api/npm`);
    expect(res.status).toBe(400);
  });
});
