import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import { RateLimit, RateLimitConfig } from '@/lib/rate-limit';

export const rateLimit = (config: RateLimitConfig) => {
  const ratelimit = new RateLimit(config);

  return createMiddleware(async (c, next) => {
    const cfIp = c.req.raw.headers.get('cf-connecting-ip');
    const forwardedFor = c.req.raw.headers.get('x-forwarded-for');
    const realIp = c.req.raw.headers.get('x-real-ip');
    const ip =
      cfIp ||
      (forwardedFor && forwardedFor.split(',').at(0)) ||
      realIp ||
      'Unknown';

    const { success, limit, remaining } = await ratelimit.limit(ip);
    c.res.headers.set('X-RateLimit-Limit', limit.toString());
    c.res.headers.set('X-RateLimit-Remaining', remaining.toString());

    if (!success) {
      const res = new Response('Too many requests', {
        status: 429,
        headers: c.res.headers,
      });
      throw new HTTPException(429, { res });
    }

    await next();
  });
};
