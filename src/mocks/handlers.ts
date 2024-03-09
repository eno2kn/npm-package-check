import { HttpResponse, http, PathParams, DefaultBodyType } from 'msw';

const npmHonoResponse = {
  name: 'hono',
  'dist-tags': {
    latest: '4.0.9',
    next: '4.1.0-rc.1',
    v4: '4.0.0-rc.4',
  },
  time: {
    '4.0.9': '2024-03-03T05:20:10.983Z',
    '4.1.0-rc.1': '2024-03-04T13:22:05.032Z',
  },
  repository: {
    type: 'git',
    url: 'https://github.com/honojs/hono.git',
  },
};
const npmDownloadsHonoResponse = {
  downloads: 130682,
  start: '2024-02-27',
  end: '2024-03-04',
  package: 'hono',
};

export const handlers = [
  // https://github.com/mswjs/msw/issues/1792
  http.get<
    PathParams,
    DefaultBodyType,
    typeof npmHonoResponse | { error: string }
  >('https://registry.npmjs.org/:pkg', ({ params }) => {
    const { pkg } = params;

    if (pkg === 'hono') {
      return HttpResponse.json(npmHonoResponse);
    }

    return HttpResponse.json(
      { error: 'Not found' },
      {
        status: 404,
      },
    );
  }),
  http.get<
    PathParams,
    DefaultBodyType,
    typeof npmDownloadsHonoResponse | { error: string }
  >('https://api.npmjs.org/downloads/point/last-week/:pkg', ({ params }) => {
    const { pkg } = params;

    if (pkg === 'hono') {
      return HttpResponse.json(npmDownloadsHonoResponse);
    }

    return HttpResponse.json(
      { error: `package ${pkg} not found` },
      {
        status: 404,
      },
    );
  }),
  http.get<
    PathParams,
    DefaultBodyType,
    [] | { message: string; documentation_url: string }
  >('https://api.github.com/repos/:owner/:repo/contributors', ({ params }) => {
    const { repo, owner } = params;

    if (owner === 'honojs' && repo === 'hono') {
      return HttpResponse.json([], {
        headers: {
          Link: '<https://api.github.com/repositories/438384984/contributors?per_page=1&page=2>; rel="next", <https://api.github.com/repositories/438384984/contributors?per_page=1&page=110>; rel="last"',
          'Content-Type': 'application/json',
        },
      });
    }

    return HttpResponse.json(
      {
        message: 'Not Found',
        documentation_url:
          'https://docs.github.com/rest/repos/repos#list-repository-contributors',
      },
      {
        status: 404,
      },
    );
  }),
  http.get('/api/npm', ({ request }) => {
    const url = new URL(request.url);
    const name = url.searchParams.get('name');

    if (name === 'hono') {
      return HttpResponse.json({
        latest: {
          version: '4.0.10',
          publishedAt: '2024-03-05T22:27:53.005Z',
        },
        downloads: 143796,
        contributors: 110,
        github: 'https://github.com/honojs/hono',
      });
    }

    return new HttpResponse('Package not found.', {
      status: 404,
    });
  }),
];
