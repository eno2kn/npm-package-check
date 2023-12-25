import { useState } from 'react';
import {
  ContributorsResult,
  DownloadCountResult,
  LatestVersionPublishedAtResult,
} from './result';
import {
  getNpmPackage,
  parsePackageJSONRepository,
  useNpmPackage,
  useNpmPackageDownloadCount,
} from '../lib/npm-registry';
import { useGitHubRepoContributors } from '../lib/github';

export const App: React.FC = () => {
  const [inputPkgName, setInputPkgName] = useState('astro');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    isLoading: isNpmPkgLoading,
    data: npmPkg,
    mutate: mutateNpmPkg,
    reset: resetNpmPkg,
  } = useNpmPackage();
  const {
    isLoading: isNpmPkgDownloadCountLoading,
    data: npmPkgDownloadCount,
    mutate: mutateNpmPkgDownloadCount,
    reset: resetNpmPkgDownloadCount,
  } = useNpmPackageDownloadCount();
  const {
    isLoading: isContributorsLoading,
    data: contributors,
    mutate: mutateContributors,
    reset: resetContributors,
  } = useGitHubRepoContributors();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    // npm registry APIからパッケージについての情報を取得する
    const npmPackageInfo = await getNpmPackage(inputPkgName);
    // npmに該当するパッケージがない
    if (!npmPackageInfo) {
      setErrorMessage('指定されたパッケージが存在しません');
      resetNpmPkgDownloadCount();
      resetContributors();
      resetNpmPkg();
      return;
    }
    const pkgName = inputPkgName;

    const promises: unknown[] = [
      // 最新バージョンの公開日をチェック
      await mutateNpmPkg(npmPackageInfo),
      // ここ1ヶ月の総ダウンロード数を取得する
      await mutateNpmPkgDownloadCount(pkgName),
    ];

    // githubリポジトリのURLを取得する
    const githubRepo = parsePackageJSONRepository(npmPackageInfo);
    if (!githubRepo) {
      // package.jsonにrepositoryの情報がない
      setErrorMessage('package.jsonにrepositoryの情報がありません');
      resetContributors();
    } else {
      const { owner, repo } = githubRepo;

      // コントリビューター数をチェック
      promises.push(await mutateContributors(owner, repo));
    }

    Promise.allSettled(promises);
  };

  return (
    <div className="px-6 py-8 max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex border border-gray-300 rounded overflow-hidden focus-within:ring-2 focus-within:ring-sky-500/30">
          <input
            type="text"
            value={inputPkgName}
            onChange={(e) => setInputPkgName(e.target.value)}
            className="w-full px-3 py-2 focus-visible:outline-none"
          />
          <button
            type="submit"
            className="border-l border-gray-300 whitespace-nowrap px-3"
          >
            チェック
          </button>
        </div>
      </form>
      {errorMessage && (
        <div className="mb-6 p-4 rounded border border-red-300 bg-red-50">
          {errorMessage}
        </div>
      )}
      <div className="flex flex-col gap-4">
        <DownloadCountResult
          loading={isNpmPkgDownloadCountLoading}
          downloadCount={npmPkgDownloadCount}
        />
        <ContributorsResult
          loading={isContributorsLoading}
          contributors={contributors}
        />
        <LatestVersionPublishedAtResult
          loading={isNpmPkgLoading}
          npmPackage={npmPkg}
        />
      </div>
    </div>
  );
};
