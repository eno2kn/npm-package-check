import { useCallback, useState } from 'react';

const githubGetHeaders = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
};

export type ContributorData = object;

/**
 * @see https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#list-repository-contributors
 */
async function listContributors(owner: string, repo: string, page: number = 1) {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=100&page=${page}`,
    {
      method: 'GET',
      headers: githubGetHeaders,
    },
  );

  const contributorsList = (await res.json()) as ContributorData[];
  return contributorsList;
}

export const useGitHubRepoContributors = () => {
  const [isLoading, setLoading] = useState(false);
  const [data, setData] = useState<ContributorData[] | undefined>();

  const mutate = useCallback(async (owner: string, repo: string) => {
    setLoading(true);

    const contributors: ContributorData[] = [];
    let page = 1;
    let list;
    do {
      list = await listContributors(owner, repo, page);
      contributors.push(...list);
      page++;
    } while (list.length > 0);

    setData(contributors);
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
