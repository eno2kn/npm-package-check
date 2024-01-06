import { memo, useState } from 'react';
import { ExternalLink } from './link';
import { cn } from '../lib/utils';

const Badge: React.FC<{
  href: string;
  src: string;
  alt: string;
}> = ({ href, src, alt }) => {
  const [isError, setError] = useState(false);

  return (
    <ExternalLink href={href} className={cn([isError && 'hidden'])}>
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => {
          setError(true);
        }}
      />
    </ExternalLink>
  );
};

const SocketBadge: React.FC<{
  name: string;
}> = ({ name }) => {
  return (
    <Badge
      href={`https://socket.dev/npm/package/${name}`}
      src={`https://socket.dev/api/badge/npm/package/${name}`}
      alt="socket"
    />
  );
};

const SnykBadge: React.FC<{
  name: string;
}> = ({ name }) => {
  return (
    <Badge
      href={`https://snyk.io/advisor/npm-package/${name}`}
      src={`https://snyk.io//advisor/npm-package/${name}/badge.svg`}
      alt="snyk"
    />
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
