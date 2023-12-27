export const NpmVersionBadge: React.FC<{
  name: string;
}> = ({ name }) => {
  return (
    <a
      href={`https://www.npmjs.com/package/${name}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <img
        src={`https://badge.fury.io/js/${encodeURIComponent(name)}.svg`}
        alt="npm version"
        referrerPolicy="no-referrer"
      />
    </a>
  );
};

export const SocketBadge: React.FC<{
  name: string;
}> = ({ name }) => {
  return (
    <a
      href={`https://socket.dev/npm/package/${name}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <img
        src={`https://socket.dev/api/badge/npm/package/${name}`}
        alt="socket"
        referrerPolicy="no-referrer"
      />
    </a>
  );
};

export const SnykBadge: React.FC<{
  name: string;
}> = ({ name }) => {
  return (
    <a
      href={`https://snyk.io/advisor/npm-package/${name}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <img
        src={`https://snyk.io//advisor/npm-package/${name}/badge.svg`}
        alt="snyk"
        referrerPolicy="no-referrer"
      />
    </a>
  );
};

export const Badges: React.FC<{
  name: string;
}> = ({ name }) => {
  return (
    <div className="flex gap-2">
      <NpmVersionBadge name={name} />
      <SocketBadge name={name} />
      <SnykBadge name={name} />
    </div>
  );
};
