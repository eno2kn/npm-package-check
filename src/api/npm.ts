import { Hono } from 'hono';
import { validator } from 'hono/validator';
import { HTTPException } from 'hono/http-exception';

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
    type: 'git';
    /**
     * @example
     *  - `https://github.com/{owner}/{repo}.git`
     *  - `git+https://github.com/{owner}/{repo}.git`
     *  - `git+ssh://git@github.com/{owner}/{repo}.git`
     *  - `git+ssh://git@github.com/{owner}/{repo}.git`
     *  - `github:{owner}/{repo}`
     */
    url: string;
    /** モノレポの場合 */
    directory?: string;
  };
};

/**
 * @see https://github.com/npm/registry/blob/master/docs/download-counts.md
 */
export type NpmPackageDownloadCount = {
  downloads: number;
  start: string;
  end: string;
  package: string;
};

function parsePackageJSONRepository(pkg: NpmPackage) {
  const repo = pkg.repository;
  if (!repo) {
    return null;
  }
  const repoURL = repo.url;
  const dir = repo.directory;

  const pattern1 =
    /^(git\+)?https:\/\/github.com\/(?<owner>.+?)\/(?<repo>.+?).git$/.exec(
      repoURL,
    );
  if (pattern1) {
    const owner = pattern1.groups?.owner;
    const repo = pattern1.groups?.repo;

    return owner && repo ? { owner, repo, dir } : null;
  }

  const pattern2 =
    /^(git\+)?ssh:\/\/git@github.com\/(?<owner>.+?)\/(?<repo>.+?).git$/.exec(
      repoURL,
    );
  if (pattern2) {
    const owner = pattern2.groups?.owner;
    const repo = pattern2.groups?.repo;

    return owner && repo ? { owner, repo, dir } : null;
  }

  const pattern3 = /^github:(?<owner>.+?)\/(?<repo>.+?)$/.exec(repoURL);
  if (pattern3) {
    const owner = pattern3.groups?.owner;
    const repo = pattern3.groups?.repo;

    return owner && repo ? { owner, repo, dir } : null;
  }

  return null;
}

type ContributorData = object;

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

  const contributorsList = (await res.json()) as ContributorData[];
  return contributorsList;
}

async function getAllContributors(owner: string, repo: string) {
  const contributors: ContributorData[] = [];
  let page = 1;
  let list: ContributorData[];
  do {
    list = await listContributors(owner, repo, page);
    contributors.push(...list);
    page++;
  } while (list.length > 0);
  return contributors;
}

async function getDonwloads(name: string) {
  const npmDownloadsRes = await fetch(
    `https://api.npmjs.org/downloads/point/last-month/${name}`,
  );
  const npmDownloadsJson =
    (await npmDownloadsRes.json()) as NpmPackageDownloadCount;
  return npmDownloadsJson;
}

export const app = new Hono();

export const npmRoute = app.get(
  '/',
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
      throw new HTTPException(400, { message: 'Package not found.' });
    }
    const pkg = (await npmPkgRes.json()) as NpmPackage;

    // latest version
    const latest = pkg['dist-tags'].latest;
    const publishedAt = pkg.time[latest];

    const githubRepo = parsePackageJSONRepository(pkg);

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
      });
    }
  },
);

app.onError((err, c) => {
  if (err instanceof HTTPException) return err.getResponse();
  return c.json({ message: err.message }, 500);
});
