import { useMemo } from 'react';
import { NpmPackageResult } from './npm-package-result';
import { cn } from '../lib/utils';
import type { ContributorData } from '../lib/github';
import type { NpmPackageDownloadCount, NpmPackage } from '../lib/npm-registry';

type NpmPackageDownloadCountProps = {
  loading: boolean;
  downloadCount: NpmPackageDownloadCount | undefined;
};

export const DownloadCountResult: React.FC<NpmPackageDownloadCountProps> = ({
  loading,
  downloadCount,
}) => {
  const { status, count } = useMemo(() => {
    if (loading) {
      return { status: 'loading', count: undefined } as const;
    }
    if (typeof downloadCount === 'undefined') {
      return { status: 'initial', count: undefined } as const;
    }
    const count = downloadCount.downloads;
    if (count < 1000) {
      return { status: 'error', count } as const;
    }
    return { status: 'success', count } as const;
  }, [downloadCount, loading]);

  return (
    <NpmPackageResult.Container
      className={cn([status === 'initial' && 'opacity-50'])}
    >
      <NpmPackageResult.Icon status={status} />
      <NpmPackageResult.Content>
        <NpmPackageResult.Label>1ヶ月のダウンロード数</NpmPackageResult.Label>
        <NpmPackageResult.Result value={count}>{count}</NpmPackageResult.Result>
      </NpmPackageResult.Content>
    </NpmPackageResult.Container>
  );
};

type ContributorsResultProps = {
  loading: boolean;
  contributors: ContributorData[] | undefined;
};

export const ContributorsResult: React.FC<ContributorsResultProps> = ({
  loading,
  contributors,
}) => {
  const { status, count } = useMemo(() => {
    if (loading) {
      return { status: 'loading', count: undefined } as const;
    }
    if (typeof contributors === 'undefined') {
      return { status: 'initial', count: undefined } as const;
    }
    const count = contributors.length;
    if (count < 3) {
      return { status: 'error', count } as const;
    }
    return { status: 'success', count } as const;
  }, [contributors, loading]);

  return (
    <NpmPackageResult.Container
      className={cn([status === 'initial' && 'opacity-50'])}
    >
      <NpmPackageResult.Icon status={status} />
      <NpmPackageResult.Content>
        <NpmPackageResult.Label>Contributorの数</NpmPackageResult.Label>
        <NpmPackageResult.Result value={count}>{count}</NpmPackageResult.Result>
      </NpmPackageResult.Content>
    </NpmPackageResult.Container>
  );
};

type LatestVersionPublishedAtResultProps = {
  loading: boolean;
  npmPackage: NpmPackage | undefined;
};

export const LatestVersionPublishedAtResult: React.FC<
  LatestVersionPublishedAtResultProps
> = ({ loading, npmPackage }) => {
  const formatter = new Intl.DateTimeFormat('ja-JP');
  const { status, publishedAt, latest } = useMemo(() => {
    if (loading) {
      return {
        status: 'loading',
        publishedAt: undefined,
        latest: undefined,
      } as const;
    }
    if (typeof npmPackage === 'undefined') {
      return {
        status: 'initial',
        publishedAt: undefined,
        latest: undefined,
      } as const;
    }
    const latest = npmPackage['dist-tags'].latest;
    const publishedAt = new Date(npmPackage.time[latest]);
    if (Date.now() - publishedAt.getTime() > 1000 * 60 * 60 * 24 * 365) {
      return { status: 'error', publishedAt, latest } as const;
    }
    return { status: 'success', publishedAt, latest } as const;
  }, [loading, npmPackage]);

  return (
    <NpmPackageResult.Container
      className={cn([status === 'initial' && 'opacity-50'])}
    >
      <NpmPackageResult.Icon status={status} />
      <NpmPackageResult.Content>
        <NpmPackageResult.Label>
          最新バージョンのリリース日
        </NpmPackageResult.Label>
        <NpmPackageResult.Result value={latest && publishedAt}>
          {`v${latest} ${formatter.format(publishedAt)}`}
        </NpmPackageResult.Result>
      </NpmPackageResult.Content>
    </NpmPackageResult.Container>
  );
};
