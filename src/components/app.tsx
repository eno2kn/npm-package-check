import { useCallback, useMemo, useState } from 'react';
import { hc } from 'hono/client';
import { AppType } from '../api';
import { Result, Status } from './result';
import { Badges } from './badge';

type NpmPkgData = {
  latest:
    | {
        version: string;
        publishedAt: string;
      }
    | undefined;
  downloads: number | undefined;
  contributors: number | undefined;
};
type StatusWithoutLoading = Exclude<Status, 'loading'>;

function calcStatus<T>(
  value: T | undefined,
  checkError: (v: T) => boolean,
): StatusWithoutLoading {
  if (value) {
    if (checkError(value)) {
      return 'error';
    } else {
      return 'success';
    }
  } else {
    return 'initial';
  }
}

export const App: React.FC = () => {
  const [inputPkgName, setInputPkgName] = useState('');
  const [pkgName, setPkgName] = useState('');

  const [data, setData] = useState<NpmPkgData>({
    downloads: undefined,
    contributors: undefined,
    latest: undefined,
  });

  const [isLoading, setLoading] = useState(false);
  const [isError, setError] = useState(false);
  const downloadsStatus = useMemo(
    () => calcStatus(data.downloads, (v) => v < 1000),
    [data],
  );
  const contributorsStatus = useMemo(
    () => calcStatus(data.contributors, (v) => v < 3),
    [data],
  );
  const latestStatus = useMemo(
    () =>
      calcStatus(
        data.latest,
        (v) =>
          Date.now() - new Date(v.publishedAt).getTime() >
          1000 * 60 * 60 * 24 * 365,
      ),
    [data],
  );

  const getStatus = useCallback(
    (st: Exclude<Status, 'loading'>): Status => {
      return isLoading ? 'loading' : st;
    },
    [isLoading],
  );

  const client = hc<AppType>('/');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputPkgName) return;

    setLoading(true);
    setError(false);
    setPkgName('');
    setData({
      latest: undefined,
      downloads: undefined,
      contributors: undefined,
    });

    const res = await client.api.npm.$get({
      query: { name: inputPkgName },
    });

    if (!res.ok) {
      setLoading(false);
      setError(true);
      return;
    }
    setPkgName(inputPkgName);

    const json = await res.json();
    const { latest, downloads, contributors } = json;

    setData({
      latest,
      downloads,
      contributors,
    });
    setLoading(false);
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
            disabled={!inputPkgName}
          >
            チェック
          </button>
        </div>
      </form>
      {isError && (
        <div className="mb-6 p-4 rounded border border-red-300 bg-red-50">
          エラーが発生しました
        </div>
      )}
      {!isLoading && pkgName && (
        <div className="mb-6">
          <div className="mb-2 text-lg font-semibold">{pkgName}</div>
          <Badges name={pkgName} />
        </div>
      )}
      <div className="flex flex-col gap-4">
        <Result
          label="1ヶ月のダウンロード数"
          value={data.downloads}
          status={getStatus(downloadsStatus)}
        />
        <Result
          label="Contributorの数"
          value={data.contributors}
          status={getStatus(contributorsStatus)}
        />
        <Result
          label="最新バージョンのリリース日"
          value={
            data.latest &&
            `v${data.latest.version} ${new Date(
              data.latest.publishedAt,
            ).toLocaleDateString('ja-JP')}`
          }
          status={getStatus(latestStatus)}
        />
      </div>
    </div>
  );
};
