import { Hono } from 'hono';
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

/**
 * @see https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#list-repository-contributors
 */
async function listContributors(owner: string, repo: string, page: number = 1) {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=100&page=${page}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        // https://docs.github.com/ja/rest/using-the-rest-api/troubleshooting-the-rest-api?apiVersion=2022-11-28#user-agent-required
        'User-Agent': 'npm-package-check',
      },
    },
  );

  const contributorsList = (await res.json()) as unknown[];
  return contributorsList;
}

async function getAllContributors(owner: string, repo: string) {
  const contributors: unknown[] = [];
  let page = 1;
  let list: unknown[];
  do {
    list = await listContributors(owner, repo, page);
    contributors.push(...list);
    page++;
  } while (list.length > 0);
  return contributors;
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

export const npmRoute = app.get(
  '/',
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

    // npm registry API
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
        getAllContributors(owner, repo),
      ]);

      return c.json({
        latest: {
          version: latest,
          publishedAt,
        },
        downloads: downloads.downloads,
        contributors: contributors.length,
        github: `https://github.com/${owner}/${repo}`,
      });
    }
  },
);

app.onError((err, c) => {
  if (err instanceof HTTPException) return err.getResponse();
  return c.json({ message: err.message }, 500);
});
