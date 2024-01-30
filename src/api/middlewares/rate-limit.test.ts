import { describe, test, expect } from 'vitest';
import { Hono } from 'hono';
import { rateLimit } from './rate-limit';

describe('Rate Limit Middleware', () => {
  const app = new Hono();

  app.use(
    '/ratelimit',
    rateLimit({
      max: 500,
      ttl: 1000 * 60 * 5,
      limit: 1,
    }),
  );

  app.get('/ratelimit', (c) => {
    return c.json({ success: true });
  });

  test('Should return 200 response - /ratelimit', async () => {
    const res = await app.request('/ratelimit');

    expect(res.status).toBe(200);
    expect(res.headers.get('X-RateLimit-Limit')).toBe('1');
    expect(res.headers.get('X-RateLimit-Remaining')).toBe('0');
  });

  test('Should return 429 response - /ratelimit', async () => {
    const res = await app.request('/ratelimit');

    expect(res.status).toBe(429);
    expect(res.headers.get('X-RateLimit-Limit')).toBe('1');
    expect(res.headers.get('X-RateLimit-Remaining')).toBe('0');
  });
});
