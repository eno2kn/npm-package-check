import { useCallback, useMemo, useState } from 'react';
import { hc } from 'hono/client';
import { AppType } from '../api';
import { Result, Status } from './result';
import { Badges } from './badge';
import { ExternalLink } from './link';

type NpmPkgData = {
  latest:
    | {
        version: string;
        publishedAt: string;
      }
    | undefined;
  downloads: number | undefined;
  contributors: number | undefined;
  github: string | undefined;
};

const initialData = {
  downloads: undefined,
  latest: undefined,
  contributors: undefined,
  github: undefined,
};

export const App: React.FC = () => {
  const [inputPkgName, setInputPkgName] = useState('');
  const [pkgName, setPkgName] = useState('');

  const [data, setData] = useState<NpmPkgData>(initialData);

  const [isLoading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getStatus = useCallback(
    <T,>(value: T | undefined, isSuccess: (v: T) => boolean): Status => {
      if (isLoading) return 'loading';
      if (value) return isSuccess(value) ? 'success' : 'error';
      return 'initial';
    },
    [isLoading],
  );

  const downloadsStatus = useMemo(
    () => getStatus(data.downloads, (v) => v >= 500),
    [getStatus, data.downloads],
  );
  const latestStatus = useMemo(
    () =>
      getStatus(
        data.latest,
        (v) =>
          Date.now() - new Date(v.publishedAt).getTime() <
          1000 * 60 * 60 * 24 * 365,
      ),
    [getStatus, data.latest],
  );
  const contributorsStatus = useMemo(
    () => getStatus(data.contributors, (v) => v >= 3),
    [getStatus, data.contributors],
  );

  const client = hc<AppType>('/');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputPkgName) return;

    setLoading(true);
    setErrorMessage(null);
    setPkgName('');
    setData(initialData);

    const res = await client.api.npm.$get({
      query: { name: inputPkgName },
    });

    if (!res.ok) {
      setLoading(false);
      switch (res.status) {
        case 404:
          setErrorMessage('パッケージが存在しません。');
          break;
        case 429:
          setErrorMessage(
            'リクエスト数の上限に達しました。時間をあけて再度お試しください。',
          );
          break;
        default:
          setErrorMessage('エラーが発生しました。');
          break;
      }
      return;
    }
    setPkgName(inputPkgName);

    const json = await res.json();
    const { latest, downloads, contributors, github } = json;

    setData({
      latest,
      downloads,
      contributors,
      github,
    });
    setLoading(false);
  };

  return (
    <div className="px-6 py-8 max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex border border-gray-300 rounded overflow-hidden focus-within:ring-2 focus-within:ring-sky-500/30">
          <label htmlFor="package-name" className="sr-only">
            パッケージ名
          </label>
          <input
            type="text"
            id="package-name"
            value={inputPkgName}
            onChange={(e) => setInputPkgName(e.target.value)}
            className="w-full px-3 py-2 focus-visible:outline-none"
          />
          <button
            type="submit"
            className="border-l border-gray-300 whitespace-nowrap px-3 disabled:opacity-50"
            disabled={!inputPkgName || isLoading}
          >
            チェック
          </button>
        </div>
      </form>
      {errorMessage && (
        <div className="flex gap-3 mb-6 p-4 rounded border border-red-300 bg-red-50">
          <svg
            viewBox="0 0 24 24"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 w-6 h-6 text-red-400"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              className="fill-current stroke-current"
            />
            <line
              x1="12"
              x2="12"
              y1="8"
              y2="12"
              className="fill-none stroke-red-50"
            />
            <line
              x1="12"
              x2="12.01"
              y1="16"
              y2="16"
              className="fill-none stroke-red-50"
            />
          </svg>
          <p>{errorMessage}</p>
        </div>
      )}
      {pkgName && (
        <div className="mb-6">
          <div className="mb-2">
            <span className="text-lg font-semibold">{pkgName}</span>
            {data.latest && (
              <span className="text-base ml-2">v{data.latest.version}</span>
            )}
          </div>
          <div className="flex gap-4 mb-4 text-sm">
            <ExternalLink
              href={`https://www.npmjs.com/package/${pkgName}`}
              className="flex items-center gap-2"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-3 h-3 fill-current"
                aria-hidden="true"
              >
                <path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.04 19.17H5.113z" />
              </svg>
              npm
            </ExternalLink>
            {data.github && (
              <ExternalLink
                href={data.github}
                className="flex items-center gap-2"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-3 h-3 fill-current"
                  aria-hidden="true"
                >
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
                GitHub
              </ExternalLink>
            )}
          </div>
          <Badges name={pkgName} />
        </div>
      )}
      <div className="flex flex-col gap-4">
        <Result
          label="週間ダウンロード数"
          value={data.downloads}
          status={downloadsStatus}
        />
        <Result
          label="最新バージョンのリリース日"
          value={
            data.latest &&
            new Date(data.latest.publishedAt).toLocaleDateString('ja-JP')
          }
          status={latestStatus}
        />
        <Result
          label="コントリビューターの人数"
          value={data.contributors}
          status={contributorsStatus}
          counter="人"
        />
      </div>
    </div>
  );
};
