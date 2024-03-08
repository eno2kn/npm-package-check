import { Hono } from 'hono';
import { cache } from 'hono/cache';
import { validator } from 'hono/validator';
import { HTTPException } from 'hono/http-exception';
import { rateLimit } from './middlewares/rate-limit';

/**
 * @see https://github.com/npm/registry/blob/master/docs/responses/package-metadata.md
 */
export type NpmPackage = {
  name: string;
  'dist-tags': {
    latest: string;
  };
  time: Record<string, string>;
  /**
   * @see https://docs.npmjs.com/cli/v10/configuring-npm/package-json#repository
   */
  repository?: {
    /**
     * @example
     *  - 1 `git://github.com/{owner}/{repo}.git`
     *  - 1 `git+ssh://git@github.com/{owner}/{repo}.git`
     *  - 1 `git+https://github.com/{owner}/{repo}.git`
     *  - 1 `https://github.com/{owner}/{repo}.git`
     *  - 1 `ssh://git@github.com/{owner}/{repo}.git`
     *  - 2 `github:{owner}/{repo}`
     */
    url: string;
  };
};

function getGitHubRepoFromRepository(repo: NpmPackage['repository']) {
  if (!repo) {
    return null;
  }
  const url = repo.url;
  const pattern1 =
    /^(git|git\+ssh|git\+https|https|ssh):\/\/(git@)?(github\.com)\/(?<owner>.+?)\/(?<repo>.+?).git$/.exec(
      url,
    );
  if (pattern1) {
    const owner = pattern1.groups?.owner;
    const repo = pattern1.groups?.repo;

    return owner && repo ? { owner, repo } : null;
  }

  const pattern2 = /^github:(?<owner>.+?)\/(?<repo>.+?)$/.exec(url);
  if (pattern2) {
    const owner = pattern2.groups?.owner;
    const repo = pattern2.groups?.repo;

    return owner && repo ? { owner, repo } : null;
  }

  return null;
}

async function getContributorCount(
  owner: string,
  repo: string,
): Promise<number | null> {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=1`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'npm-package-check',
      },
    },
  );

  // <https://api.github.com/repositories/438384984/contributors?per_page=1&page=2>; rel="next", <https://api.github.com/repositories/438384984/contributors?per_page=1&page=110>; rel="last"
  const link = res.headers.get('Link');
  if (!link) {
    const json = (await res.json()) as unknown[];
    const count = json.length;
    return count;
  }
  const match = link.match(/page=(?<count>\d+)>; rel="last"$/);
  if (!match) return null;
  const count = Number(match.groups?.count);
  if (Number.isNaN(count)) return null;
  return count;
}

/**
 * @see https://github.com/npm/registry/blob/master/docs/download-counts.md
 */
export type NpmPackageDownloadCount = {
  downloads: number;
  start: string;
  end: string;
  package: string;
};

async function getDonwloads(name: string) {
  const npmDownloadsRes = await fetch(
    `https://api.npmjs.org/downloads/point/last-week/${name}`,
  );
  const npmDownloadsJson =
    (await npmDownloadsRes.json()) as NpmPackageDownloadCount;
  return npmDownloadsJson;
}

const app = new Hono();

app.use(
  '*',
  cache({
    cacheName: 'npm-pkg-api',
    cacheControl: 'max-age=86400, stale-while-revalidate=3600',
  }),
);

export const apiRoute = app.get(
  '/npm',
  rateLimit({
    max: 500,
    ttl: 1000 * 60 * 5, // 5分
    limit: 30,
  }),
  validator('query', (value) => {
    const name = value.name;
    if (!name || typeof name !== 'string') {
      throw new HTTPException(400, { message: 'Package name is required.' });
    }
    return {
      name,
    };
  }),
  async (c) => {
    const { name } = c.req.valid('query');

    const npmPkgRes = await fetch(`https://registry.npmjs.org/${name}`, {
      method: 'GET',
    });

    if (!npmPkgRes.ok) {
      throw new HTTPException(404, { message: 'Package not found.' });
    }
    const pkg = (await npmPkgRes.json()) as NpmPackage;

    // latest version
    const latest = pkg['dist-tags'].latest;
    const publishedAt = pkg.time[latest];

    const githubRepo = getGitHubRepoFromRepository(pkg.repository);

    if (!githubRepo) {
      // package.jsonにrepositoryの情報がない
      const downloads = await getDonwloads(name);

      return c.json({
        latest: {
          version: latest,
          publishedAt,
        },
        downloads: downloads.downloads,
        contributors: undefined,
        github: undefined,
      });
    } else {
      const { owner, repo } = githubRepo;

      const [downloads, contributors] = await Promise.all([
        getDonwloads(name),
        getContributorCount(owner, repo),
      ]);

      return c.json({
        latest: {
          version: latest,
          publishedAt,
        },
        downloads: downloads.downloads,
        contributors: contributors ?? undefined,
        github: `https://github.com/${owner}/${repo}`,
      });
    }
  },
);

app.onError((err, c) => {
  if (err instanceof HTTPException) return err.getResponse();
  return c.json({ message: err.message }, 500);
});

export type AppType = typeof apiRoute;
