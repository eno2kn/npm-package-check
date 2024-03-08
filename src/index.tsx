import { Hono } from 'hono';
import { cache } from 'hono/cache';
import { renderToString } from 'react-dom/server';
import { npmRoute } from './api';

const app = new Hono();

app.use(
  '/api/*',
  cache({
    cacheName: 'npm-pkg-api',
    cacheControl: 'max-age=86400, stale-while-revalidate=3600',
  }),
);

const routes = app.route('/api', npmRoute).get('*', (c) => {
  return c.html(
    renderToString(
      <html>
        <head>
          <meta charSet="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <link
            rel="icon"
            type="image/png"
            href="https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/72x72/1f50d.png"
          />
          <title>npm package check</title>
          {import.meta.env.PROD ? (
            <>
              <link rel="stylesheet" href="/static/index.css" />
              <script type="module" src="/static/client.js"></script>
            </>
          ) : (
            <>
              <link rel="stylesheet" href="/src/index.css" />
              <script type="module" src="/src/client.tsx"></script>
            </>
          )}
        </head>
        <body>
          <div id="root"></div>
        </body>
      </html>,
    ),
  );
});

export type AppType = typeof routes;
export default app;
