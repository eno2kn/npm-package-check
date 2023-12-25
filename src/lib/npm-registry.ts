import { useCallback, useState } from 'react';

/**
 * @see https://github.com/npm/registry/blob/master/docs/responses/package-metadata.md
 */
export type NpmPackage = {
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
    /**
     * モノレポの場合
     */
    directory?: string;
  };
};

/**
 * @see https://github.com/npm/registry/blob/master/docs/REGISTRY-API.md#package-endpoints
 */
export async function getNpmPackage(name: string) {
  try {
    const res = await fetch(`https://registry.npmjs.org/${name}`, {
      method: 'GET',
    });

    if (!res.ok) {
      switch (res.status) {
        case 404: {
          return null;
        }
      }
    }
    const pkg = (await res.json()) as NpmPackage;
    return pkg;
  } catch (error) {
    return null;
  }
}

export function parsePackageJSONRepository(pkg: NpmPackage) {
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

export const useNpmPackage = () => {
  const [isLoading, setLoading] = useState(false);
  const [data, setData] = useState<NpmPackage | undefined>();

  const mutate = useCallback(async (info: NpmPackage) => {
    setLoading(true);
    setData(info);
    setLoading(false);
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setData(undefined);
  }, []);

  return {
    isLoading,
    data,
    mutate,
    reset,
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

export const useNpmPackageDownloadCount = () => {
  const [isLoading, setLoading] = useState(false);
  const [data, setData] = useState<NpmPackageDownloadCount | undefined>();

  const mutate = useCallback(async (name: string) => {
    setLoading(true);
    const res = await fetch(
      `https://api.npmjs.org/downloads/point/last-month/${name}`,
    );
    const json = (await res.json()) as NpmPackageDownloadCount;
    setData(json);
    setLoading(false);
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setData(undefined);
  }, []);

  return {
    isLoading,
    data,
    mutate,
    reset,
  };
};
