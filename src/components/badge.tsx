import { memo } from 'react';
import { ExternalLink } from './link';

export const SocketBadge: React.FC<{
  name: string;
}> = ({ name }) => {
  return (
    <ExternalLink href={`https://socket.dev/npm/package/${name}`}>
      <img
        src={`https://socket.dev/api/badge/npm/package/${name}`}
        alt="socket"
        referrerPolicy="no-referrer"
      />
    </ExternalLink>
  );
};

export const SnykBadge: React.FC<{
  name: string;
}> = ({ name }) => {
  return (
    <ExternalLink href={`https://snyk.io/advisor/npm-package/${name}`}>
      <img
        src={`https://snyk.io//advisor/npm-package/${name}/badge.svg`}
        alt="snyk"
        referrerPolicy="no-referrer"
      />
    </ExternalLink>
  );
};

export const Badges: React.FC<{
  name: string;
}> = memo(function Badges({ name }) {
  return (
    <div className="flex gap-2">
      <SocketBadge name={name} />
      <SnykBadge name={name} />
    </div>
  );
});
