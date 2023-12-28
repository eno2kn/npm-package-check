import { memo, useState } from 'react';
import { ExternalLink } from './link';
import { cn } from '../lib/utils';

export const SocketBadge: React.FC<{
  name: string;
}> = ({ name }) => {
  const [isError, setError] = useState(false);

  return (
    <ExternalLink
      href={`https://socket.dev/npm/package/${name}`}
      className={cn([isError && 'hidden'])}
    >
      <img
        src={`https://socket.dev/api/badge/npm/package/${name}`}
        alt="socket"
        referrerPolicy="no-referrer"
        onError={() => {
          setError(true);
        }}
      />
    </ExternalLink>
  );
};

export const SnykBadge: React.FC<{
  name: string;
}> = ({ name }) => {
  const [isError, setError] = useState(false);

  return (
    <ExternalLink
      href={`https://snyk.io/advisor/npm-package/${name}`}
      className={cn([isError && 'hidden'])}
    >
      <img
        src={`https://snyk.io//advisor/npm-package/${name}/badge.svg`}
        alt="snyk"
        referrerPolicy="no-referrer"
        onError={() => {
          setError(true);
        }}
      />
    </ExternalLink>
  );
};

export const Badges: React.FC<{
  name: string;
}> = memo(function Badges({ name }) {
  return (
    <div className="flex gap-2 min-h-5">
      <SocketBadge name={name} />
      <SnykBadge name={name} />
    </div>
  );
});
